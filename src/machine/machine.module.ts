import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MasterModule } from '../master/master.module';
import { MasterService } from '../master/master.service';
import * as ms from '../entities/machine';
import { MachineService } from './machine.service';
import { MachineController } from './machine.controller';
import { OwnerService } from '../owner/owner.service';
import { HostingModule } from '../hosting/hosting.module';
import { HostingService } from '../hosting/hosting.service';
import { NwgroupService } from '../nwgroup/nwgroup.service';
import { NwgroupModule } from '../nwgroup/nwgroup.module';

@Module({
  imports: [TypeOrmModule.forFeature([ms.Machine, ms.MachineProduct, ms.MachineProductDetail]), MasterModule, HostingModule, NwgroupModule],
  providers: [MachineService, MasterService, OwnerService, HostingService, NwgroupService],
  controllers: [MachineController]
})
export class MachineModule {}
