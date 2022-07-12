import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MasterModule } from '../master/master.module';
import { MasterService } from '../master/master.service';
import * as ms from '../entities/machine';
import { MachineService } from './machine.service';
import { MachineController } from './machine.controller';

@Module({
  imports: [TypeOrmModule.forFeature([ms.Machine, ms.MachineProduct, ms.MachineProductDetail]), MasterModule],
  providers: [MachineService, MasterService],
  controllers: [MachineController]
})
export class MachineModule {}
