import { Test, TestingModule } from '@nestjs/testing';
import { SalesReportService } from './salesreport.service';
import { AppModule } from '../app.module';
import { OwnerModule } from '../owner/owner.module';
import { format } from 'date-fns';
import { HostingModule } from '../hosting/hosting.module';
import { HostingService } from '../hosting/hosting.service';
import { NwgroupService } from '../nwgroup/nwgroup.service';
import { CsService } from '../cs/cs.service';


describe('SalesReportService', () => {
  let service: SalesReportService;

  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [AppModule, OwnerModule, HostingModule],
      providers: [SalesReportService, HostingService, NwgroupService, CsService],
    }).compile();

    service = module.get<SalesReportService>(SalesReportService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
  
  it('test getMachineSalesSummary', async () => {
    const spyedMethod = await jest.spyOn(service, 'getMachineSalesSummary');
    const dateFrom = '2022-08-30';
    const dateTo = '2022-08-31';
    const params = {
      from: dateFrom,
      to: dateTo,
      start: 0,
      limit: 1000,
      order: [],
      isSuperAdmin: false,
      ownerId: 'Healthlia'
    }
    console.time('getMachineSalesSummary');
    const data = await service.getMachineSalesSummary(params);
    console.timeEnd('getMachineSalesSummary');
    console.log(data);
    expect(spyedMethod).toBeCalled();
  })

  it.only('test getMachineSalesDetail', async () => {
    const spyedMethod = await jest.spyOn(service, 'getMachineSalesDetail');
    const dateFrom = '2023-03-29';
    const dateTo = '2023-03-30';
    const params = {
      from: dateFrom,
      to: dateTo,
      start: 0,
      limit: 10,
      isSuperAdmin: true,
      machineIds: ['03203','02660']
    }
    console.time('getMachineSalesDetail')
    
    const data = await service.getMachineSalesDetail(params);

    console.timeEnd('getMachineSalesDetail')
    console.log(data);
    expect(spyedMethod).toBeCalled();
  })


});
