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

  it.only('test getLoginUser',async () => {
    const spyedMethod = await jest.spyOn(service, 'getLoginUser');
    console.time('getLoginUser');
    const loginObj = await service.getLoginUser('SuperSuperAdmin', 'password');
    console.timeEnd('getLoginUser');
    console.log(loginObj.permissionsMap);
    expect(spyedMethod).toBeCalled();
  })
  
  it('test insertLoginLog',async () => {
    const spyedMethod = await jest.spyOn(service, 'insertLoginLog');
    console.time('insertLoginLog');
    const log = await service.insertLoginLog('SuperSuperAdmin', '0.0.0.0', true);
    console.log(log?.generatedMaps[0]);
    console.timeEnd('insertLoginLog');
    expect(spyedMethod).toBeCalled();
  })
});
