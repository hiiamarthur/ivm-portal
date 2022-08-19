import { Test, TestingModule } from '@nestjs/testing';
import { InventoryService } from './inventory.service';
import { OwnerService } from '../owner/owner.service';
import { AppModule } from '../app.module';
import a = require('tedious/node_modules/iconv-lite');

a.encodingExists('foo');

jest.setTimeout(10000);

describe('InventoryService', () => {
  let service: InventoryService;
  let ownerService: OwnerService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
      providers: [InventoryService, OwnerService],
    }).compile();

    service = module.get<InventoryService>(InventoryService);
    ownerService = module.get<OwnerService>(OwnerService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  
  it('test getMachineInventoryList', async() => {
    const spyedMethod = await jest.spyOn(service, 'getMachineInventoryList');
    console.time('getMachineInventoryList')
    const params = {
      isSuperAdmin: false,
      ownerId: 'TsClient'
    }
    const data = await service.getMachineInventoryList(1, 10, params, [{ column: 'MachineID', order: 'ASC'}]);
    console.timeEnd('getMachineInventoryList')
    //console.log(data)
    expect(spyedMethod).toBeCalled();
  })

  it.only('test getMachineInventoryDetail', async() => {
    const spyedMethod = await jest.spyOn(service, 'getMachineInventoryDetail');
    console.time('getMachineInventoryDetail')
    //const user = await ownerService.getAOwner('TsClient');
    const params = {
      isSuperAdmin: false,
      ownerId: 'TsClient',
      productIds: ['DRCO00002']
    }
    const data = await service.getMachineInventoryDetail(0, 100, params);
    console.timeEnd('getMachineInventoryDetail')
    console.log(data)
    expect(spyedMethod).toBeCalled();
  })

});
