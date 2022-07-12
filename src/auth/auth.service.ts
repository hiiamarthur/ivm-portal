import { Injectable } from '@nestjs/common';
import { OwnerService } from '../owner/owner.service';

@Injectable()
export class AuthService {
  constructor(
    private ownerService: OwnerService
  ) {}

  async validateUser(username: string, password: string): Promise<any> {
    const user = await this.ownerService.getLoginUser(username, password);
    if (user) {
    //   const showSalesReport = user.permissions.filter(p => p.ONP_Function === 'salesreport').length > 0;
    //   const showInventory = user.permissions.filter(p => p.ONP_Function === 'inventory').length > 0;
    //   const backDay = showSalesReport ? user.permissions.filter(p => p.ONP_Function === 'salesreport')?.[0].ONP_Setting.Backday : 0;
      
      const { ...result } = user;
      return result;
    }
  }
}
