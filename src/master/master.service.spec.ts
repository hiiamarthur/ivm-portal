import { Test, TestingModule } from '@nestjs/testing';
import { MasterService } from './master.service';
import { AppModule } from '../app.module';

describe('MasterService', () => {
  let service: MasterService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
      providers: [MasterService],
    }).compile();

    service = module.get<MasterService>(MasterService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it.only('test AllMachineList', async () => {
    const spyedMethod = await jest.spyOn(service, 'getAllMachineList');
    const data = await service.getAllMachineList(1, 'DCoin');
    console.log(data);
    expect(spyedMethod).toBeCalled();
  })

  it('test getAllProductList',async () => {
    const spyedMethod = await jest.spyOn(service, 'getAllProductList');
    const data = await service.getAllProductList();
    console.log(data);
    expect(spyedMethod).toBeCalled();
  })

  afterAll(() => setTimeout(() => process.exit(), 1500))
});
