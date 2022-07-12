import { Injectable, UnauthorizedException } from '@nestjs/common';
import { InjectEntityManager } from '@nestjs/typeorm';
import { EntityManager } from 'typeorm';
import * as crypto from 'crypto-js';
import { MoreThanOrEqual } from 'typeorm';
import { Owner, OwnerLogin } from '../entities/owner';


@Injectable()
export class OwnerService {

    constructor(
        @InjectEntityManager() private readonly entityManager: EntityManager
    ) {}

    getLoginUser = async (loginName: string, password: string) => {
        const hashed = String(crypto.SHA512(password));
        const user = await this.entityManager.getRepository(OwnerLogin).findOne({
            where: {
                ONL_Login: loginName,
                ONL_Active: 1,
                ONL_ExpireDate: MoreThanOrEqual(new Date()),
            },
        });
        const passwordMatch = hashed === user.ONL_Password;
        if(!passwordMatch){
            throw new UnauthorizedException('authentication fail');
        }
        return user;
    }

    getOwners = async () => {
        const data = await this.entityManager.getRepository(Owner)
            .createQueryBuilder('owner')
            .select()
            .leftJoinAndSelect('owner.permissions', 'permissions')
            .where('ON_Active = 1 AND ON_ExtraData <> \'{}\'')
            .getMany();

        const rtn = data.filter(d => d.permissions && d.permissions.length > 0);
        return {
            data: rtn,
            count: rtn.length
        }
    }

}
