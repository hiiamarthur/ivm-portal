import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MasterModule } from '../master/master.module';
import { MasterService } from '../master/master.service';
import * as ms from '../entities/machine';
import { MachineService } from './machine.service';
import { MachineController } from './machine.controller';
import { OwnerService } from '../owner/owner.service';
import { HostingModule } from '../hosting/hosting.module';
import { NwgroupModule } from '../nwgroup/nwgroup.module';
import { CsModule } from '../cs/cs.module';

@Module({
  imports: [TypeOrmModule.forFeature([ms.Machine, ms.MachineProduct, ms.MachineProductDetail]), MasterModule, HostingModule, NwgroupModule, CsModule],
  providers: [MachineService, MasterService, OwnerService],
  controllers: [MachineController],
  exports: [MachineService]
})
export class MachineModule {}
