import { Injectable } from '@nestjs/common';
import { InjectEntityManager } from '@nestjs/typeorm';
import { EntityManager } from 'typeorm';
import { format, addDays, parse } from 'date-fns';

@Injectable()
export class DashboardService {

  constructor(@InjectEntityManager() private readonly entityManager: EntityManager) {}

  async getPaymentOrderSummary(dDateFrom: string, dDateTo: string, ownerId: string){
      const rawQuery = "select isnull((select RCT_CheckoutTypeNameEng from Ref_CheckoutType (nolock) where rct_checkouttypeid = SO_CheckoutTypeID),'QR') PaymentType,sum(so_totalamt) Total from SalesOrder(nolock) where SO_Finish = 1 and SO_Success = 1 and SO_Status = 'Success' and SO_Time >= @0 and SO_Time < @1 and so_machineid in (select onm_machineid from Owner_Machine (nolock) where onm_ownerid = @2 ) group by SO_CheckoutTypeID";
      const rawData = await this.entityManager.query(rawQuery, [
        dDateFrom,
        format(addDays(parse(dDateTo, 'yyyy-MM-dd', new Date()), 1), 'yyyy-MM-dd'),
        ownerId
      ]);
      return rawData;
  } 

  async getProductOrderSummary(dDateFrom: string, dDateTo: string, ownerId: string) {
    const rawQuery =  "select SOD_ProductID ItemCode,(Select isnull(MP_ProductName,'') From Master_Product (nolock) where MP_ProductID = SalesOrder_Detail.SOD_ProductID) Item " +
            ",Isnull(Sum(SOD_Qty),0) Qty, isnull(Sum(Sod_Qty * SOD_Amt),0) Total " +
            " from SalesOrder (nolock) ,SalesOrder_Detail (nolock) where SO_MachineSalesOrderID = SOD_MachineSalesOrderID and SO_MachineID = SOD_MachineID " +
            " and  SO_Finish = 1 and SO_Success = 1 and SO_Status = 'Success' and so_machineid in (select onm_machineid from Owner_Machine (nolock) where onm_ownerid = @2 ) " +
            " and SO_Time >= @0 and SO_Time < @1" +
            " group by SOD_ProductID ";
    const rawData = await this.entityManager.query(rawQuery, [
      dDateFrom,
      format(addDays(parse(dDateTo, 'yyyy-MM-dd', new Date()), 1), 'yyyy-MM-dd'),
      ownerId
    ]);
    return rawData;
  }

  async LocationOrderSummary(dDateFrom: string, dDateTo: string, ownerId: string){
    const rawQuery = "Select LocationID, Location, isnull(Total, 0) Total from" +
    " (select onm_machineid LocationID, (select M_Name from Machine (nolock) where M_MachineID = onm_machineid) Location from Owner_Machine(nolock) where onm_ownerid = @2 ) OwnerMachine left outer join " +
    " (select SO_MachineID ,sum(so_totalamt) Total from SalesOrder (nolock) where SO_Finish = 1 and SO_Success = 1 and SO_Time >= @0 and SO_Time < @1 and so_machineid in (select onm_machineid from Owner_Machine (nolock) where onm_ownerid = @OwnerID ) group by SO_MachineID ) SO on so.SO_MachineID = OwnerMachine.LocationID";
    const rawData = await this.entityManager.query(rawQuery, [
      dDateFrom,
      format(addDays(parse(dDateTo, 'yyyy-MM-dd', new Date()), 1), 'yyyy-MM-dd'),
      ownerId
    ]);
    return rawData;
  }
}
