import { Module } from '@nestjs/common';
import { SalesReportService } from './salesreport.service';
import { SalesreportController } from './salesreport.controller';
import { OwnerModule } from '../owner/owner.module';
import { MachineModule } from '../machine/machine.module';
import { OctopusService } from './octopus.service';

@Module({
  imports: [
    OwnerModule,
    MachineModule
  ],
  providers: [SalesReportService, OctopusService],
  controllers: [SalesreportController]
})
export class SalesreportModule {}
