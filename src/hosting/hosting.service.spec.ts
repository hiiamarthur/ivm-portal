import { Test, TestingModule } from '@nestjs/testing';
import { HostingService } from './hosting.service';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { HostingOwnerService } from './hosting_owner.service';

describe('HostingService', () => {
  let service: HostingService;
  let hostingOwner: HostingOwnerService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [ConfigModule.forRoot({
        envFilePath: `${process.cwd()}/.env.${process.env.NODE_ENV}`
    })],
      providers: [ConfigService, HostingService, HostingOwnerService],
    }).compile();

    service = module.get<HostingService>(HostingService);
    hostingOwner = module.get<HostingOwnerService>(HostingOwnerService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it.only('test getOwner', async () =>{
    const spyedMethod = await jest.spyOn(hostingOwner, 'findAOwner');
    const obj = await hostingOwner.findAOwner({
      ownerId: 'Healthlia',
      password: 'password'
    });
    console.log(`${JSON.stringify(obj.ON_ExtraData)} ${obj.userRole}`)
    expect(spyedMethod).toBeCalled();
  })

  it('test updateOwner', async () => {
    const spyedMethod = await jest.spyOn(hostingOwner, 'updateOwner');
    const owner = await hostingOwner.findAOwner({
      ownerId: 'Healthlia',
      password: 'password'
    });
    const machineIds = ['EV0027','EV0028','EV0030','FN004','FN005','FN006','FN007','FN008','FN009','FN010','FN011','FN012','FN013',
      'FN014','FN015','FN016','FN017','FN021','FN022', 'FN023', 'FN024', 'FN025','FN026','FN027','FN028','FN029','FN030','FN031','FN032',
      'FN033','FN034','FN035']
    const updated = await hostingOwner.updateOwner({
      owner: owner,
      machineIds: machineIds
    });
    console.log(updated)
    expect(spyedMethod).toBeCalled();
  })
});

