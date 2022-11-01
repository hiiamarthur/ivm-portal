import { Module } from '@nestjs/common';
import { HostingModule } from '../hosting/hosting.module';
import { HostingService } from '../hosting/hosting.service';
import { NwgroupModule } from '../nwgroup/nwgroup.module';
import { NwgroupService } from '../nwgroup/nwgroup.service';
import { CampaignService } from './campaign.service';
import { CampaignController } from './campaign.controller';

@Module({
  imports:[
    HostingModule,
    NwgroupModule
  ],
  providers: [CampaignService, HostingService, NwgroupService],
  controllers: [CampaignController]
})
export class CampaignModule {}
