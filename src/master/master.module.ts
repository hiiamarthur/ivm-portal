import { Module } from '@nestjs/common';
import { NwgroupModule } from '../nwgroup/nwgroup.module';
import { NwgroupService } from '../nwgroup/nwgroup.service';
import { HostingModule } from '../hosting/hosting.module';
import { HostingService } from '../hosting/hosting.service';
import { MasterService } from './master.service';

@Module({
  imports: [HostingModule, NwgroupModule],
  providers: [MasterService, HostingService, NwgroupService],
  exports: [MasterService]
})
export class MasterModule {}
