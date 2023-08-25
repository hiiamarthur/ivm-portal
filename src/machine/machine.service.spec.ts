import { Test, TestingModule } from '@nestjs/testing';
import { MachineService } from './machine.service';
import * as fs from 'fs';
import { AppModule } from '../app.module';
import { NwgroupModule } from '../nwgroup/nwgroup.module';
import { CsModule } from '../cs/cs.module';
import { HostingModule } from '../hosting/hosting.module';
import { format } from 'date-fns';
import { Machine } from '../entities/machine';

describe('MachineService', () => {
  let service: MachineService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [AppModule, HostingModule, NwgroupModule, CsModule],
      providers: [MachineService],
    }).compile();

    service = module.get<MachineService>(MachineService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
  
  it('test getMachineList', async() => {
    const spyedMethod = await jest.spyOn(service, 'getMachineList');
    const params = {
      schema: 'iVendingDB_Hosting',
      sort: [{column: 'Temperature', dir: 'DESC'}],
      order: [],
      start: 0,
      limit: 10,
      active: 1,
      isSuperAdmin: true,
    }
    const data = await service.getMachineList(params);
    console.log(data);
    expect(spyedMethod).toBeCalled();
  })

  it.only('test getMachineDetail', async () => {
    const spyedMethod = await jest.spyOn(service, 'getMachineDetail');
    const params = { 
      machineId: 'IU0001'
    }
    console.time('getMachienDetail')
    const data = await service.getMachineDetail(params);
    console.timeEnd('getMachineDetail')
    const dt = format(new Date(), 'yyyy-MM-dd_HH_mm_ss')
    if(data){
      fs.writeFileSync(`./${params.machineId}_${dt}_detail.json`, JSON.stringify(data));
    }
    
    expect(spyedMethod).toBeCalled();
  })

  it('test getMachineChannelList',async () => {
    const spyedMethod = await jest.spyOn(service, 'getMachineChannelList');
    console.time('getMachineChannelList');
    const data = await service.getMachineChannelList({ machineId: 'UP0001' });
    console.timeEnd('getMachineChannelList');
    console.log(`channel? ${data.channel.length}`);
    console.log(`channelDrink? ${data.channelDrink.length}`);
    expect(spyedMethod).toBeCalled();
  })

  it('test getMachineProductList', async () => {
    const spyedMethod = await jest.spyOn(service, 'getMachineProductList');
    const data = await service.getMachineProductList({ machineId: 'UP0001' });
    console.log(data[2]);
    expect(spyedMethod).toBeCalled();
  })

  it('test getMachineProductDetail', async () => {
    const spyedMethod = await jest.spyOn(service, 'getMachineProductDetail');
    const params = {
      schema: 'iVendingDB_Hosting',
      machineId:'FN035', 
      productId: 'FITN00003'
    }
    const data = await service.getMachineProductDetail(params);
    console.log(data)
    expect(spyedMethod).toBeCalled();
  })

  it('test getMachineStockDetail', async () => {
    const spyedMethod = await jest.spyOn(service, 'getMachineStockDetail');
    const params = {
      machineId: 'UP0002',
      skuCode: 'fafwagwg'
    }
    const rtn = await service.getMachineStockDetail(params);
    console.log(rtn)
    expect(spyedMethod).toBeCalled();
  });
  
  it('test machine config', async () => {
    const em = await service.getEntityManager();
    const rtn = await em.getRepository(Machine).findOne({
      where: {
        M_MachineID: 'IU0003'
      }
    })
    if(rtn) {
      const custom_config = fs.readFileSync('C:\\Users\\vicki\\Desktop\\iu0001_backup\\20230802\\custom_config.json', { encoding: 'utf-8' })
      if(custom_config) {
        const obj = JSON.parse(custom_config);
        obj.machine.number = 'IU0003'
        rtn.M_LastUpdate = new Date();
        rtn.M_Config = { ...rtn.M_Config, custom_config: obj }
        await em.getRepository(Machine).save(rtn);
      }
    }
  })
});
