import { Test, TestingModule } from '@nestjs/testing';
import { Logger } from '@nestjs/common';
import { AppModule } from '../app.module';
import { HostingService } from '../hosting/hosting.service';
import { NwgroupService } from '../nwgroup/nwgroup.service';
import { ImportFileService } from './import-file.service';
import * as fs from 'fs'; 
import { CsService } from '../cs/cs.service';
import * as DateFns from 'date-fns';

jest.setTimeout(5000000)

describe('ImportFileService', () => {
  let service: ImportFileService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
      providers: [Logger, ImportFileService, HostingService, NwgroupService, CsService],
    }).compile();

    service = module.get<ImportFileService>(ImportFileService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('test parsedate', () => {
    const date = DateFns.addHours(DateFns.parse('2023-05-10', 'yyyy-MM-dd', new Date()), 8);
    console.log(date);
  })
  
  it.only('test readUploadFile', async () => {
    const spyedMethod = await jest.spyOn(service, 'readUploadFile');
    const filename = `${__dirname}\\bocvoucherdata.csv`;
    //await service.readUploadFile(filestream, { objType: 'machine', machineId: 'IUC002' })
    const data = await service.readUploadFile({ objType: 'campaign', campaignId: '6297d921ca2820230510', filename: filename })
    console.log(data)
    expect(spyedMethod).toBeCalled();
  })
});
