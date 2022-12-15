import { Module } from '@nestjs/common';
import { CsService } from './cs.service';

@Module({
  providers: [CsService],
  exports: [CsService]
})
export class CsModule {}
