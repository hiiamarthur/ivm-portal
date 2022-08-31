import { Test, TestingModule } from '@nestjs/testing';
import { OwnerService } from './owner.service';
import { AppModule } from '../app.module';
import { HostingService } from '../hosting/hosting.service';

jest.setTimeout(123456789)

describe('OwnerService', () => {
  let service: OwnerService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
      providers: [OwnerService, HostingService],
    }).compile();

    service = module.get<OwnerService>(OwnerService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });


  it.only('test findAOwner',async () => {
    const spyedMethod = await jest.spyOn(service, 'findAOwner');
    console.time('findAOwner');
    //const obj = await service.findAOwner({ ownerId: 'SuperAdmin', password: 'password', schema: 'iVendingDB_IVM'});
    const obj2 = await service.findAOwner({ ownerId: 'Healthlia', password: 'password', schema: 'iVendingDB_Hosting'})
    console.timeEnd('findAOwner');
    console.log(obj2);
    expect(spyedMethod).toBeCalled();
  })

  it('test getOwnerList', async () => {
    const spyedMethod = await jest.spyOn(service, 'getOwnerList');
    console.time('getOwnerList');
    const obj = await service.getOwnerList({
      schema: 'iVendingDB_Hosting',
      isActive: true,
      sort: [{column: 'ON_OwnerID', dir: 'ASC'}]
     });
    console.log(obj)
    console.timeEnd('getOwnerList');
    expect(spyedMethod).toBeCalled();
  })

  it('test getOwnerMachine', async () => {
    const spyedMethod = await jest.spyOn(service, 'getOwnerMachine'); 
    console.time('getOwnerMachine');
    const data = await service.getOwnerMachine({ownerId: 'Healthlia', schema: 'iVendingDB_Hosting'});
    console.log(data);
    console.timeEnd('getOwnerMachine');
    expect(spyedMethod).toBeCalled();
  })

  it('test getOwnerProducts', async () => {
    const spyedMethod = await jest.spyOn(service, 'getOwnerProducts'); 
    console.time('getOwnerProducts');
    const data = await service.getOwnerProducts({ownerId: 'gibbish', schema: 'iVendingDB_IVM'});
    //console.log(data);
    console.timeEnd('getOwnerProducts');
    expect(spyedMethod).toBeCalled();
  })

  it('test getOwnerSkus', async () => {
    const spyedMethod = await jest.spyOn(service, 'getOwnerSkus'); 
    console.time('getOwnerSkus');
    await service.getOwnerSkus({ownerId: 'gibbish', schema: 'iVendingDB_Hosting'});
    //await service.getOwnerSkus({schema: 'iVendingDB_IVM'});
    console.timeEnd('getOwnerSkus');
    expect(spyedMethod).toBeCalled();
  })

  it('test updateOwner', async () => {
    const spyedMethod = await jest.spyOn(service, 'updateOwner');
    console.time('updateOwner'); 
    const updated = await service.updateOwner({
      schema: 'iVendingDB_Hosting',
      owner: {
        ON_OwnerID: 'SuperAdmin',
        ONL_ExpireDate: '31-12-2100',
        ON_Active: true,
      }
    });
    console.log(updated);
    console.timeEnd('updateOwner'); 
    expect(spyedMethod).toBeCalled();
  })

  it('test updateOwnerPermission', async () => {
    const spyedMethod = await jest.spyOn(service, 'updateOwnerPermission');
    console.time('updateOwnerPermission');
    const list = [
      { ONP_OwnerID: 'SuperAdmin', ONP_Function: 'machine', ONP_Setting: {Active:1, Create:1, Edit:1}, ONP_Section: 'ExternalPortal'},
      { ONP_OwnerID: 'SuperAdmin', ONP_Function: 'MachineSalesSummary', ONP_Setting: {Active:1, Export:1}, ONP_Section: 'ExternalPortal'},
      { ONP_OwnerID: 'SuperAdmin', ONP_Function: 'MachineSalesDetail', ONP_Setting: {Active:1, Export:1}, ONP_Section: 'ExternalPortal'},
      { ONP_OwnerID: 'SuperAdmin', ONP_Function: 'MachineInventorySummary', value: {Active:1, Export:1}, ONP_Section: 'ExternalPortal'},
      { ONP_OwnerID: 'SuperAdmin', ONP_Function: 'MachineInventoryDetail', value: {Active:1, Export:1}, ONP_Section: 'ExternalPortal'},
      { ONP_OwnerID: 'SuperAdmin', ONP_Function: 'sBackDay', value: {Active:1,value: 365000}, ONP_Section: 'ExternalPortal'}/**/
    ]
    const updated = await service.updateOwnerPermission({permissions: list, schema: 'iVendingDB_Hosting'});
    console.log(updated)
    console.timeEnd('updateOwnerPermission');
    expect(spyedMethod).toBeCalled();
  })
});
