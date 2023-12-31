import { Module } from '@nestjs/common';
import { SalesReportService } from './salesreport.service';
import { SalesreportController } from './salesreport.controller';
import { OwnerModule } from '../owner/owner.module';
import { MachineModule } from '../machine/machine.module';
import { OctopusService } from './octopus.service';
import { OwnerService } from '../owner/owner.service';
import { HostingModule } from '../hosting/hosting.module';
import { NwgroupModule } from '../nwgroup/nwgroup.module';
import { CsModule } from '../cs/cs.module';
@Module({
  imports: [
    OwnerModule,
    MachineModule,
    HostingModule,
    NwgroupModule,
    CsModule
  ],
  providers: [SalesReportService, OctopusService, OwnerService],
  controllers: [SalesreportController]
})
export class SalesreportModule {}
