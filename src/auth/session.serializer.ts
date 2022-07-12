import { PassportSerializer } from '@nestjs/passport';
import { Injectable } from '@nestjs/common';
@Injectable()
export class SessionSerializer extends PassportSerializer {
  serializeUser(user: any, done: (err: Error, user: any) => void): any {
    user.showSalesReport = user.permissions.filter(op => op.ONP_Function === 'salesreport').length > 0;
    user.showInventory = user.permissions.filter(op => op.ONP_Function === 'inventory').length > 0;
    if(user.showSalesReport) {
      user.backDay = user.permissions.filter(op => op.ONP_Function === 'salesreport')?.[0].ONP_Setting.Backday;
    }
    done(null, user);
  }
  deserializeUser(payload: any, done: (err: Error, payload: string) => void): any {
    done(null, payload);
  }
}