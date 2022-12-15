import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { OwnerService } from './owner.service';
import { OwnerLogin, OwnerPermission } from '../entities/owner';
import { OwnerController } from './owner.controller';
import { HostingModule } from '../hosting/hosting.module';
import { NwgroupModule } from '../nwgroup/nwgroup.module';
import { CsModule } from '../cs/cs.module';
import { CampaignService } from '../campaign/campaign.service';

@Module({
  imports: [TypeOrmModule.forFeature([OwnerLogin, OwnerPermission]), HostingModule, NwgroupModule, CsModule],
  providers: [OwnerService, CampaignService],
  controllers: [OwnerController],
  exports: [OwnerService],
})
export class OwnerModule {}
