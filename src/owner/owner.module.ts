import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { OwnerService } from './owner.service';
import { OwnerLogin, OwnerPermission } from '../entities/owner';
import { OwnerController } from './owner.controller';
import { MachineService } from '../machine/machine.service';

@Module({
  imports: [TypeOrmModule.forFeature([OwnerLogin, OwnerPermission])],
  providers: [OwnerService, MachineService],
  controllers: [OwnerController],
  exports: [OwnerService],
})
export class OwnerModule {}
