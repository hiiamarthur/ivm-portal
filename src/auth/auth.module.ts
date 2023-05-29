import { Logger, Module } from '@nestjs/common';
import { PassportModule } from '@nestjs/passport';
import { JwtModule } from '@nestjs/jwt';
import { LocalStrategy } from './local.strategy';
import { AuthService } from './auth.service';
import { OwnerModule } from '../owner/owner.module';
import { SessionSerializer } from './session.serializer';
import { HostingModule } from '../hosting/hosting.module';
import { ConfigService } from '@nestjs/config';
import { JwtStrategy } from '../auth/jwt.strategy';
import { PromotionService } from '../promotion/promotion.service';
import { NwgroupModule } from '../nwgroup/nwgroup.module';
import { CsModule } from '../cs/cs.module';
@Module({
  imports: [
    HostingModule,
    NwgroupModule,
    CsModule,
    OwnerModule,
    PassportModule,
    JwtModule.registerAsync({
      useFactory: async (configService: ConfigService) => {
        return  {
          algorithm: 'HS512',
          // secret: configService.get<string>('JWT_SECRET', ''),
          privateKey: configService.get('JWT_PRIVATE_KEY'),
          publicKey: configService.get('JWT_PUBLIC_KEY'),
          signOptions: {
            expiresIn: configService.get('JWT_EXP')
          },
        }
      },
      inject: [ConfigService],
    }),
  ],
  providers: [Logger, AuthService, LocalStrategy, SessionSerializer, PromotionService, JwtStrategy],
  exports: [AuthService]
})
export class AuthModule {}