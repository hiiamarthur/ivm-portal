import { Logger, Module } from '@nestjs/common';
import { HostingModule } from '../hosting/hosting.module';
import { NwgroupModule } from '../nwgroup/nwgroup.module';
import { CsModule } from '../cs/cs.module';
import { PromotionController } from './promotion.controller';
import { PromotionService } from './promotion.service';


@Module({
  imports: [HostingModule, NwgroupModule, CsModule],
  controllers: [PromotionController],
  providers: [Logger, PromotionService],
  exports: [PromotionService]
})
export class PromotionModule {}
