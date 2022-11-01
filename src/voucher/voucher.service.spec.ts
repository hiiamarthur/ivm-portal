import { Test, TestingModule } from '@nestjs/testing';
import { AppModule } from '../app.module';
import { HostingService } from '../hosting/hosting.service';
import { NwgroupService } from '../nwgroup/nwgroup.service';
import { VoucherService } from './voucher.service';
import { addDays, startOfDay } from 'date-fns';

describe('VoucherService', () => {
  let service: VoucherService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
      providers: [VoucherService, HostingService, NwgroupService],
    }).compile();

    service = module.get<VoucherService>(VoucherService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('test getVouchers', async () => {
    const spyedMethod = await jest.spyOn(service, 'getVouchers');
    const data = await service.getVouchers({ schema: 'iVendingDB_IVM' });
    console.log(data);
    expect(spyedMethod).toBeCalled();
  })

  it.only('test getVoucher', async () => {
    const spyedMethod = await jest.spyOn(service, 'getVoucher');
    const data = await service.getVoucher({ schema: 'iVendingDB_IVM', voucherCode: 'IU0001VOOSRSKI' })
    console.log(JSON.stringify(data))
    expect(spyedMethod).toBeCalled();
    
  });

  it('test updateVoucher (add)', async () => {
    const voucherCode = Math.random().toString(32).substring(2);
    const entity = {
      MV_MachineID: 'IU0001',
      MV_VoucherType: 'valueoff', 
      MV_VoucherCode: voucherCode,
      MV_Valid: true,
      MV_Balance: 1,
      MV_Used: false,
      MV_Sync: true,
      MV_CreateDate: new Date(),
      MV_DateFrom: startOfDay(new Date()),
      MV_DateTo: addDays(new Date(), 180),
      MV_Remark: '',
      MV_VoucherData: {
        Value: 123,
        IsConsumeBalance: 1
      }, 
      MV_ExtraData: {},
      schema: 'iVendingDB_IVM'
    }

    await service.updateVoucher(entity)
  })

  it('test updateVoucher (update)', async () => {
    const entity = {
      MV_MachineID: 'IU0001',
      MV_VoucherCode: 'gs2d0tig8cgmnl1osrski8',
      MV_Balance: 999,
      MV_VoucherData: {
        Value: 674,
        IsConsumeBalance: 1
      },
      schema: 'iVendingDB_IVM'
    }
    await service.updateVoucher(entity)
  })

  
});
