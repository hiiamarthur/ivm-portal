import { Test, TestingModule } from '@nestjs/testing';
import { OwnerService } from './owner.service';
import { AppModule } from '../app.module';
import a = require('tedious/node_modules/iconv-lite');
a.encodingExists('foo');

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

  it('test getLoginUser',async () => {
    const spyedMethod = await jest.spyOn(service, 'getLoginUser');
    console.time('getLoginUser');
    const obj = await service.getLoginUser('global', 'password');
    console.timeEnd('getLoginUser');
    console.log(obj)
    expect(spyedMethod).toBeCalled();
  })

  it('test getOwnerList', async () => {
    const spyedMethod = await jest.spyOn(service, 'getOwnerList');
    console.time('getOwnerList');
    const obj = await service.getOwnerList({ isActive: 1 , userRole: 'Client' });
    console.timeEnd('getOwnerList');
    console.log(obj)
    expect(spyedMethod).toBeCalled();
  })

  it('test getOwnerMachine', async () => {
    const spyedMethod = await jest.spyOn(service, 'getOwnerMachine');
    await service.getOwnerMachine();
    await service.getOwnerMachine('TsClient');
    expect(spyedMethod).toBeCalled();
  })

  it.only('test getOwnerProducts', async () => {
    const spyedMethod = await jest.spyOn(service, 'getOwnerProducts'); 
    console.time('getOwnerProducts');
    await service.getOwnerProducts();
    await service.getOwnerProducts('TsClient');
    console.timeEnd('getOwnerProducts');
    expect(spyedMethod).toBeCalled();
  })

  it.only('test getOwnerSkus', async () => {
    const spyedMethod = await jest.spyOn(service, 'getOwnerSkus'); 
    console.time('getOwnerSkus');
    await service.getOwnerSkus();
    await service.getOwnerSkus('TsClient');
    console.timeEnd('getOwnerSkus');
    expect(spyedMethod).toBeCalled();
  })

  it('test updateOwner', async () => {
    const spyedMethod = await jest.spyOn(service, 'updateOwner');
    console.time('updateOwner'); 
    const updated = await service.updateOwner({
      ownerId: 'global',
      ownerName: 'global',
      ownerNameEng: 'global',
      password: 'password',
      extraData: {"Role":"SuperAdmin","Type":"User","FirstLogin":0}
    });
    console.log(updated);
    console.timeEnd('updateOwner'); 
    expect(spyedMethod).toBeCalled();
  })

  it('test updateOwnerPermission', async () => {
    const spyedMethod = await jest.spyOn(service, 'updateOwnerPermission');
    console.time('updateOwnerPermission');
    const list = [
      { ownerId: 'TsClient', name: 'machine', value: {Active:1, Create: 0, Edit: 0}},
      { ownerId: 'TsClient', name: 'MachineInventorySummary', value: {Active:1, Export: 1}},
      { ownerId: 'TsClient', name: 'MachineInventoryDetail', value: {Active:1, Export: 1}},
      /*{ ownerId: 'global', name: 'MachineSalesSummary', value: {Active:1, Export: 1}},
      { ownerId: 'global', name: 'MachineSalesDetail', value: {Active:1, Export: 1}},
      { ownerId: 'global', name: 'sBackDay', value: {Active:1,value:3650}}*/
    ]
    const updated = await service.updateOwnerPermission(list);
    console.log(updated)
    console.timeEnd('updateOwnerPermission');
    expect(spyedMethod).toBeCalled();
  })
});
