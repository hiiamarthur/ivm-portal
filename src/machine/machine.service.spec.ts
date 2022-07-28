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
  
  it('test getMachineList', async() => {
    const spyedMethod = await jest.spyOn(service, 'getMachineList');
    const data = await service.getMachineList(0, 10, [{column: 'Temperature', dir: 'DESC'}], { active: 1, machineIds: [ 'IU0009', '03066', '02384' , '02348'] });
    console.log(data);
    expect(spyedMethod).toBeCalled();
  })

  it.only('test getMachineDetail', async () => {
    const spyedMethod = await jest.spyOn(service, 'getMachineDetail');
    console.time('getMachienDetail')
    const data = await service.getMachineDetail('C0046');
    if(data){
      fs.writeFileSync('machine_detail.json', JSON.stringify(data));
    }
    console.timeEnd('getMachineDetail')
    expect(spyedMethod).toBeCalled();
  })
  
  it('test getMachineEventLogs',async () => {
    const spyedMethod = await jest.spyOn(service, 'getMachineEventLogs');
    console.time('getMachineEventLogs')
    const data = await service.getMachineEventLogs('EV0118');
    console.timeEnd('getMachineEventLogs')
    console.log(data.eventlogs);
    expect(spyedMethod).toBeCalled();
  })

  it('test getMachineChannelList',async () => {
    const spyedMethod = await jest.spyOn(service, 'getMachineChannelList');
    console.time('getMachineChannelList');
    const data = await service.getMachineChannelList('C0041');
    console.timeEnd('getMachineChannelList');
    console.log(`channel? ${data.channel.length}`);
    console.log(`channelDrink? ${data.channelDrink.length}`);
    expect(spyedMethod).toBeCalled();
  })

  it('test getMachineProductList', async () => {
    const spyedMethod = await jest.spyOn(service, 'getMachineProductList');
    const data = await service.getMachineProductList('C0046', null);
    console.log(data[0]);
    expect(spyedMethod).toBeCalled();
  })

  it('test execution time', async () => {
    //const spyedMethod = await jest.spyOn(service, 'getMachineStockList');
    console.time('getEveryThing')
    const machineId = 'IU0001';
    await service.getMachineDetail(machineId);
    await service.getMachineProductList(machineId, null);
    await service.getMachineStockList(machineId, null);
    await service.getMachineChannelList(machineId);
    console.timeEnd('getEveryThing')
  })
  
});
