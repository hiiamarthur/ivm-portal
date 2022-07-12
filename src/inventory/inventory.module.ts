import { Module } from '@nestjs/common';
import { MasterService } from '../master/master.service';
import { InventoryService } from './inventory.service';
import { InventoryController } from './inventory.controller';

@Module({
  providers: [InventoryService, MasterService],
  controllers: [InventoryController]
})
export class InventoryModule {}
