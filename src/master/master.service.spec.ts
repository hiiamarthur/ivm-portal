import { Test, TestingModule } from '@nestjs/testing';
import { MasterService } from './master.service';
import { HostingService } from '../hosting/hosting.service';
import { AppModule } from '../app.module';
import { MachineProduct } from '../entities/machine';

describe('MasterService', () => {
  let service: MasterService;
  let hostingService: HostingService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
      providers: [HostingService, MasterService],
    }).compile();

    service = module.get<MasterService>(MasterService);
    hostingService = module.get<HostingService>(HostingService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
  
  it('test getMasterProduct',async () => {
    const spyedMethod = await jest.spyOn(service, 'getMasterProduct');
    const data = await service.getMasterProduct({ schema: 'iVendingDB_Hosting', productCode: 'FITN00133' })
    //const data2 = await service.getMasterProduct({ schema: 'iVendingDB_IVM' });
    console.log(data)
    expect(spyedMethod).toBeCalled(); 
  })

});
