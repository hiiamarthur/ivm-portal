import { Module } from '@nestjs/common';
import { WebsocketAdmin } from './websocket-client';

@Module({
  providers: [WebsocketAdmin]
})
export class WebsocketUtilModule {}
