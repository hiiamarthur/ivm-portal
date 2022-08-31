import { Test, TestingModule } from '@nestjs/testing';
import { InventoryService } from './inventory.service';
import { OwnerService } from '../owner/owner.service';
import { AppModule } from '../app.module';
import { MachineProduct } from '../entities/machine';
import { HostingModule } from '../hosting/hosting.module';
import { HostingService } from '../hosting/hosting.service';

jest.setTimeout(100000);

describe('InventoryService', () => {
  let service: InventoryService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [AppModule, HostingModule],
      providers: [InventoryService, OwnerService, HostingService],
    }).compile();

    service = module.get<InventoryService>(InventoryService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  
  it('test getMachineInventoryList', async() => {
    const spyedMethod = await jest.spyOn(service, 'getMachineInventoryList');
    console.time('getMachineInventoryList')
    const params = {
      isSuperAdmin: true,
      machineIds: ['gibbish'],
      schema: 'iVendingDB_Hosting',
      start: 0,
      limit: 10,
      sort: [{ column: 'MachineID', order: 'ASC'}]
    }
    const data = await service.getMachineInventoryList(params);
    console.timeEnd('getMachineInventoryList')
    console.log(data)
    expect(spyedMethod).toBeCalled();
  })

  it('test getMachineInventoryDetail', async() => {
    const spyedMethod = await jest.spyOn(service, 'getMachineInventoryDetail');
    console.time('getMachineInventoryDetail')
    const params = {
      start: 0,
      limit: 100,
      isSuperAdmin: false,
      ownerId: 'GL24',
      schema: 'iVendingDB_Hosting',
      machineIds: ['gibbish'],
    }
    const data = await service.getMachineInventoryDetail(params);
    console.timeEnd('getMachineInventoryDetail')
    console.log(data)
    expect(spyedMethod).toBeCalled();
  })

});
