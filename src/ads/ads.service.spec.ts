import { Test, TestingModule } from '@nestjs/testing';
import { CsService } from '../cs/cs.service';
import { AppModule } from '../app.module';
import { HostingService } from '../hosting/hosting.service';
import { NwgroupService } from '../nwgroup/nwgroup.service';
import { AdsService } from './ads.service';
import { parse } from 'date-fns';

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

  it('test getOne and update', async () => {
    const schema = 'iVendingDB_IVM'
    const entity = await service.getOne({
      schema: schema,
      name: 'ad2.mp4'
    });
    if(entity) {
      entity.MA_Dateto = parse('2023-02-28 23:59', 'yyyy-MM-dd HH:mm', new Date());
      await service.updateAds({
        schema: schema,
        entity: entity
      })
    }
  })
});
