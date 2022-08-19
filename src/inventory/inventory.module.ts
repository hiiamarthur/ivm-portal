import { Module } from '@nestjs/common';
import { InventoryService } from './inventory.service';
import { OwnerService } from '../owner/owner.service';
import { InventoryController } from './inventory.controller';

@Module({
  providers: [InventoryService, OwnerService],
  controllers: [InventoryController]
})
export class InventoryModule {}
