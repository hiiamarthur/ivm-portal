import { HostingService } from "../hosting/hosting.service";
import { InjectEntityManager } from '@nestjs/typeorm';
import { EntityManager } from 'typeorm';
import { NwgroupService } from "../nwgroup/nwgroup.service";

export abstract class IService {
    
    constructor(
        @InjectEntityManager() public readonly entityManager: EntityManager,
        public readonly hostingService: HostingService,
        public readonly nwGroupService: NwgroupService
    ){}

    getEntityManager = async(schema?: string) => {
        if(schema && schema === 'iVendingDB_Hosting') {
            return new EntityManager(await this.hostingService.getInititalizedDataSource());
        }
        if(schema && schema === 'iVendingDB_NW') {
            return new EntityManager(await this.nwGroupService.getInititalizedDataSource());
        }
        return this.entityManager;
    }
}