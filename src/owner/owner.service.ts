import { Injectable, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { InjectEntityManager } from '@nestjs/typeorm';
import { EntityManager } from 'typeorm';
import * as crypto from 'crypto-js';
import { format } from 'date-fns';
import { Owner, OwnerLogin, OwnerPermission } from '../entities/owner';
import { LoginLog } from '../entities/eventlog';
import { Product, Stock } from '../entities/master';
import { parse, endOfDay, addYears } from 'date-fns';
import * as timezone from 'date-fns-tz';
import { Machine } from '../entities/machine';
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
            return await this.entityManager.getRepository(Owner)
            .createQueryBuilder('owner')
            .select()
            .leftJoinAndSelect('owner.permissions', 'permissions')
            .leftJoinAndSelect('owner.login', 'login')
            .where('ON_OwnerID = :ownerId', { ownerId: ownerId })
            .andWhere('ON_Active = 1 AND ON_ExtraData <> \'{}\'')
            .getOneOrFail();
        } catch(error) {
            throw new NotFoundException('user not found');
        }
    }

    getOwnerList = async (params: any) => {
        const { isActive, ownerId, ownerName, userRole } = params;
        let whereClause = 'ON_Active = :isActive AND ON_ExtraData <> \'{}\'';
        let queryParameter:any = { isActive: 1 };
        if(isActive) {
            queryParameter.isActive = isActive;
        }
        if(ownerId) {
            whereClause += ' AND ON_OwnerID like :ownerId';
            queryParameter = {...queryParameter, ownerId: `%${ownerId}%` }
        }
        if(ownerName) {
            whereClause += ' AND (ON_OwnerName like :ownerName OR ON_OwnerNameEng like :ownerName)';
            queryParameter = {...queryParameter, ownerName: `%${ownerName}%` }
        }
        if(userRole) {
            whereClause += ' AND ON_ExtraData like :userRole';
            queryParameter = {...queryParameter, userRole: `%${userRole}%` }
        }
        const data = await this.entityManager.getRepository(Owner)
            .createQueryBuilder('owner')
            .select(['owner', 'login'])
            .leftJoin('owner.login', 'login')
            .where(whereClause, queryParameter)
            .getMany();
        return data.map(d => {
            return {
                id: d.ON_OwnerID,
                loginName: d.login.ONL_Login,
                name: d.ON_OwnerName,
                nameEng: d.ON_OwnerNameEng,
                userRole: d.userRole,
                isActive: d.ON_Active,
                expireDate: format(d.login.ONL_ExpireDate, 'yyyy-MM-dd HH:mm:ss'),
                lastUpdate: format(d.ON_Lastupdate, 'yyyy-MM-dd HH:mm:ss')
            };
        })
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
        const { ownerId, ownerName, ownerNameEng, isActive, password, extraData, expireDate, ownerLogin } = params;
        const entity = new Owner();
        if(ownerId) {
            entity.ON_OwnerID = ownerId;
        }
        if(ownerName){
            entity.ON_OwnerName = ownerName;
        }
        if(ownerNameEng) {
            entity.ON_OwnerNameEng = ownerNameEng;
        }
        entity.ON_Active = isActive || true;
        if(ownerLogin) {
            entity.login = ownerLogin;
        } else {
            const alogin = new OwnerLogin();
            alogin.ONL_OwnerID = ownerId;
            alogin.ONL_Login = ownerId;
            alogin.ONL_Password = String(crypto.SHA512(password));
            alogin.ONL_Active = isActive || true;
            let expD; 
            if(expireDate) {
                expD = timezone.utcToZonedTime(endOfDay(parse(expireDate, 'yyyy-MM-dd', new Date())), 'Asia/Hong_Kong');
            } else { 
                expD = timezone.utcToZonedTime(endOfDay(addYears(new Date(), 100)), 'Asia/Hong_Kong');
            }
            alogin.ONL_ExpireDate = expD;
            entity.login = alogin;
        }
        if(extraData) {
            entity.ON_ExtraData = extraData;
        }
        entity.ON_Lastupdate = timezone.utcToZonedTime(new Date(), 'Asia/Hong_Kong');
        
        try {
            return await this.entityManager.getRepository(Owner).save(entity);
        } catch (error) {
            console.log(error);
            throw error;
        }
    }

    updateOwnerPermission = async (params: any[]) => {
        const list = params.map(p => {
            const op = new OwnerPermission();
            op.ONP_OwnerID = p.ownerId;
            op.ONP_Section = 'ExternalPortal';
            op.ONP_Function = p.name;
            op.ONP_Setting = p.value;
            return op; 
        })
        try {
            return await this.entityManager.getRepository(OwnerPermission).save(list);
        } catch (error) {
            throw error;
        }
    }
}
