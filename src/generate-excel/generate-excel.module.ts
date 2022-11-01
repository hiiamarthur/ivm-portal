import { Module } from '@nestjs/common';
import { InventoryService } from '../inventory/inventory.service';
import { SalesReportService } from '../salesreport/salesreport.service';
import { OwnerService } from '../owner/owner.service';
import { GenerateExcelService } from './generate-excel.service';
import { GenerateExcelController } from './generate-excel.controller';
import { HostingModule } from '../hosting/hosting.module';
import { NwgroupModule } from '../nwgroup/nwgroup.module';
import { VoucherService } from '../voucher/voucher.service';
import { CampaignService } from '../campaign/campaign.service';

@Module({
  imports: [HostingModule, NwgroupModule],
  providers: [GenerateExcelService, InventoryService, SalesReportService, OwnerService, VoucherService, CampaignService],
  controllers: [GenerateExcelController]
})
export class GenerateExcelModule {}
