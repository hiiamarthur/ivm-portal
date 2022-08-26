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

  it.only('test getLoginUser',async () => {
    const spyedMethod = await jest.spyOn(service, 'getLoginUser');
    console.time('getLoginUser');
    const obj = await service.getLoginUser('leo', 'password');
    console.timeEnd('getLoginUser');
    console.log(obj.permissionsMap['MachineSalesSummary']['Export']);
    expect(spyedMethod).toBeCalled();
  })

  it('test getOwnerList', async () => {
    const spyedMethod = await jest.spyOn(service, 'getOwnerList');
    console.time('getOwnerList');
    const obj = await service.getOwnerList({
      start: 0,
      length: 3,
      sort: [{column: 'ON_OwnerID', dir: 'ASC'}]
     });
     console.log(obj)
    console.timeEnd('getOwnerList');
    expect(spyedMethod).toBeCalled();
  })

  it('test getOwnerMachine', async () => {
    const spyedMethod = await jest.spyOn(service, 'getOwnerMachine'); 
    console.time('getOwnerMachine');
    const data = await service.getOwnerMachine('TsClient');
    console.log(data);
    console.timeEnd('getOwnerMachine');
    expect(spyedMethod).toBeCalled();
  })

  it('test getOwnerProducts', async () => {
    const spyedMethod = await jest.spyOn(service, 'getOwnerProducts'); 
    console.time('getOwnerProducts');
    await service.getOwnerProducts();
    await service.getOwnerProducts('TsClient');
    console.timeEnd('getOwnerProducts');
    expect(spyedMethod).toBeCalled();
  })

  it('test getOwnerSkus', async () => {
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
    const permissionList = [
      { ONP_OwnerID: 'TsClient', ONP_Function: 'machine', ONP_Setting: {Active:1, Create: 0, Edit: 0}, ONP_Section: 'ExternalPortal'},
      { ONP_OwnerID: 'TsClient', ONP_Function: 'MachineSalesSummary', ONP_Setting: {Active:1, Export:1}, ONP_Section: 'ExternalPortal'},
      { ONP_OwnerID: 'TsClient', ONP_Function: 'MachineSalesDetail', ONP_Setting: {Active:1, Export:1}, ONP_Section: 'ExternalPortal'}
    ];
    const updated = await service.updateOwner({
      ON_OwnerID: 'TsClient',
      ONL_ExpireDate: '31-12-2024',
      permissionList: permissionList
    });
    console.log(updated);
    console.timeEnd('updateOwner'); 
    expect(spyedMethod).toBeCalled();
  })
  //
  it('test updateOwnerPermission', async () => {
    const spyedMethod = await jest.spyOn(service, 'updateOwnerPermission');
    console.time('updateOwnerPermission');
    const list = [
      { ONP_OwnerID: 'TsClient', ONP_Function: 'machine', ONP_Setting: {Active:1, Create: 0, Edit: 0}, ONP_Section: 'ExternalPortal'},
      { ONP_OwnerID: 'TsClient', ONP_Function: 'MachineSalesSummary', ONP_Setting: {Active:1, Export:1}, ONP_Section: 'ExternalPortal'},
      { ONP_OwnerID: 'TsClient', ONP_Function: 'MachineSalesDetail', ONP_Setting: {Active:1, Export:1}, ONP_Section: 'ExternalPortal'}
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
