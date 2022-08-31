import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { HostingService } from './hosting.service';


@Module({
    imports: [ConfigModule.forRoot({
        envFilePath: `${process.cwd()}/.env.${process.env.NODE_ENV}`
    })],
    providers: [ConfigService, HostingService],
    exports: [HostingService]
})
export class HostingModule {}
