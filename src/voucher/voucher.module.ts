
import { Module } from '@nestjs/common';
import { VoucherService } from './voucher.service';
import { VoucherController } from './voucher.controller';
import { OwnerModule } from '../owner/owner.module';
import { OwnerService } from '../owner/owner.service';
import { MachineService } from '../machine/machine.service';
import { HostingModule } from '../hosting/hosting.module';
import { NwgroupModule } from '../nwgroup/nwgroup.module';
import { CsModule } from '../cs/cs.module';

@Module({
  imports: [
    OwnerModule,
    HostingModule,
    NwgroupModule,
    CsModule
  ],
  providers: [VoucherService, OwnerService, MachineService],
  controllers: [VoucherController]
})
export class VoucherModule {}
