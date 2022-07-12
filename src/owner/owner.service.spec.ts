import { Test, TestingModule } from '@nestjs/testing';
import { OwnerService } from './owner.service';
import { AppModule } from '../app.module';

describe('OwnerService', () => {
  let service: OwnerService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
      providers: [OwnerService],
    }).compile();

    service = module.get<OwnerService>(OwnerService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('test getOwners', async () => {
    const spyedMethod = await jest.spyOn(service, 'getOwners');
    console.time('getOwners')
    const data = await service.getOwners();
    console.timeEnd('getOwners')
    console.log(data?.data);
    expect(spyedMethod).toBeCalled();
  })

  it.only('test getLoginUser',async () => {
    const spyedMethod = await jest.spyOn(service, 'getLoginUser');
    const loginObj = await service.getLoginUser('SuperSuperAdmin', 'password');
    console.log(loginObj);
    expect(spyedMethod).toBeCalled();
  })
  
});
