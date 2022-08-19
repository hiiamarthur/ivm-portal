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

  const generateWorkBookName = () => {
    return Math.random().toString(32).slice(2) + '.xlsx';
  }

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
      isSuperAdmin: false,
      ownerId: 'TsClient',
      total: 9999999
    }
    console.time('testgenerateExcel');
    const workbook = await service.generateExcelReport('iv_summary', params);
    await workbook.xlsx.writeFile(generateWorkBookName());
    const workbook2 = await service.generateExcelReport('ms_summary', { ...params, from: '2022-01-01', to: '2022-06-30' });
    await workbook2.xlsx.writeFile(generateWorkBookName());
    const workbook3 = await service.generateExcelReport('ms_detail', { ...params, from: '2022-01-01', to: '2022-06-30', machineIds: ['UP0001'] });
    await workbook3.xlsx.writeFile(generateWorkBookName());
    console.timeEnd('testgenerateExcel');
    expect(spyedMethod).toBeCalled()
  })
  
})