import { Test, TestingModule } from '@nestjs/testing';
import { InventoryService } from './inventory.service';
import { AppModule } from '../app.module';
import a = require('tedious/node_modules/iconv-lite');

a.encodingExists('foo');

jest.setTimeout(10000);

describe('InventoryService', () => {
  let service: InventoryService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
      providers: [InventoryService],
    }).compile();

    service = module.get<InventoryService>(InventoryService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  
  it('test getMachineInventoryList', async() => {
    const spyedMethod = await jest.spyOn(service, 'getMachineInventoryList');
    console.time('getMachineInventoryList')
    const data = await service.getMachineInventoryList(1, 10, { column: 'MachineID', order: 'ASC'});
    console.timeEnd('getMachineInventoryList')
    console.log(data)
    expect(spyedMethod).toBeCalled();
  })

  it.only('test getMachineInventoryDetail', async() => {
    const spyedMethod = await jest.spyOn(service, 'getMachineInventoryDetail');
    console.time('getMachineInventoryDetail')
    const data = await service.getMachineInventoryDetail(1, 10, { column: 'MachineID', order: 'ASC'});
    console.timeEnd('getMachineInventoryDetail')
    console.log(data)
    expect(spyedMethod).toBeCalled();
  })


});
