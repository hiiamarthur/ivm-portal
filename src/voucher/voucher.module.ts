
import { Module } from '@nestjs/common';
import { VoucherService } from './voucher.service';
import { VoucherController } from './voucher.controller';
import { OwnerModule } from '../owner/owner.module';
import { OwnerService } from '../owner/owner.service';
import { MachineService } from '../machine/machine.service';
import { HostingModule } from '../hosting/hosting.module';
import { HostingService } from '../hosting/hosting.service';
import { NwgroupModule } from '../nwgroup/nwgroup.module';
import { NwgroupService } from '../nwgroup/nwgroup.service';

@Module({
  imports: [
    OwnerModule,
    HostingModule,
    NwgroupModule
  ],
  providers: [VoucherService, OwnerService, MachineService, HostingService, NwgroupService],
  controllers: [VoucherController]
})
export class VoucherModule {}
