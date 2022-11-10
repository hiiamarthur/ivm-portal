import { Injectable, UnauthorizedException, Logger } from '@nestjs/common';
import { OwnerService } from '../owner/owner.service';

@Injectable()
export class AuthService {
  constructor(
    private ownerService: OwnerService,
    private readonly logger: Logger
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
}
