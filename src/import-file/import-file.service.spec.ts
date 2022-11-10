import { Test, TestingModule } from '@nestjs/testing';
import { AppModule } from '../app.module';
import { HostingService } from '../hosting/hosting.service';
import { NwgroupService } from '../nwgroup/nwgroup.service';
import { ImportFileService } from './import-file.service';
import * as fs from 'fs'; 

describe('ImportFileService', () => {
  let service: ImportFileService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
      providers: [ImportFileService, HostingService, NwgroupService],
    }).compile();

    service = module.get<ImportFileService>(ImportFileService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('test readUploadFile', async () => {
    const spyedMethod = await jest.spyOn(service, 'readUploadFile');
    const filestream = fs.createReadStream(`${__dirname}\\testimport_machine.csv`);
    //await service.readUploadFile(filestream, { objType: 'machine', machineId: 'IUC002' })
    await service.readUploadFile(filestream, { objType: 'campaign', campaignId: '98lp2khlkp' })
    expect(spyedMethod).toBeCalled();
  })
});
