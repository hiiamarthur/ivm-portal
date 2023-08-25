import { Test, TestingModule } from '@nestjs/testing';
import { CampaignService } from './campaign.service';
import { AppModule } from '../app.module';
import { NwgroupModule } from '../nwgroup/nwgroup.module';
import { CsModule } from '../cs/cs.module';
import { HostingModule } from '../hosting/hosting.module';
import { format, addDays } from 'date-fns';

describe('CampaignService', () => {
  let service: CampaignService;
  let dateFrom: string;
  let dateTo: string;

  beforeEach(async () => {

    const module: TestingModule = await Test.createTestingModule({
      imports: [AppModule, HostingModule, NwgroupModule, CsModule],
      providers: [CampaignService],
    }).compile();

    service = module.get<CampaignService>(CampaignService);
    dateFrom = format(new Date(), 'yyyy-MM-dd');
    dateTo = format(addDays(new Date(), 365), 'yyyy-MM-dd');
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  
  it('test updateCampaign', async () => {
    const spyedMethod = await jest.spyOn(service, 'updateCampaign');
    const entity = await service.getCampaign({ schema: 'iVendingDB_IVM', campaignId: '875db2a6ea4f20230505' })
    const data = await service.updateCampaign(entity)
    console.log(JSON.stringify(data))
    expect(spyedMethod).toBeCalled();
  });

  it('test setVoucherExpire', async () => {
    const spyedMethod = await jest.spyOn(service, 'setVoucherExpire');
    const entity = {
      voucherCode: 'cvhg3l7leoq',
      remark: 'Manual invalidated',
      schema: 'iVendingDB_IVM'
    }
    await service.setVoucherExpire(entity);
    expect(spyedMethod).toBeCalled();
  })

  it.only('generate voucher data', async () => {
    //before
    const campaign = await service.getCampaign('6297d921ca2820230510');
    let i = 0;
    while(i <=20) {
      const entity = {
        CV_CampaignID: campaign.RC_CampaignID,
        CV_VoucherType: 'debitaccount', 
        CV_Valid: true,
        CV_Balance: 1,
        CV_Used: false,
        CV_Sync: true,
        CV_DateFrom: campaign.RC_DateFrom,
        CV_DateTo: campaign.RC_DateTo,
        CV_Remark: '',
        CV_VoucherData: {
          RemainValue: Math.trunc(Math.random() * 10000),
          IsConsumeBalance: 1,
          IsConsumeValue: 1
        }, 
        CV_ExtraData: {},
        schema: 'iVendingDB_IVM'
      }
      await service.updateCampaignVoucher(entity);
      i++;
    }
    
    
  });

  it('test getCampaign', async () => {
    const params = {
      schema: 'iVendingDB_IVM',
      campaignId: 'vsqzlq11dq'
    }

    const spyedMethod = await jest.spyOn(service, 'getCampaign');
    const data = await service.getCampaign(params)
    console.log(JSON.stringify(data))
    expect(spyedMethod).toBeCalled();
  })

  it('test batchUpdateCampaignVoucher', async () => {
    const spyedMethod = await jest.spyOn(service, 'batchUpdateCampaignVoucher');
    const campaignId = 'vsqzlq11dq'
    const data = [
      { CV_CampaignID: campaignId, CV_VoucherCode: 'cvlu0kmoi7c', CV_VoucherData: { RemainValue: Math.trunc(Math.random() * 10000), IsConsumeBalance: 1, IsConsumeValue: 1 }},
      { CV_CampaignID: campaignId, CV_VoucherCode: 'cvqzlphnclk', CV_VoucherData: { RemainValue: Math.trunc(Math.random() * 10000), IsConsumeBalance: 1, IsConsumeValue: 1 }},
      { CV_CampaignID: campaignId, CV_VoucherCode: 'cv23artuef9', CV_VoucherData: { RemainValue: Math.trunc(Math.random() * 10000), IsConsumeBalance: 1, IsConsumeValue: 1 }},
      { CV_CampaignID: campaignId, CV_VoucherCode: 'cvb42b2mctd', CV_VoucherData: { RemainValue: Math.trunc(Math.random() * 10000), IsConsumeBalance: 1, IsConsumeValue: 1 }},
      { CV_CampaignID: campaignId, CV_VoucherCode: 'cvwxmci96or', CV_VoucherData: { RemainValue: Math.trunc(Math.random() * 10000), IsConsumeBalance: 1, IsConsumeValue: 1 }}
    ]
    await service.batchUpdateCampaignVoucher({
      schema: 'iVendingDB_IVM',
      vouchers: data
    })
    expect(spyedMethod).toBeCalled();
  })

  it('test getCampaigns',async () => {
    const params = {
      schema: 'iVendingDB_IVM',
      from: '2022-01-01',
      to: '2022-12-31',
      listAll: true
    }

    const spyedMethod = await jest.spyOn(service, 'getCampaigns');
    const data = await service.getCampaigns(params)
    console.log(data)
    expect(spyedMethod).toBeCalled();
  })

  it('test getCampaignVoucher',async () => {
    const params = {
      schema: 'iVendingDB_IVM',
      voucherCode: ''
    }

    const spyedMethod = await jest.spyOn(service, 'getCampaignVoucher');
    const data = await service.getCampaignVoucher(params)
    console.log(JSON.stringify(data))
    expect(spyedMethod).toBeCalled();
  })

  it('test getCampaignVouchers',async () => {
    const params = {
      schema: 'iVendingDB_IVM',
      from: '2022-01-01',
      to: '2022-12-31',
      order: [
        { column: 'campaignName', dir: 'DESC'},
      ],
      start: 0,
      limit: 100,
      canEdit: false
    }

    const spyedMethod = await jest.spyOn(service, 'getCampaignVouchers');
    const data = await service.getCampaignVouchers(params)
    console.log(JSON.stringify(data.data))
    expect(spyedMethod).toBeCalled();
  })

  it('test getVoucherCodeUsageRecord', async () => {
    const spyedMethod = await jest.spyOn(service, 'getVoucherCodeUsageRecord');
    const params = { campaignId: 'c0045voucher', schema: 'iVendingDB_IVM' };
    const data = await service.getVoucherCodeUsageRecord(params);
    console.log(data);
    expect(spyedMethod).toBeCalled();
  })

});
