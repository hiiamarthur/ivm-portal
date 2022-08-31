import { Injectable, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { HostingService } from './hosting.service';
import { Owner } from '../entities/owner';
import * as crypto from 'crypto-js';
import { Not } from 'typeorm';
// for testing only
@Injectable()
export class HostingOwnerService {

    constructor(
        private hostingService: HostingService
    ){}

    findAOwner = async (params: any) => {
        const { ownerId, password } = params;
        const ds = await this.hostingService.getInititalizedDataSource();
        try {
            const entity = await ds.getRepository(Owner).findOneOrFail({
                where: {
                    ON_OwnerID: ownerId,
                    ON_Active: true, 
                    ON_ExtraData: Not('{}')
                },
                relations: ['login', 'permissions']
            })
            const checkPassword = entity.login.ONL_Password.toLowerCase() === String(crypto.SHA512(password)).toLowerCase();
            if(!checkPassword) {
                throw new UnauthorizedException(`Authentication failed`);
            }
            return entity;
        } catch(error) {
            throw new NotFoundException(`user not found`);
        }
    }
    
    findOwnerOnly = async (ownerId: string) => { 
        console.time('findOwnerOnly')
        const ds = await this.hostingService.getInititalizedDataSource();
        const entity = await ds.getRepository(Owner).findOneOrFail({
            where: {
                ON_OwnerID: ownerId
            }
        })
        console.timeEnd('findOwnerOnly')
        return entity
    }

    updateOwner = async (owner: any) => {
        const ds = await this.hostingService.getInititalizedDataSource();
        try {
            return await ds.getRepository(Owner).update(owner);
        } catch (error){
            throw error;
        }
    }
}