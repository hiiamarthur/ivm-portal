import { Injectable } from '@nestjs/common';
import { EntityManager } from 'typeorm';
import { Machine, MachineChannel } from '../entities/machine';
import { IService } from '../common/IService';
import { datatableNoData } from '../common/helper/requestHandler';
@Injectable()
export class InventoryService extends IService{

    location_query = `(Select M_Name from Machine (nolock) m where m.M_MachineID = mc.MC_MachineID) as Loc`;

    createRatioQuery = (em: EntityManager) => {
        const ratioQuery = em.createQueryBuilder()
            .select(['MC_MachineID, cast(cast(sum(MC_Balance) as numeric(10,2)) / sum(MC_Capacity) * 100 as numeric(10,2)) Ratio', 'sum(MC_Balance) Remain', 'Sum(MC_Capacity) Capacity'])
            .from(MachineChannel, 'ratioQuery')
            .where('MC_Active = 1 AND MC_StockCode <> \'\' AND MC_Capacity > 0')
            .groupBy('ratioQuery.MC_MachineID')
            .getQuery();
        return ratioQuery;
    }

    getMachineInventoryList = async (params?: any) => {
        const { machineIds, isSuperAdmin, ownerId, schema, start, limit, sort } = params;
        let whereClause = 'mc.MC_Active = 1 AND mc.MC_StockCode <> \'\' AND MC_Capacity > 0';
        let queryParameter;
        const em = await this.getEntityManager(schema);
        if(machineIds) {
            whereClause += ' AND mc.MC_MachineID in (:...machineIds)';
            queryParameter = { machineIds: machineIds };
            
        }
        if(!isSuperAdmin) {
            whereClause += ' AND mc.MC_MachineID in (select ONM_MachineID from Owner_Machine where ONM_OwnerID = :ownerId)';
            queryParameter = { ...queryParameter, ownerId: ownerId }
        }

        const sStart = start || 0;
        const sLimit = limit || 25;

        const orderBy = 'Ratio';
        const orderDir = 'DESC';

        const count = await em.createQueryBuilder(MachineChannel, 'mc')
            .leftJoin(Machine, 'm', 'mc.MC_MachineID = m.M_MachineID')
            .select(['count(distinct MC_MachineID) as total'])
            .where(whereClause + ' AND m.M_Active = 1', queryParameter)
            .getRawOne();

        if(!count || count.total === 0) {
            return datatableNoData;
        }

        const ratioQuery = this.createRatioQuery(em);

        const aaa = await em.createQueryBuilder(MachineChannel, 's1')
            .select(['MC_StockCode, sum(MC_Balance) as sum'])
            .where('MC_Active = 1 AND MC_StockCode <> \'\' AND MC_Capacity > 0 AND s1.MC_MachineID = mc.MC_MachineID')
            .groupBy('MC_StockCode')
            .having('sum(MC_Balance) > 0')
            .getQuery();
        const bbb = em.createQueryBuilder(MachineChannel, 's2')
            .select('count(distinct MC_StockCode) as totalSku')
            .where('MC_Active = 1 AND MC_StockCode <> \'\' AND MC_Capacity > 0 AND s2.MC_MachineID = mc.MC_MachineID')
            .groupBy('MC_StockCode')
            .getQuery();

        const something = `cast((select cast(count(1) as numeric(4,2)) from (${aaa}) a) / (select cast(count(1) as numeric(4,2)) from (${bbb}) b) * 100 as numeric(10,2)) skuRatio`;
        
        const qb = await em.createQueryBuilder()
            .select(['mc.MC_MachineID MachineID', this.location_query, 'ratioQuery.Ratio as Ratio', 'ratioQuery.Remain as Remain', 'ratioQuery.Capacity as Capacity', something])
            .from(MachineChannel, 'mc')
            .addFrom(`(${ratioQuery})`, 'ratioQuery')
            .addFrom(Machine, 'machine')
            .where(whereClause, queryParameter)
            .andWhere('ratioQuery.MC_MachineID = mc.MC_MachineID')
            .andWhere('machine.M_MachineID = mc.MC_MachineID AND machine.M_Active = 1')
            .groupBy('mc.MC_MachineID, ratioQuery.Ratio, ratioQuery.Remain, ratioQuery.Capacity')

        if(sort && sort.length > 0) {
            sort.forEach((s) => {
                qb.addOrderBy(s.column, s.dir)
            })
        } else {
            qb.orderBy(orderBy, orderDir)
        }

        const rowData = await qb.limit(sLimit).offset(sStart).getRawMany();
        
        return {
            page: start,
            ...count,
            recordsTotal: count?.total || 0,
            recordsFiltered: count?.total || 0,
            data: rowData
        };
    }


