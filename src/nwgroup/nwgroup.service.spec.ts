import { Test, TestingModule } from '@nestjs/testing';
import { NwgroupService } from './nwgroup.service';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { Machine } from '../entities/machine';

describe('NwgroupService', () => {
  let service: NwgroupService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [ConfigModule.forRoot({
        envFilePath: `${process.cwd()}/.env.${process.env.NODE_ENV}`
      })],
      providers: [ConfigService, NwgroupService],
    }).compile();

    service = module.get<NwgroupService>(NwgroupService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('test getmachineid',async () => {
    const ds = await service.getInititalizedDataSource();
    const data = await ds.query('select distinct M_MachineID from Machine where M_MachineID like \'%NW%\' and M_Active = 1 order by M_MachineID')
    const joined = data.reduce((acc, item) => {
      acc += "'" + item.M_MachineID + "',";
      return acc
    }, '')
    console.log(joined);
  })

  it.only('test randomthing',async () => {
    const ds = await service.getInititalizedDataSource();
    const data = await ds.query('select distinct MP_ExtraData from Machine_Product where MP_MachineID in (select ONM_MachineID from Owner_Machine where ONM_OwnerID = \'NWGroup\')');
    console.log(data);
  })
});
