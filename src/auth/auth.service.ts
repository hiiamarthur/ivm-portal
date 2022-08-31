import { Injectable, UnauthorizedException } from '@nestjs/common';
import { OwnerService } from '../owner/owner.service';

@Injectable()
export class AuthService {
  constructor(
    private ownerService: OwnerService
  ) {}

  async validateUser(username: string, password: string, schema?: any): Promise<any> {
    try {
      const user = await this.ownerService.findAOwner({ ownerId: username, password: password, schema: schema });
      if (user) {
        return { ...user, schema: schema };
      }  
    } catch(error) {
      throw new UnauthorizedException(error);
    }
  }
}
