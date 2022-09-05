import { Module } from '@nestjs/common';
import { InventoryService } from './inventory.service';
import { OwnerService } from '../owner/owner.service';
import { InventoryController } from './inventory.controller';
import { HostingModule } from '../hosting/hosting.module';
import { HostingService } from '../hosting/hosting.service';
import { NwgroupService } from '../nwgroup/nwgroup.service';
import { NwgroupModule } from '../nwgroup/nwgroup.module';

@Module({
  imports: [HostingModule, NwgroupModule],
  providers: [InventoryService, OwnerService, HostingService, NwgroupService],
  controllers: [InventoryController]
})
export class InventoryModule {}
