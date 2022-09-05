import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { OwnerService } from './owner.service';
import { OwnerLogin, OwnerPermission } from '../entities/owner';
import { OwnerController } from './owner.controller';
import { HostingModule } from '../hosting/hosting.module';
import { HostingService } from '../hosting/hosting.service';
import { NwgroupModule } from '../nwgroup/nwgroup.module';
import { NwgroupService } from '../nwgroup/nwgroup.service';

@Module({
  imports: [TypeOrmModule.forFeature([OwnerLogin, OwnerPermission]), HostingModule, NwgroupModule],
  providers: [OwnerService, HostingService, NwgroupService],
  controllers: [OwnerController],
  exports: [OwnerService],
})
export class OwnerModule {}
