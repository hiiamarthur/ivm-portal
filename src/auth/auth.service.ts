import { Injectable, UnauthorizedException, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { OwnerService } from '../owner/owner.service';
import { PromotionService } from '../promotion/promotion.service';
import * as cryptojs from 'crypto-js';

@Injectable()
export class AuthService {
  constructor(
    private ownerService: OwnerService,
    private promotionService: PromotionService,
    private jwtService: JwtService,
    private readonly logger: Logger,
    private configService: ConfigService
  ) {}

  async validateUser(username: string, password: string, schema?: any): Promise<any> {
    try {
      const login = await this.ownerService.findAOwner({ loginId: username, password: password, schema: schema });
      if (login) {
        return { ...login.owner, username: login.ONL_Login, schema: schema };
      }  
    } catch(error) {
      this.logger.error(`[${schema}] ${username} login fail: ${error}`)
      throw new UnauthorizedException(error);
    }
  }

    async validateMachine(payload: any) {
      const { machineId, machineName } = payload;
      if(!machineId) {
        throw new UnauthorizedException('Invalid request');
      }
      const hashed = String(cryptojs.SHA512(`IVM-${machineId}`)).toUpperCase();
      if(machineName !== hashed) {
        throw new UnauthorizedException('Invalid request')
      }
      try {
        const obj = await this.promotionService.findMachine(payload);
        return {
            access_token: this.jwtService.sign(obj, {
              secret: this.configService.get('JWT_PRIVATE_KEY', ''),
              algorithm: 'RS512'
            }),
      };
      } catch (error) {
        throw new UnauthorizedException(`Machine not exist ${machineId}`);
      }
  }
}