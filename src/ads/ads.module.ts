import { Logger, Module } from '@nestjs/common';
import { MulterModule } from '@nestjs/platform-express';
import { HostingModule } from '../hosting/hosting.module';
import { NwgroupModule } from '../nwgroup/nwgroup.module';
import { CsModule } from '../cs/cs.module';
import { AdsService } from './ads.service';
import { AdsController } from './ads.controller';
import { AdsApiController } from './ads.api.controller';

@Module({
  imports:[
    MulterModule,
    HostingModule,
    NwgroupModule,
    CsModule
  ],
  providers: [Logger, AdsService],
  controllers: [AdsController, AdsApiController]
})
export class AdsModule {}
