import { Test, TestingModule } from '@nestjs/testing';
import { MachineService } from './machine.service';
import { AppModule } from '../app.module';
import a = require('tedious/node_modules/iconv-lite');

a.encodingExists('foo');

jest.setTimeout(10000);

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
    const data = await service.getMachineList({
      active: 1,
      machineIds: ['C0012']
    });
    console.log(data);
    expect(spyedMethod).toBeCalled();
  })

  it('test getMachineDetail', async () => {
    const spyedMethod = await jest.spyOn(service, 'getMachineDetail');
    const data = await service.getMachineDetail('00719');
    expect(spyedMethod).toBeCalled();
  })
  

  it('test getMachineProductList', async () => {
    const spyedMethod = await jest.spyOn(service, 'getMachineProductList');
    const data = await service.getMachineProductList('00718');
    console.log(data.length > 0 ? data[0] : null);
    expect(spyedMethod).toBeCalled();
  })

  it('test getMachinePaymentModules', async () => {
    const spyedMethod = await jest.spyOn(service, 'getMachinePaymentModules');
    const data = await service.getMachinePaymentModules('00944');
    console.log(data?.[0]?.Options);
    expect(spyedMethod).toBeCalled();
  })

  it('test getMachineStockList', async () => {
    const spyedMethod = await jest.spyOn(service, 'getMachineStockList');
    const data = await service.getMachineStockList('00718');
    data.forEach(d => { console.log(d.MS_ExtraData) })
    expect(spyedMethod).toBeCalled();
  })
  
});
