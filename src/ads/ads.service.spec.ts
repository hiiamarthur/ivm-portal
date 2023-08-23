import { Test, TestingModule } from '@nestjs/testing';
import { CsService } from '../cs/cs.service';
import { AppModule } from '../app.module';
import { HostingService } from '../hosting/hosting.service';
import { NwgroupService } from '../nwgroup/nwgroup.service';
import { AdsService } from './ads.service';
import { AdType } from '../entities/machine';
import { format } from 'date-fns';

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

  it.only('test listAds', async () => {
    const result = await service.listAds({
      schema: 'iVendingDB_IVM',
      machineIds: ['IU0001']
    });

    const sortByLastUpdate = result.data.sort((a, b) => {
      if(a.MA_LastUpdate > b.MA_LastUpdate) {
        return 1
      }
      if(a.MA_LastUpdate < b.MA_LastUpdate) {
        return -1
      }
      return 0;
    })
    const standbys = result.data.filter((c) => c.MA_AdType === AdType.standby).reduce((acc, obj) => {
        acc.push(obj.MA_Config);
        return acc;
    },[]);
    const topads = result.data.filter((c) => c.MA_AdType === AdType.topad).reduce((acc, obj) => {
        acc.push(obj.MA_Config);
        return acc;
    },[]);

    console.log({ machine_top_playlist: topads, standby_mode_playlist: standbys, sortByLastUpdate: format(sortByLastUpdate[0].MA_LastUpdate, 'yyyy-MM-dd HH:mm:ss') })
  })
});
