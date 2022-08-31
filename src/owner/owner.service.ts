import { Injectable, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { IService } from '../common/IService';
import { Not } from 'typeorm';
import * as crypto from 'crypto-js';
import { format } from 'date-fns';
import { Owner, OwnerLogin, OwnerPermission } from '../entities/owner';
import { LoginLog } from '../entities/eventlog';
import { Product, Stock } from '../entities/master';
import { parse, endOfDay, addYears } from 'date-fns';
import * as timezone from 'date-fns-tz';
import { Machine, MachineProduct, MachineStock } from '../entities/machine';
import { datatableNoData } from '../common/helper/requestHandler';
@Injectable()
export class OwnerService extends IService {

    findAOwner = async (params: any) => {
        const { ownerId, password, schema } = params; 
        const ds = await this.getEntityManager(schema);
        try {
            const owner =  await ds.getRepository(Owner).findOneOrFail({
                where: {
                    ON_OwnerID: ownerId,
                    ON_Active: true, 
                    ON_ExtraData: Not('{}')
                },
                relations: ['login', 'permissions']
            });
            if(password) {
                const hashed = String(crypto.SHA512(password)).toLowerCase();
                const checkPassword = owner.login.ONL_Password.toLowerCase() === hashed;
                if(!checkPassword) {
                    throw new UnauthorizedException('authentication fail');
                }
            }
            return owner;
        } catch(error) {
            throw new NotFoundException('user not found');
        }
    }

    getOwnerList = async (params: any) => {
        const { isActive, ownerId, ownerLogin, ownerName, userRole, start, length, sort, schema } = params;
        const ds = await this.getEntityManager(schema);
        let whereClause = 'JSON_VALUE(ON_ExtraData, \'$.Role\') is not null AND login.ONL_ExpireDate >= GETDATE()';
        let queryParameter = {};

        if(isActive !== undefined) {
            whereClause += ' AND ON_Active = :isActive';
            queryParameter = { ...queryParameter, isActive: Number(isActive) };
        }
        if(ownerId) {
            whereClause += ' AND ON_OwnerID like :ownerId';
            queryParameter = {...queryParameter, ownerId: `%${ownerId}%` }
        }
        if(ownerLogin) {
            whereClause += ' AND login.ONL_Login like :ownerLogin';
            queryParameter = { ...queryParameter, ownerLogin: `%${ownerLogin}%` }
        }
        if(ownerName) {
            whereClause += ' AND (ON_OwnerName like :ownerName OR ON_OwnerNameEng like :ownerName)';
            queryParameter = {...queryParameter, ownerName: `%${ownerName}%` }
        }
        if(userRole) {
            whereClause += ' AND JSON_VALUE(ON_ExtraData, \'$.Role\') = :userRole';
            queryParameter = {...queryParameter, userRole: userRole }
        }

        const sStart = start || 0;
        const sLength = length || 25;

        const count = await ds.getRepository(Owner).createQueryBuilder()
            .select('count(distinct ON_OwnerID) as total')
            .leftJoin(OwnerLogin, 'login', 'owner.ON_OwnerID = login.ONL_OwnerID')
            .where(whereClause, queryParameter)
            .getRawOne();
        
        if(!count) {
            return datatableNoData;
        }

        const qb = await ds.getRepository(Owner)
            .createQueryBuilder('owner')
            .leftJoinAndSelect('owner.login', 'login')
            .where(whereClause, queryParameter)
            .orderBy('ON_Lastupdate', 'DESC');
        
        if(sort && sort.length > 0) {
            sort.forEach((s) => {
                qb.addOrderBy(s.column, s.dir)
            })
        }
        
        const data = await qb.offset(sStart).limit(sLength).getMany();
       
        const rowData = data.map(d => {
            return {
                id: d.ON_OwnerID,
                loginName: d.login.ONL_Login,
                name: d.ON_OwnerName,
                nameEng: d.ON_OwnerNameEng,
                userRole: d.userRole,
                isActive: d.ON_Active,
                expireDate: format(endOfDay(d.login?.ONL_ExpireDate), 'yyyy-MM-dd HH:mm:ss'),
                lastUpdate: format(d.ON_Lastupdate, 'yyyy-MM-dd HH:mm:ss'),
                control: ''
            };
        })
         return { 
            page: sStart,
            recordsTotal: count?.total || 0,
            recordsFiltered: count?.total || 0,
            data: rowData
        };
    }

    getOwnerMachine = async (params: any) => {
        const { ownerId, schema } = params;
        const ds = await this.getEntityManager(schema);
        const qb = ds.getRepository(Machine).createQueryBuilder('machine')
                .leftJoinAndSelect('machine.type', 'type')
                .where('M_Active = 1')
                .orderBy('M_MachineID');
        if(ownerId) {
            return await qb.andWhere('M_MachineID in (select ONM_MachineID from Owner_Machine where ONM_OwnerID = :ownerId)', { ownerId: ownerId }).getMany();
        } else {
            return await qb.getMany();
        }
    }

    getOwnerProducts = async (params: any) => {
        const { ownerId, schema } = params;
        const ds = await this.getEntityManager(schema);
        const qb = ds.getRepository(Product).createQueryBuilder('products')
                    .leftJoinAndSelect('products.category', 'category')
                    .leftJoinAndSelect('products.detail', 'detail')
                    .where('MP_Active = 1 AND MP_ExtraData <> \'\'')
                    .orderBy('MP_ProductID');
        if(ownerId) {
            //const oProducts = await this.entityManager.query('select ONPL_ProductID from Owner_ProductList where ONPL_OwnerID = @0', [ownerId]);
            //return await qb.andWhere('MP_ProductID in (:...productIds)', { productIds: oProducts.map(p => p.ONPL_ProductID)}).getMany();
            return await ds.getRepository(MachineProduct).createQueryBuilder().where('MP_MachineID in (select ONM_MachineID from Owner_Machine where ONM_OwnerID = :ownerId)', { ownerId: ownerId }).getMany();
        } else {
            return await qb.getMany();
        }
    }

    getOwnerSkus = async (params: any) => {
        const { ownerId, schema } = params;
        const ds = await this.getEntityManager(schema);
        const qb = ds.getRepository(Stock).createQueryBuilder('stocks')
        .leftJoinAndSelect('stocks.category', 'category')
        .where('MS_Active = 1 AND MS_ExtraData <> \'{}\'')
        .orderBy('MS_StockCode');
        if(ownerId) {
            //const oSkus = await this.entityManager.query('select ONSL_StockCode from Owner_StockList where ONSL_OwnerID = @0', [ownerId]);
            //return await qb.andWhere('MS_StockCode in (:...stockCodes)', { stockCodes: oSkus.map(s => s.ONSL_StockCode )}).getMany();
            return await ds.getRepository(MachineStock).createQueryBuilder().where('MS_MachineID in (select ONM_MachineID from Owner_Machine where ONM_OwnerID = :ownerId)', { ownerId: ownerId }).getMany();
        } else {
            return await qb.getMany();
        }
    }

    insertLoginLog = async (ownerId: string, address: string, success: boolean, schema: string) => {
        try {
            const result = await this.entityManager.createQueryBuilder()
            .insert()
            .into(LoginLog)
            .values({
                action: `${ownerId} login [${schema}]`,
                statusCode: success ? 200 : 403,
                loginId: ownerId,
                detail: success ? 'Success' : 'Fail',
                ipAddress: address
            })
            .returning('INSERTED.*')
            .execute();
            return result;
        } catch(error) {
            return null
        }
        
    }

    updateOwner = async (params: any) => {
        const { owner, machineIds, schema } = params;
        const { ON_OwnerID, ONL_Login } = owner;
        const ds = await this.getEntityManager(schema);
        const entity = owner;
        if(owner.userRole) {
            entity.ON_ExtraData = { Role: owner.userRole, Type: owner.userRole === 'SuperAdmin' ? 'Admin': 'User', FirstLogin: 0 }
        }
        let alogin = await ds.getRepository(OwnerLogin).createQueryBuilder().where('ONL_OwnerID = :ownerId', { ownerId: ON_OwnerID }).getOne();
        if(!alogin){
            alogin = new OwnerLogin();
            alogin.ONL_Active = true;
            alogin.ONL_OwnerID = ON_OwnerID;
            alogin.ONL_Login = ONL_Login;
        }
        if(owner.ONL_Password) {
            alogin.ONL_Password = String(crypto.SHA512(owner.ONL_Password));
        }
        if(owner.ONL_ExpireDate) {
            alogin.ONL_ExpireDate = timezone.utcToZonedTime(parse(owner.ONL_ExpireDate, 'dd-MM-yyyy', new Date()), 'Asia/Hong_Kong');
        }
        if(!alogin.ONL_ExpireDate && !owner.ONL_ExpireDate){ 
            alogin.ONL_ExpireDate = timezone.utcToZonedTime(addYears(new Date(), 10), 'Asia/Hong_Kong');
        }
        
        entity.ON_Lastupdate = timezone.utcToZonedTime(new Date(), 'Asia/Hong_Kong');
        if(machineIds) {
            const machines = await ds.getRepository(Machine).createQueryBuilder()
                .where('M_MachineID in (:...machineIds)', { machineIds: machineIds })
                .getMany();
                entity.machines = machines;
        }

        entity.login = alogin;
        try {
            return await ds.getRepository(Owner).save(entity);
        } catch (error) {
            throw error;
        }
    }

    updateOwnerPermission = async (params: any) => {
        const { permissions, schema } = params;
        const ds = await this.getEntityManager(schema);
        try {
            return await ds.getRepository(OwnerPermission).save(permissions);
        } catch (error) {
            throw error;
        }
    }

    deleteOwner =async (params: any) => {
        const { ownerId, schema } = params;
        const ds = await this.getEntityManager(schema);
        try {
            const owner = await this.findAOwner(ownerId);
            owner.ON_Active = false;
            owner.login.ONL_Active = false;
            await ds.delete(OwnerPermission, owner.permissions);
            return await ds.getRepository(Owner).save(owner);
        } catch(error) {
            throw error;
        }
    }
}
