import { Test, TestingModule } from '@nestjs/testing';
import { MachineService } from './machine.service';
import { AppModule } from '../app.module';
import * as fs from 'fs';

jest.setTimeout(999999);

describe('MachineService', () => {
  let service: MachineService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
      providers: [MachineService],
    }).compile();

    service = module.get<MachineService>(MachineService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
  
  it.only('test getMachineList', async() => {
    const spyedMethod = await jest.spyOn(service, 'getMachineList');
    const data = await service.getMachineList(0, 10, [{column: 'Temperature', dir: 'DESC'}], { active: 1, machineIds: ['UP0001'], isSuperAdmin: false, ownerId: 'TsClient' });
    console.log(data);
    expect(spyedMethod).toBeCalled();
  })

  it('test getMachineDetail', async () => {
    const spyedMethod = await jest.spyOn(service, 'getMachineDetail');
    console.time('getMachienDetail')
    const data = await service.getMachineDetail('UP0001');
    if(data){
      fs.writeFileSync('machine_detail.json', JSON.stringify(data));
    }
    console.timeEnd('getMachineDetail')
    expect(spyedMethod).toBeCalled();
  })

  it('test getMachineChannelList',async () => {
    const spyedMethod = await jest.spyOn(service, 'getMachineChannelList');
    console.time('getMachineChannelList');
    const data = await service.getMachineChannelList('UP0001');
    console.timeEnd('getMachineChannelList');
    console.log(`channel? ${data.channel.length}`);
    console.log(`channelDrink? ${data.channelDrink.length}`);
    expect(spyedMethod).toBeCalled();
  })

  it('test getMachineProductList', async () => {
    const spyedMethod = await jest.spyOn(service, 'getMachineProductList');
    const data = await service.getMachineProductList('UP0001');
    console.log(data[2]);
    expect(spyedMethod).toBeCalled();
  })

  it('test getMachineProductDetail', async () => {
    const spyedMethod = await jest.spyOn(service, 'getMachineProductDetail');
    const data = await service.getMachineProductDetail('UP0001', 'DNMG00054');
    expect(spyedMethod).toBeCalled();
  })

  it('test getMachineStockDetail', async () => {
    const spyedMethod = await jest.spyOn(service, 'getMachineStockDetail');
    const rtn = await service.getMachineStockDetail('UP0002', 'fafwagwg');
    console.log(rtn)
    expect(spyedMethod).toBeCalled();
  });

  it('test execution time', async () => {
    console.time('getEveryThing')
    const machineId = 'IU0001';
    await service.getMachineDetail(machineId);
    await service.getMachineProductList(machineId);
    await service.getMachineStockList(machineId);
    await service.getMachineChannelList(machineId);
    console.timeEnd('getEveryThing')
  })
  
});
