import { Test, TestingModule } from '@nestjs/testing';
import { AppModule } from '../app.module';
import { getColumnOptions } from '../entities/columnNameMapping';
import { GenerateExcelService } from './generate-excel.service';
import { SalesReportService } from '../salesreport/salesreport.service';
import { InventoryService } from '../inventory/inventory.service';
import { HostingService } from '../hosting/hosting.service';
import { NwgroupService } from '../nwgroup/nwgroup.service';
import { VoucherService } from '../voucher/voucher.service';
import { CampaignService } from '../campaign/campaign.service';

describe('GenerateExcelService', () => {
  let service: GenerateExcelService;
  let salesReportService: SalesReportService;
  let inventoryService: InventoryService;

  const generateWorkBookName = () => {
    return Math.random().toString(32).slice(2) + '.xlsx';
  }

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
      providers: [HostingService, NwgroupService, SalesReportService, InventoryService, VoucherService, CampaignService, GenerateExcelService],
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
      isSuperAdmin: false,
      ownerId: 'imama',
      total: 9,
      sort:[
        {
            "column": "campaignName",
            "dir": "DESC"
        },
        {
            "column": "CV_VoucherCode",
            "dir": "DESC"
        },
        {
            "column": "CV_CreateDate",
            "dir": "DESC"
        }
      ],
      from: '2022-01-01',
      to: '2022-11-17',
      voucherType: ''
    }
    const workbook = await service.generateExcelReport('campaign/voucher', params);
    await workbook.xlsx.writeFile(generateWorkBookName());
    expect(spyedMethod).toBeCalled()
  })
  
})