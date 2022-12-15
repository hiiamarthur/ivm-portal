import { Logger, Module } from '@nestjs/common';
import { InventoryService } from './inventory.service';
import { OwnerService } from '../owner/owner.service';
import { InventoryController } from './inventory.controller';
import { HostingModule } from '../hosting/hosting.module';
import { NwgroupModule } from '../nwgroup/nwgroup.module';
import { CsModule } from '../cs/cs.module';

@Module({
  imports: [HostingModule, NwgroupModule, CsModule],
  providers: [Logger, InventoryService, OwnerService],
  controllers: [InventoryController]
})
export class InventoryModule {}
