import { Module } from '@nestjs/common';
import { InventoryService } from './inventory.service';
import { OwnerService } from '../owner/owner.service';
import { InventoryController } from './inventory.controller';
import { HostingModule } from '../hosting/hosting.module';
import { HostingService } from '../hosting/hosting.service';

@Module({
  imports: [HostingModule],
  providers: [InventoryService, HostingService, OwnerService],
  controllers: [InventoryController]
})
export class InventoryModule {}
