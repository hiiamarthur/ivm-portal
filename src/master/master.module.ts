import { Module } from '@nestjs/common';
import { NwgroupModule } from '../nwgroup/nwgroup.module';
import { HostingModule } from '../hosting/hosting.module';
import { MasterService } from './master.service';
import { CsModule } from '../cs/cs.module';

@Module({
  imports: [HostingModule, NwgroupModule, CsModule],
  providers: [MasterService],
  exports: [MasterService]
})
export class MasterModule {}
