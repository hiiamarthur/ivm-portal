import { Module } from '@nestjs/common';
import { HostingModule } from '../hosting/hosting.module';
import { HostingService } from '../hosting/hosting.service';
import { MasterService } from './master.service';

@Module({
  imports: [HostingModule],
  providers: [MasterService, HostingService],
  exports: [MasterService]
})
export class MasterModule {}
