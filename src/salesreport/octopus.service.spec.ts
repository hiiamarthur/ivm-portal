import { Test, TestingModule } from '@nestjs/testing';
import { OctopusService } from './octopus.service';
import { AppModule } from '../app.module';

describe('OctopusService', () => {
  let service: OctopusService;

  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
      providers: [OctopusService],
    }).compile();

    service = module.get<OctopusService>(OctopusService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it.only('test getOctopusDeviceList', async () => {
    const spyedMethod = await jest.spyOn(service, 'getOctopusDeviceList');
    const data = await service.getOctopusDeviceList();
    console.log(data);
    expect(spyedMethod).toBeCalled();
  });

  it('test getOctopusDeviceMissing pending',async () => {
    const spyedMethod = await jest.spyOn(service, 'getOctopusDeviceMissing');
    const data = await service.getOctopusDeviceMissing('pending');
    console.log(data);
    expect(spyedMethod).toBeCalled();
  })

  it('test getOctopusDeviceMissing all',async () => {
    const spyedMethod = await jest.spyOn(service, 'getOctopusDeviceMissing');
    const data = await service.getOctopusDeviceMissing('all');
    console.log(data);
    expect(spyedMethod).toBeCalled();
  })

  afterAll(() => setTimeout(() => process.exit(), 1500))
});
