import { Module } from '@nestjs/common';
import { SalesReportService } from './salesreport.service';
import { SalesreportController } from './salesreport.controller';
import { OwnerModule } from '../owner/owner.module';
import { MachineModule } from '../machine/machine.module';
import { OctopusService } from './octopus.service';
import { OwnerService } from '../owner/owner.service';
import { HostingModule } from '../hosting/hosting.module';
import { HostingService } from '../hosting/hosting.service';
@Module({
  imports: [
    OwnerModule,
    MachineModule,
    HostingModule
  ],
  providers: [SalesReportService, OctopusService, OwnerService, HostingService],
  controllers: [SalesreportController]
})
export class SalesreportModule {}
