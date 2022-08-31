import { HostingService } from "../hosting/hosting.service";
import { InjectEntityManager } from '@nestjs/typeorm';
import { EntityManager } from 'typeorm';

export abstract class IService {
    
    constructor(
        @InjectEntityManager() public readonly entityManager: EntityManager,
        public readonly hostingService: HostingService
    ){}

    getEntityManager = async(schema?: string) => {
        if(schema && schema === 'iVendingDB_Hosting') {
            return new EntityManager(await this.hostingService.getInititalizedDataSource());
        }
        return this.entityManager;
    }
}