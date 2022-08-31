import { Module } from '@nestjs/common';
import { PassportModule } from '@nestjs/passport';
import { LocalStrategy } from './local.strategy';
import { AuthService } from './auth.service';
import { HostingOwnerService } from '../hosting/hosting_owner.service';
import { OwnerModule } from '../owner/owner.module';
import { SessionSerializer } from './session.serializer';
import { HostingModule } from '../hosting/hosting.module';

@Module({
  imports: [
    HostingModule,
    OwnerModule,
    PassportModule,
  ],
  providers: [AuthService, HostingOwnerService, LocalStrategy, SessionSerializer],
})
export class AuthModule {}
