import { Test, TestingModule } from '@nestjs/testing';
import { CsService } from '../cs/cs.service';
import { AppModule } from '../app.module';
import { HostingService } from '../hosting/hosting.service';
import { NwgroupService } from '../nwgroup/nwgroup.service';
import { AdsService } from './ads.service';
import { parse } from 'date-fns';

jest.setTimeout(999999);

describe('AdsService', () => {
  let service: AdsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
      providers: [AdsService, HostingService, NwgroupService, CsService],
    }).compile();

    service = module.get<AdsService>(AdsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('test getLastAdIndex', async () => {
    const idx = await service.getLastAdIndex({schema: 'iVendingDB_IVM', machineId: 'IU0001'});
    console.log(`lastIdx: ${idx}`);
    //console.log(await service.getLastAdIndex({schema: 'iVendingDB_IVM', machineId: 'IU0002'}))
  })

  it.only('test insert batch data', async () => {
    // const mIds = ['IU0001', 'IU0002'];
    const schema = 'iVendingDB_IVM';
    const em = await service.getEntityManager(schema);
    const machines = await em.query('select distinct M_MachineID from Machine where M_Active = 1')
    
    console.time('insertBatch')
    const dataList = await Promise.all(
      machines.map(async m =>{
        const idx = await service.getLastAdIndex({ schema: schema, machineId: m.M_MachineID });
        const data = {
          MA_ADID: '404notfound.jpg',
          MA_MachineID: m,
          MA_AdType: 2,
          MA_Active: true,
          MA_Datefrom: '2023-02-01',
          MA_Dateto: '2023-03-31',
          MA_UploadTime: new Date(),
          MA_LastUpdate: new Date(),
          MA_Index: idx,
          MA_Config: {},
          MA_Sync: true,
          MA_SyncTime: new Date()
        }
        return data;
      })
    )
    //console.log(dataList)
    console.timeEnd('insertBatch')
  })

  it('test getOne and update', async () => {
    const schema = 'iVendingDB_IVM'
    const entity = await service.getOne({
      schema: schema,
      name: 'ad2.mp4'
    });
    if(entity) {
      entity.MA_Dateto = parse('2023-03-31 23:59', 'yyyy-MM-dd HH:mm', new Date());
      await service.updateAds({
        schema: schema,
        entity: entity
      })
    }
  })
});
