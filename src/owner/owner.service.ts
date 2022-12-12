import { BadRequestException, Injectable, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { IService } from '../common/IService';
import * as crypto from 'crypto-js';
import { format } from 'date-fns';
import { Owner, OwnerLogin, OwnerPermission } from '../entities/owner';
import { LoginLog } from '../entities/eventlog';
import { Product, Stock } from '../entities/master';
import { parse, endOfDay, addYears } from 'date-fns';
import { Machine, MachineProduct, MachineStock } from '../entities/machine';
import { datatableNoData } from '../common/helper/requestHandler';
import { Campaign } from '../entities/campaign';
@Injectable()
export class OwnerService extends IService {

    findAOwner = async (params: any) => {
        const { loginId, password, schema } = params; 
        const ds = await this.getEntityManager(schema);
        try {
            const ownerLogin =  await ds.getRepository(OwnerLogin).findOneOrFail({
                where: {
                    ONL_Login: loginId,
                    ONL_Active: true
                },
                relations: ['owner','owner.permissions']
            });
            if(password) {
                const hashed = String(crypto.SHA512(password)).toLowerCase();
                const checkPassword = ownerLogin.ONL_Password.toLowerCase() === hashed;
                if(!checkPassword) {
                    throw new UnauthorizedException('authentication fail');
                }
            }

            return ownerLogin;
        } catch(error) {
            throw new NotFoundException(`user ${loginId} not found`);
        }
    }

    getOwnerList = async (params: any) => {
        const { isActive, ownerId, ownerLogin, ownerName, userRole, start, length, sort, schema, username } = params;
        const ds = await this.getEntityManager(schema);
        let whereClause = 'JSON_VALUE(owner.ON_ExtraData, \'$.Role\') is not null AND login.ONL_ExpireDate >= GETDATE()';
        let queryParameter = {};

        if(username) {
            whereClause += ' AND ONL_OwnerID <> :username';
            queryParameter = { ...queryParameter, username: username };
        }
        if(isActive !== undefined) {
            whereClause += ' AND ONL_Active = :isActive AND owner.ON_Active = :isActive';
            queryParameter = { ...queryParameter, isActive: Number(isActive) };
        }
        if(ownerId) {
            whereClause += ' AND owner.ON_OwnerID like :ownerId';
            queryParameter = {...queryParameter, ownerId: `%${ownerId}%` }
        }
        if(ownerLogin) {
            whereClause += ' AND ONL_Login like :ownerLogin';
            queryParameter = { ...queryParameter, ownerLogin: `%${ownerLogin}%` }
        }
        if(ownerName) {
            whereClause += ' AND (owner.ON_OwnerName like :ownerName OR owner.ON_OwnerNameEng like :ownerName)';
            queryParameter = {...queryParameter, ownerName: `%${ownerName}%` }
        }
        if(userRole) {
            whereClause += ' AND JSON_VALUE(owner.ON_ExtraData, \'$.Role\') = :userRole';
            queryParameter = {...queryParameter, userRole: userRole }
        }

        const sStart = start || 0;
        const sLength = length || 25;

        const count = await ds.getRepository(OwnerLogin).createQueryBuilder('login')
            .select('count(distinct login.ONL_Login) as total')
            .leftJoin(Owner, 'owner', 'owner.ON_OwnerID = login.ONL_OwnerID')
            .where(whereClause, queryParameter)
            .getRawOne();
        
        if(!count) {
            return datatableNoData;
        }

        const qb = await ds.getRepository(OwnerLogin)
            .createQueryBuilder('login')
            .leftJoinAndSelect('login.owner', 'owner')
            .where(whereClause, queryParameter);
            
        
        if(sort && sort.length > 0) {
            sort.forEach((s) => {
                qb.addOrderBy(s.column, s.dir)
            })
        } else {
            qb.orderBy('owner.ON_Lastupdate', 'DESC');
        }
        
        const data = await qb.offset(sStart).limit(sLength).getMany();
       
        const rowData = data.map(d => {
            const controls = `<a href="/owner/profile?loginId=${d.ONL_Login}" class="pe-3 action-icon"> <i class="fa fa-eye"></i></a>` + 
            `<a href="javascript:void(0);" class="action-icon" data-bs-attrid="${d.ONL_Login}" data-bs-action="delete-user" data-bs-title="Delete User" data-bs-toggle="modal" data-bs-target="#confirmModal"> <i class="mdi mdi-delete"></i></a>`;
            return {
                id: d.owner.ON_OwnerID,
                loginName: d.ONL_Login,
                name: d.owner.ON_OwnerName,
                nameEng: d.owner.ON_OwnerNameEng,
                userRole: d.owner.userRole,
                isActive: d.owner.ON_Active,
                expireDate: format(endOfDay(d.ONL_ExpireDate), 'yyyy-MM-dd HH:mm:ss'),
                lastUpdate: format(d.owner.ON_Lastupdate, 'yyyy-MM-dd HH:mm:ss'),
                control: controls
            }
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
            return await ds.getRepository(MachineProduct).createQueryBuilder()
            .select(['MP_ProductID','MP_ProductName', 'MP_UnitPrice'])
            .where('MP_MachineID in (select ONM_MachineID from Owner_Machine where ONM_OwnerID = :ownerId)', { ownerId: ownerId }).getRawMany();
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
    
    getOwnerCampaigns = async (params: any) => {
        const { ownerId, schema } = params;
        const ds = await this.getEntityManager(schema);
        if(ownerId) {
            return await ds.getRepository(Campaign).createQueryBuilder('campaign')
            .where('RC_CampaignID IN (select ONC_CampaignID from Owner_Campaign where ONC_OwnerID = :ownerId)', { ownerId: ownerId }).getMany();
        } else {
            return await ds.getRepository(Campaign).createQueryBuilder().where('RC_Active = 1').getMany();
        }
        
    }

    insertLoginLog = async (ownerId: string, address: string, success: boolean, schema: string) => {
        try {
            const ds = await this.getEntityManager(schema);
            const result = await ds.createQueryBuilder()
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

    checkIdIsUsed = async (params: any) => {
        const { schema, ownerId, loginId } = params;
        const ds = await this.getEntityManager(schema);
        try {
            const entity = await ds.getRepository(OwnerLogin).findOne({
                where: [
                    { ONL_OwnerID: ownerId },
                    { ONL_Login: loginId }
                ]
            })
            return entity !== null;
        } catch (error) {
            return false;
        }
    }

    updateOwner = async (params: any) => {
        const { owner, machineIds, campaignIds, schema } = params;
        const { ON_OwnerID, ONL_Login, ONL_Password, ONL_ExpireDate, userRole } = owner;
        const ds = await this.getEntityManager(schema);
        const entity = owner;
        
        if(userRole) {
            entity.ON_ExtraData = { Role: userRole, Type: userRole === 'SuperAdmin' ? 'Admin': 'User', FirstLogin: 0 }
        }

        let ownerLogin = await ds.getRepository(OwnerLogin).findOne({
            where: {
                ONL_Login: ONL_Login
            }
        })
        if(!ownerLogin){
            ownerLogin = new OwnerLogin();
            ownerLogin.ONL_Active = true;
            ownerLogin.ONL_OwnerID = ON_OwnerID;
            ownerLogin.ONL_Login = ONL_Login;
        }
        if(ONL_Password) {
            ownerLogin.ONL_Password = String(crypto.SHA512(ONL_Password));
        }
        if(ONL_ExpireDate) {
            ownerLogin.ONL_ExpireDate = parse(`${ONL_ExpireDate} 23:59:00`, 'yyyy-MM-dd HH:mm:ss', new Date());
        } else { 
            ownerLogin.ONL_ExpireDate = addYears(endOfDay(new Date()), 1);
        }
        
        entity.ON_Lastupdate = new Date();
        if(machineIds) {
            const machines = await ds.getRepository(Machine).createQueryBuilder()
                .where('M_MachineID in (:...machineIds)', { machineIds: machineIds })
                .getMany();
                entity.machines = machines;
        } else {
            entity.machines = null;
        }
        if(campaignIds) {
            const campaigns = await ds.getRepository(Campaign).createQueryBuilder()
                .where('RC_CampaignID in (:...campaignIds)', { campaignIds: campaignIds })
                .getMany();
                entity.campaigns = campaigns;
        } else {
            entity.campaigns = null;
        }
        
        try {
            await ds.getRepository(OwnerLogin).save(ownerLogin);
            await ds.getRepository(Owner).save(entity);
            return true;
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

    changePassword = async (params: any) => {
        const { loginId, oldPassword, newPassword, schema } = params;
        const ds = await this.getEntityManager(schema);
        try {
            const ownerLogin = await ds.getRepository(OwnerLogin).findOneOrFail({
                where: {
                    ONL_Login: loginId
                }
            })
            const hashed = String(crypto.SHA512(oldPassword)).toLowerCase();
            const checkPassword = ownerLogin.ONL_Password.toLowerCase() === hashed;
            if(!checkPassword) {
                throw new BadRequestException('wrong old password');
            }
            const newHashed = String(crypto.SHA512(newPassword)).toLowerCase();
            ownerLogin.ONL_Password = newHashed;
            return await ds.getRepository(OwnerLogin).save(ownerLogin);
        } catch (error) {
            throw error;
        }
    }

    deleteOwnerLogin = async (params: any) => {
        const { loginId, schema } = params;
        const ds = await this.getEntityManager(schema);
        try {
            const entity = await ds.getRepository(OwnerLogin).findOneOrFail({
                where: {
                    ONL_Login: loginId
                },
                relations: ['owner']
            })
            entity.ONL_Active = false;
            entity.owner.ON_Active = false;
            entity.owner.permissions = null;
            entity.owner.machines = null;
            await ds.getRepository(OwnerLogin).save(entity);
        } catch(error) {
            throw error;
        }
    }
}
