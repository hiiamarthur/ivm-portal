import { Test, TestingModule } from '@nestjs/testing';
import { PromotionService } from './promotion.service';
import { AppModule } from '../app.module';
import { NwgroupModule } from '../nwgroup/nwgroup.module';
import { CsModule } from '../cs/cs.module';
import { HostingModule } from '../hosting/hosting.module';
import { Transaction } from '../entities/txn';
import * as cryptojs from 'crypto-js';

describe('PromotionService', () => {
  let service: PromotionService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [AppModule, HostingModule, NwgroupModule, CsModule],
      providers: [PromotionService],
    }).compile();

    service = module.get<PromotionService>(PromotionService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('test getMachineSchema',async () => {
    const schema1 = await service.getMachineSchema({ machineId: 'EV0140' });
    console.log(`'EV0140' schema: ${schema1}`)
    const schema2 = await service.getMachineSchema({ machineId: 'EV0144' });
    console.log(`'EV0144' schema: ${schema2}`)
  })

  it('test findMachine', async () => {
    const spyedMethod = await jest.spyOn(service, 'findMachine');
    try {
      const data = await service.findMachine({ machineId: 'IU0001', schema: 'iVendingDB_IVM' });
      console.log(data)
    } catch (error) {
      console.error(error.message)
    }
    expect(spyedMethod).toBeCalled();
  })

  it.only('test getPromoVoucherData', async () => {
    const spyedMethod = await jest.spyOn(service, 'getPromoVoucherData');
    const params = {
      machineId: 'IU0001',
      schema: 'iVendingDB_IVM',
      campaigns: [ 'vsqzlq11dq', '65d1ccaa690620230321', 'fa32a1d4791d20230321' ],
      voucherCode: 'Q3MINUS5'
    }
    const data = await service.getPromoVoucherData(params);
    console.log(data);
    expect(spyedMethod).toBeCalled();
  })

  it('test updatePromoVoucher', async () => {
    const spyedMethod = await jest.spyOn(service, 'updatePromoVoucher');
    const params = { campaignId: 'vsqzlq11dq', voucherCode: '64889775', schema: 'iVendingDB_IVM', machineId: 'IU0001', receiptId: 1219 }
    const data = await service.updatePromoVoucher(params);
    console.log(data);
    expect(spyedMethod).toBeCalled();
  })

  it('test test', async () => {
    const em = await service.getEntityManager();
    const entity = await em.getRepository(Transaction).findOne({
      where: {
        machineId: 'IU0001',
        receiptId: 1219
      },
      relations: ['txDetail']
    })
    
    console.log(entity)
  })
});
