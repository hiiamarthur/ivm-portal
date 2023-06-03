import { Logger } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { AppModule } from '../app.module';
import { getColumnOptions } from '../entities/columnNameMapping';
import { GenerateExcelService } from './generate-excel.service';
import { SalesReportService } from '../salesreport/salesreport.service';
import { InventoryService } from '../inventory/inventory.service';

import { VoucherService } from '../voucher/voucher.service';
import { CampaignService } from '../campaign/campaign.service';
import { HostingModule } from '../hosting/hosting.module';
import { NwgroupModule } from '../nwgroup/nwgroup.module';
import { CsModule } from '../cs/cs.module';
import { MachineService } from '../machine/machine.service';

jest.setTimeout(9999999);

describe('GenerateExcelService', () => {
  let service: GenerateExcelService;
  let salesReportService: SalesReportService;
  let inventoryService: InventoryService;

  const generateWorkBookName = () => {
    return Math.random().toString(32).slice(2) + '.xlsx';
  }

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [AppModule, HostingModule, NwgroupModule, CsModule],
      providers: [Logger, SalesReportService, InventoryService, MachineService, VoucherService, CampaignService],
    }).compile();

    service = module.get<GenerateExcelService>(GenerateExcelService);
    salesReportService = module.get<SalesReportService>(SalesReportService);
    inventoryService = module.get<InventoryService>(InventoryService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('test generateWorkbook', () => {
    const spyedMethod = jest.spyOn(service, 'generateWorkbook');
    const workbook = service.generateWorkbook(getColumnOptions('ms_summary'));
    console.log(workbook.getWorksheet(1).name);
    expect(spyedMethod).toBeCalled()
  })

  it.only('test generateExcel', async ()=> {
    const spyedMethod = jest.spyOn(service, 'generateExcelReport');
    const params = {
      isSuperAdmin: true,
      campaignId: '5fd94d83eb6120230530',
    }
    const workbook = await service.generateExcelReport('voucher/usage', params);
    await workbook.xlsx.writeFile(generateWorkBookName());
    expect(spyedMethod).toBeCalled()
  })
  
})