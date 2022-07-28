import { Injectable, UnauthorizedException, NotFoundException } from '@nestjs/common';
import { InjectEntityManager } from '@nestjs/typeorm';
import { EntityManager } from 'typeorm';
import * as crypto from 'crypto-js';
import { format } from 'date-fns';
import { Owner, OwnerLogin } from '../entities/owner';
import { LoginLog } from '../entities/eventlog';


@Injectable()
export class OwnerService {

    constructor(
        @InjectEntityManager() private readonly entityManager: EntityManager
    ) {}

    getLoginUser = async (loginName: string, password: string) => {
        const whereClause = 'ONL_Login = :loginId AND ONL_Active = 1 AND ONL_ExpireDate >=:lDate';
        const queryParameter = { loginId: loginName, lDate: format(new Date(), 'yyyy-MM-dd HH:mm:ss') };
        const hashed = String(crypto.SHA512(password));
        const loginUser = await this.entityManager.getRepository(OwnerLogin)
                            .createQueryBuilder()
                            .select()
                            .where(whereClause, queryParameter)
                            .getOne();
        if(!loginUser) {
            throw new NotFoundException('user not found')
        }
        const passwordMatch = hashed.toLowerCase() === loginUser.ONL_Password.toLowerCase();
        if (!passwordMatch) {
            throw new UnauthorizedException('authentication fail');
        }
        return await this.getAOwner(loginName);
    }

    getAOwner = async (ownerId: string) => {
        return await this.entityManager.getRepository(Owner)
            .createQueryBuilder('owner')
            .select()
            .leftJoinAndSelect('owner.permissions', 'permissions')
            .where(`ON_OwnerID = '${ownerId}'`)
            .andWhere('ON_Active = 1 AND ON_ExtraData <> \'{}\'')
            .getOne();
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

}