    getMachineInventoryDetail = async (params?: any) => {
        const { isSuperAdmin, ownerId, machineIds, productIds, schema, start, limit, sort } = params;
        const stock_query = `mc.MC_StockCode StockCode, (Select MS_StockName from Master_Stock (nolock) where MS_StockCode = mc.MC_StockCode) StockName`;
        const em = await this.getEntityManager(schema);
        let whereClause = 'mc.MC_Active = 1 AND mc.MC_Capacity > 0 AND len(mc.MC_StockCode) > 0';
        let queryParameter;
       
        if (machineIds) {
            whereClause += ` AND mc.MC_MachineID in (:...machineIds)`;
            queryParameter = { machineIds: machineIds }
        }

        if (productIds) {
            whereClause += ` AND mc.MC_StockCode in (:...productIds)`;
            queryParameter = { ...queryParameter, productIds: productIds };
        } 

        if(!isSuperAdmin) {
            whereClause += ' AND mc.MC_MachineID in (select ONM_MachineID from Owner_Machine where ONM_OwnerID = :ownerId)';
            queryParameter = { ...queryParameter, ownerId: ownerId }
        }

        const count = await em.createQueryBuilder()
            .select(['count(*) over () as total'])
            .from(MachineChannel, 'mc')
            .leftJoin(Machine, 'm', 'mc.MC_MachineID = m.M_MachineID')
            .where(whereClause + ' AND m.M_Active = 1', queryParameter)
            .groupBy('MC_MachineID, MC_StockCode')
            .getRawOne();
        
        if(!count || count.total === 0) {
            return datatableNoData;
        }

        const sStart = start || 0;
        const sLimit = limit || 25;

        const orderDir = 'DESC';
        const defaultOrder = [{ column: 'Ratio', dir: orderDir}, { column: 'Remain', dir: orderDir}, { column: ' mc.MC_MachineID', dir: orderDir}, { column: 'mc.MC_StockCode', dir: 'ASC'}]

        const ratioQuery = this.createRatioQuery(em);

        const b = ratioQuery.substring(ratioQuery.indexOf('cast'), ratioQuery.indexOf('FROM'));

        const qb = await em.createQueryBuilder()
            .select(['mc.MC_MachineID MachineID', this.location_query, stock_query, b])
            .from(MachineChannel, 'mc')
            .leftJoin(Machine, 'machine', 'mc.MC_MachineID = machine.M_MachineID')
            .where(whereClause, queryParameter)
            .andWhere('machine.M_Active = 1')
            .groupBy('mc.MC_MachineID, mc.MC_StockCode')
        if(sort && sort.length > 0) {
            sort.forEach((s) => {
                qb.addOrderBy(s.column, s.dir)
            })
        } else {
            defaultOrder.forEach((s) => {
                qb.addOrderBy(s.column, s.dir as any)
            })
        }

        const rowData = await qb.limit(sLimit).offset(sStart).getRawMany();

        return {
            page: start,
            ...count,
            recordsTotal: count?.total || 0,
            recordsFiltered: count?.total || 0,
            data: rowData
        }
    }
}
