import { Test, TestingModule } from '@nestjs/testing';
import { SalesReportService } from './salesreport.service';
import { AppModule } from '../app.module';
import { OwnerModule } from '../owner/owner.module';
import { format, startOfMonth } from 'date-fns';
import a = require('tedious/node_modules/iconv-lite');
a.encodingExists('foo');

describe('SalesReportService', () => {
  let service: SalesReportService;

  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [AppModule, OwnerModule],
      providers: [SalesReportService],
    }).compile();

    service = module.get<SalesReportService>(SalesReportService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('test getAllMachineList', async () => {
    const spyedMethod = await jest.spyOn(service, 'getAllMachineList');
    const data = await service.getAllMachineList();
    console.log(data);
    expect(spyedMethod).toBeCalled();
  })
  
  it('test getAllProductList',async () => {
    const spyedMethod = await jest.spyOn(service, 'getAllProductList');
    const data = await service.getAllProductList();
    console.log(data);
    expect(spyedMethod).toBeCalled();
  })
  
  it('test getMachineSalesSummary', async () => {
    const spyedMethod = await jest.spyOn(service, 'getMachineSalesSummary');
    const dateFrom = format(new Date(), 'yyyy-MM-dd');
    const dateTo = format(new Date(), 'yyyy-MM-dd');
    console.time('getMachineSalesSummary');
    const data = await service.getMachineSalesSummary(dateFrom, dateTo, 2);
    console.timeEnd('getMachineSalesSummary');
    console.log(data);
    expect(spyedMethod).toBeCalled();
  })

  it.only('test getMachineSalesDetail', async () => {
    const spyedMethod = await jest.spyOn(service, 'getMachineSalesDetail');
    const dateFrom = format(startOfMonth(new Date()), 'yyyy-MM-dd');
    const dateTo = format(new Date(), 'yyyy-MM-dd');
    console.time('getMachineSalesDetail')
    const data = await service.getMachineSalesDetail('2022-07-05', '2022-07-05', 1, 50);
    console.timeEnd('getMachineSalesDetail')
    console.log(data);
    expect(spyedMethod).toBeCalled();
  })

   it('test getProductSalesSummary', async () => {
    const spyedMethod = await jest.spyOn(service, 'getProductSalesSummary');
    const dateFrom = format(startOfMonth(new Date()), 'yyyy-MM-dd');
    const dateTo = format(new Date(), 'yyyy-MM-dd');
    const data = await service.getProductSalesSummary(dateFrom, dateTo, 1, 50, ['00750']);
    console.log(data);
    expect(spyedMethod).toBeCalled();
  })

  it('test getTimezone', async () => {
    const spyedMethod = await jest.spyOn(service, 'getTimezone');
    const result = await service.getTimezone();
    console.log(result);
    expect(spyedMethod).toBeCalled();
  })

  afterAll(() => setTimeout(() => process.exit(), 1500))
});
