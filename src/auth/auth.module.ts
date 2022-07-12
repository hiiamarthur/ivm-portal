import { Module } from '@nestjs/common';
import { PassportModule } from '@nestjs/passport';
import { LocalStrategy } from './local.strategy';
import { AuthService } from './auth.service';
import { OwnerModule } from '../owner/owner.module';
import { SessionSerializer } from './session.serializer';

@Module({
  imports: [
    OwnerModule,
    PassportModule,
  ],
  providers: [AuthService, LocalStrategy, SessionSerializer],
})
export class AuthModule {}
