import { Logger, Module } from '@nestjs/common';
import { HostingModule } from '../hosting/hosting.module';
import { NwgroupModule } from '../nwgroup/nwgroup.module';
import { CsModule } from '../cs/cs.module';
import { CampaignService } from './campaign.service';
import { CampaignController } from './campaign.controller';

@Module({
  imports:[
    HostingModule,
    NwgroupModule,
    CsModule
  ],
  providers: [Logger, CampaignService],
  controllers: [CampaignController]
})
export class CampaignModule {}
