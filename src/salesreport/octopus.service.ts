import { Injectable } from '@nestjs/common';
import { InjectEntityManager } from '@nestjs/typeorm';
import { EntityManager } from 'typeorm';

@Injectable()
export class OctopusService {

    constructor(
        @InjectEntityManager() private readonly entityManager: EntityManager
    ) {}

    getOctopusDeviceList = async () => {
        return await this.entityManager.query('select top 50 * from view_OctopusExchangeReport');
    }

    getOctopusDeviceMissing = async (status: string) => {
        let query: string;
        if(status === 'pending'){
            query = 'Select view_OctopusExchangeMissing.*, (SELECT  case hb_status when 1 then \'Y\' when 0 then \'-\' end FROM [Heartbeat_Machine] (nolock) where HB_Section = \'online\' and HB_MachineID = view_OctopusExchangeMissing.VMID) Online, cast(isnull((SELECT getdate() - HB_Time FROM[Heartbeat_Machine](nolock) where HB_Section = \'heartbeat\' and HB_MachineID = view_OctopusExchangeMissing.VMID), 999) as int)[O.Days] from view_OctopusExchangeMissing order by daygap';
        } else {
            query = 'Select view_OctopusExchangeReport.* , cast(isnull((SELECT getdate() - HB_Time FROM[Heartbeat_Machine](nolock) where HB_Section = \'heartbeat\' and HB_MachineID = view_OctopusExchangeReport.VMID), 999) as int)[O.Days] ,(SELECT  case hb_status when 1 then \'Y\' when 0 then \'-\' end FROM [Heartbeat_Machine] (nolock) where HB_Section = \'online\' and HB_MachineID = view_OctopusExchangeReport.VMID) Online from view_OctopusExchangeReport order by [O.Days]';
        }
        query += ' offset 0 rows fetch next 50 rows only';
        return await this.entityManager.query(query);
    }
}
