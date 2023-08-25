import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from './auth.service';
import * as cryptojs from 'crypto-js';
import { OwnerService } from '../owner/owner.service';
import { PromotionService } from '../promotion/promotion.service';
import { HostingService } from '../hosting/hosting.service';
import { CsService } from '../cs/cs.service';
import { NwgroupService } from '../nwgroup/nwgroup.service';

describe('AuthService', () => {
  let service: AuthService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [AuthService, OwnerService, PromotionService, HostingService, CsService, NwgroupService],
    }).compile();

    service = module.get<AuthService>(AuthService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it.only('test validate machinename', () => {
    const machineId = 'IU0003';
    const hashed = String(cryptojs.SHA512(`IVM-${machineId}`)).toUpperCase();
    console.log(hashed);
  })
});
