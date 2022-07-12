import { Module } from '@nestjs/common';
import { MasterService } from './master.service';

@Module({
  providers: [MasterService]
})
export class MasterModule {}
