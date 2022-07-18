import { Module } from '@nestjs/common';
import { InventoryService } from '../inventory/inventory.service';
import { SalesReportService } from '../salesreport/salesreport.service';
import { GenerateExcelService } from './generate-excel.service';
import { GenerateExcelController } from './generate-excel.controller';

@Module({
  providers: [GenerateExcelService, InventoryService, SalesReportService],
  controllers: [GenerateExcelController]
})
export class GenerateExcelModule {}
