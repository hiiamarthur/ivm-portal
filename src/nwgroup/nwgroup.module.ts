import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { NwgroupService } from './nwgroup.service';

@Module({
  imports: [ConfigModule.forRoot({
      envFilePath: `${process.cwd()}/.env.${process.env.NODE_ENV}`
  })],
  providers: [ConfigService, NwgroupService],
  exports: [NwgroupService]
})
export class NwgroupModule {}
