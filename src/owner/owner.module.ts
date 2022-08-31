import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { OwnerService } from './owner.service';
import { OwnerLogin, OwnerPermission } from '../entities/owner';
import { OwnerController } from './owner.controller';
import { HostingModule } from '../hosting/hosting.module';
import { HostingService } from '../hosting/hosting.service';

@Module({
  imports: [TypeOrmModule.forFeature([OwnerLogin, OwnerPermission]), HostingModule],
  providers: [OwnerService, HostingService],
  controllers: [OwnerController],
  exports: [OwnerService],
})
export class OwnerModule {}
