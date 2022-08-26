import { Injectable, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { InjectEntityManager } from '@nestjs/typeorm';
import { EntityManager, ILike, MoreThan, Not, IsNull, MoreThanOrEqual } from 'typeorm';
import * as crypto from 'crypto-js';
import { format } from 'date-fns';
import { Owner, OwnerLogin, OwnerPermission } from '../entities/owner';
import { LoginLog } from '../entities/eventlog';
import { Product, Stock } from '../entities/master';
import { parse, endOfDay, addYears } from 'date-fns';
import * as timezone from 'date-fns-tz';
import { Machine } from '../entities/machine';
import { datatableNoData } from '../common/helper/requestHandler';
@Injectable()
export class OwnerService {

    constructor(
        @InjectEntityManager() private readonly entityManager: EntityManager
    ) {}

    getLoginUser = async (loginName: string, password: string) => {
        const whereClause = 'ONL_Login = :loginId AND ONL_Active = 1 AND ONL_ExpireDate >=:lDate';
        const queryParameter = { loginId: loginName, lDate: format(new Date(), 'yyyy-MM-dd HH:mm:ss') };
        const hashed = String(crypto.SHA512(password));
        let loginCredential;
        try {
            loginCredential = await this.entityManager.getRepository(OwnerLogin)
                .createQueryBuilder()
                .select()
                .where(whereClause, queryParameter)
                .getOneOrFail();
        } catch(error) {
            throw new UnauthorizedException('user not found')
        }
        const passwordMatch = hashed.toLowerCase() === loginCredential.ONL_Password.toLowerCase();
        if (!passwordMatch) {
            throw new UnauthorizedException('authentication fail');
        }
        return await this.getAOwner(loginName);
    }

    getAOwner = async (ownerId: string) => { 
        try {
            const owner =  await this.entityManager.getRepository(Owner).findOneOrFail({
                where: {
                    ON_OwnerID: ownerId,
                    ON_Active: true, 
                    ON_ExtraData: Not('{}')
                },
                relations: ['login', 'permissions']
            });
            return owner;
        } catch(error) {
            throw new NotFoundException('user not found');
        }
    }

    getOwnerList = async (params: any) => {
        const { isActive, ownerId, ownerLogin, ownerName, userRole, start, length, sort } = params;
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

        const count = await this.entityManager.getRepository(Owner).createQueryBuilder()
            .select('count(distinct ON_OwnerID) as total')
            .leftJoin(OwnerLogin, 'login', 'owner.ON_OwnerID = login.ONL_OwnerID')
            .where(whereClause, queryParameter)
            .getRawOne();
        
        if(!count) {
            return datatableNoData;
        }

        const qb = await this.entityManager.getRepository(Owner)
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
                expireDate: format(d.login?.ONL_ExpireDate, 'yyyy-MM-dd HH:mm:ss'),
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

    getOwnerMachine = async (ownerId?: string) => {
        const qb = this.entityManager.getRepository(Machine).createQueryBuilder('machine')
                .leftJoinAndSelect('machine.type', 'type')
                .where('M_Active = 1')
                .orderBy('M_MachineID');
        if(ownerId) {
            const oMachines = await this.entityManager.query('select ONM_MachineID from Owner_Machine where ONM_OwnerID = @0', [ownerId]);
            return await qb.andWhere('M_MachineID in (:...machineIds)', { machineIds: oMachines.map(m => m.ONM_MachineID)}).getMany();
        } else {
            return await qb.getMany();
        }
    }

    getOwnerProducts = async (ownerId?: string) => {
        const qb = this.entityManager.getRepository(Product).createQueryBuilder('products')
                    .leftJoinAndSelect('products.category', 'category')
                    .leftJoinAndSelect('products.detail', 'detail')
                    .where('MP_Active = 1 AND MP_ExtraData <> \'\'')
                    .orderBy('MP_ProductID');
        if(ownerId) {
            const oProducts = await this.entityManager.query('select ONPL_ProductID from Owner_ProductList where ONPL_OwnerID = @0', [ownerId]);
            return await qb.andWhere('MP_ProductID in (:...productIds)', { productIds: oProducts.map(p => p.ONPL_ProductID)}).getMany();
        } else {
            return await qb.getMany();
        }
    }

    getOwnerSkus = async (ownerId?: string) => {
        const qb = this.entityManager.getRepository(Stock).createQueryBuilder('stocks')
        .leftJoinAndSelect('stocks.category', 'category')
        .where('MS_Active = 1 AND MS_ExtraData <> \'{}\'')
        .orderBy('MS_StockCode');
        if(ownerId) {
            const oSkus = await this.entityManager.query('select ONSL_StockCode from Owner_StockList where ONSL_OwnerID = @0', [ownerId]);
            return await qb.andWhere('MS_StockCode in (:...stockCodes)', { stockCodes: oSkus.map(s => s.ONSL_StockCode )}).getMany();
        } else {
            return await qb.getMany();
        }
    }

    insertLoginLog = async (ownerId: string, address: string, success: boolean) => {
        const result = await this.entityManager.createQueryBuilder()
            .insert()
            .into(LoginLog)
            .values({
                action: 'Login Web Portal',
                statusCode: success ? 200 : 403,
                loginId: ownerId,
                detail: success ? 'Success' : 'Fail',
                ipAddress: address
            })
            .returning('INSERTED.*')
            .execute();
        return result;
    }

    updateOwner = async (params: any) => {
        const { ON_OwnerID, ONL_Login, ONL_Password, userRole, ONL_ExpireDate, machineIds } = params;
        const entity = params;
        if(userRole) {
            entity.ON_ExtraData = { Role: userRole, Type: userRole === 'SuperAdmin' ? 'Admin': 'User', FirstLogin: 0 }
        }
        let alogin = await this.entityManager.getRepository(OwnerLogin).createQueryBuilder().where('ONL_OwnerID = :ownerId', { ownerId: ON_OwnerID }).getOne();
        if(!alogin){
            alogin = new OwnerLogin();
            alogin.ONL_Active = true;
            alogin.ONL_OwnerID = ON_OwnerID;
            alogin.ONL_Login = ONL_Login;
        }
        if(ONL_Password) {
            alogin.ONL_Password = String(crypto.SHA512(ONL_Password));
        }
        if(ONL_ExpireDate) {
            alogin.ONL_ExpireDate = endOfDay(timezone.utcToZonedTime(parse(ONL_ExpireDate, 'dd-MM-yyyy', new Date()), 'Asia/Hong_Kong'));
        }
        if(!alogin.ONL_ExpireDate && !ONL_ExpireDate){ 
            alogin.ONL_ExpireDate = endOfDay(timezone.utcToZonedTime(addYears(new Date(), 10), 'Asia/Hong_Kong'));
        }
        
        if(userRole) {
            entity.ON_ExtraData = {Role: userRole, Type: userRole === 'SuperAdmin' ? 'Admin': 'User', FirstLogin: 0 };
        }
        entity.ON_Lastupdate = timezone.utcToZonedTime(new Date(), 'Asia/Hong_Kong');
        if(machineIds) {
            const machines = await this.entityManager.getRepository(Machine).createQueryBuilder()
                .where('M_MachineID in (:...machineIds)', { machineIds: machineIds })
                .getMany();
                entity.machines = machines;
        }
        //alogin.owner = entity;
        entity.login = alogin;
        try {
            return await this.entityManager.getRepository(Owner).save(entity);
        } catch (error) {
            throw error;
        }
    }

    updateOwnerPermission = async (params: any) => {
        try {
            return await this.entityManager.getRepository(OwnerPermission).save(params);
        } catch (error) {
            throw error;
        }
    }

    deleteOwner = async (ownerId: string) => {
        try {
            const owner = await this.getAOwner(ownerId);
            owner.ON_Active = false;
            owner.login.ONL_Active = false;
            await this.entityManager.delete(OwnerPermission, owner.permissions);
            return await this.entityManager.getRepository(Owner).save(owner);
        } catch(error) {
            throw error;
        }
    }
}
