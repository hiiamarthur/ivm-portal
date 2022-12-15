import { Test, TestingModule } from '@nestjs/testing';
import { CsService } from './cs.service';
import { ConfigModule, ConfigService } from '@nestjs/config';

describe('CsService', () => {
  let service: CsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [ConfigModule.forRoot({
        envFilePath: `${process.cwd()}/.env.${process.env.NODE_ENV}`
      })],
      providers: [ConfigService, CsService],
    }).compile();

    service = module.get<CsService>(CsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
  
  it.only('test getmachineid',async () => {
    const ds = await service.getInititalizedDataSource();
    const data = await ds.query('select distinct M_MachineID from Machine where M_Active = 1 order by M_MachineID')
    const joined = data.reduce((acc, item) => {
      acc += "'" + item.M_MachineID + "',";
      return acc
    }, '')
    console.log(joined);
    ds.close();
  })
});
