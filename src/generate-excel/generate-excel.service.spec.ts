import { Test, TestingModule } from '@nestjs/testing';
import { AppModule } from '../app.module';
import { getColumnOptions } from '../entities/columnNameMapping';
import { GenerateExcelService } from './generate-excel.service';
import { SalesReportService } from '../salesreport/salesreport.service';
import { InventoryService } from '../inventory/inventory.service';
import { format } from 'date-fns';

jest.setTimeout(999999);
describe('GenerateExcelService', () => {
  let service: GenerateExcelService;
  let salesReportService: SalesReportService;
  let inventoryService: InventoryService;
  const workbookName = Math.random().toString(32).slice(2) + '.xlsx';

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
      providers: [SalesReportService, InventoryService, GenerateExcelService],
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
      total: 9999999,
      machineIds: ['00735', '00736', '02961', 'EV0080', 'EV0079']
    }
    console.time('testgenerateExcel');
    const workbook = await service.generateExcelReport('iv_detail', params);
    await workbook.xlsx.writeFile(workbookName);
    console.timeEnd('testgenerateExcel');
    expect(spyedMethod).toBeCalled()
  })
})