import { Test, TestingModule } from '@nestjs/testing';
import { CsService } from '../cs/cs.service';
import { AppModule } from '../app.module';
import { HostingService } from '../hosting/hosting.service';
import { NwgroupService } from '../nwgroup/nwgroup.service';
import { AdsService } from './ads.service';
import * as fs from 'fs';
import { join } from 'path';

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
  
  it('test listAds', async () => {
    const result = await service.listAds({
      from: '2023-07-01',
      to: '2023-07-29',
      start: 0,
      length: 25,
      machineIds: ['IU0003']
    });
    console.log(result);
  })

  it('test getAdsMachineList', async () => {
    const spyedMethod = await jest.spyOn(service, 'getAdsMachineList');
    const entities = await service.getAdsMachineList({
      schema: 'iVendingDB_IVM'
    })
    console.log(entities.length)
    // fs.writeFileSync('adsMachineList.json', JSON.stringify(entities));
    expect(spyedMethod).toBeCalled();
  })

  it.only('get ads path', () => {
    const adFilePath = join(__dirname, '..', '..', '..', '/ad_upload');
    const fileexist = fs.existsSync(`${adFilePath}/2.mp4`)
    console.log(`is 2.mp4 exist? ${fileexist}`)
  })
});
