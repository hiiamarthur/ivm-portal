import { Injectable } from '@nestjs/common';
import { InjectEntityManager } from '@nestjs/typeorm';
import { EntityManager } from 'typeorm';
import { Machine, MachineChannel } from '../entities/machine';

@Injectable()
export class InventoryService {

    location_query = `(Select M_Name from Machine (nolock) m where m.M_MachineID = mc.MC_MachineID) as Loc`;

    constructor(
        @InjectEntityManager() private readonly entityManager: EntityManager
    ) {}

    createRatioQuery = async () => {
        const ratioQuery = await this.entityManager.createQueryBuilder()
            .select(['MC_MachineID, cast(cast(sum(MC_Balance) as numeric(10,2)) / sum(MC_Capacity) * 100 as numeric(10,2)) Ratio', 'sum(MC_Balance) Remain', 'Sum(MC_Capacity) Capacity'])
            .from(MachineChannel, 'ratioQuery')
            .where('MC_Active = 1 AND MC_StockCode <> \'\' AND MC_Capacity > 0')
            .groupBy('ratioQuery.MC_MachineID')
            .getQuery();
        return ratioQuery;
    }

    getMachineInventoryList = async (start: number, limit: number, sort?: any, machineIds?: string[]) => {
        let whereClause = 'mc.MC_Active = 1 AND mc.MC_StockCode <> \'\' AND MC_Capacity > 0';
        let queryParameter;
        if (machineIds) {
            whereClause += ' AND mc.MC_MachineID in (:...machineIds)';
            queryParameter = { machineIds: machineIds };
        }

        const sStart = start === 1 ? 0 : start;
        const sLimit = limit || 20;

        let orderBy = 'Ratio';
        let orderDir = 'ASC';

        if(sort) {
            orderBy = sort.column;
            orderDir = sort.dir;
        }

        const ratioQuery = await this.createRatioQuery();

        const aaa = await this.entityManager.createQueryBuilder(MachineChannel, 's1')
            .select(['MC_StockCode, sum(MC_Balance) as sum'])
            .where('MC_Active = 1 AND MC_StockCode <> \'\' AND MC_Capacity > 0 AND s1.MC_MachineID = mc.MC_MachineID')
            .groupBy('MC_StockCode')
            .having('sum(MC_Balance) > 0')
            .getQuery();
        const bbb = await this.entityManager.createQueryBuilder(MachineChannel, 's2')
            .select('count(distinct MC_StockCode) as totalSku')
            .where('MC_Active = 1 AND MC_StockCode <> \'\' AND MC_Capacity > 0 AND s2.MC_MachineID = mc.MC_MachineID')
            .groupBy('MC_StockCode')
            .getQuery();

        const something = `cast((select cast(count(1) as numeric(4,2)) from (${aaa}) a) / (select cast(count(1) as numeric(4,2)) from (${bbb}) b) * 100 as numeric(10,2)) skuRatio`;

        const rowData = await this.entityManager.createQueryBuilder()
            .select(['mc.MC_MachineID MachineID', this.location_query, 'ratioQuery.Ratio as Ratio', 'ratioQuery.Remain as Remain', 'ratioQuery.Capacity as Capacity', something])
            .from(MachineChannel, 'mc')
            .addFrom(`(${ratioQuery})`, 'ratioQuery')
            .addFrom(Machine, 'machine')
            .where(whereClause, queryParameter)
            .andWhere('ratioQuery.MC_MachineID = mc.MC_MachineID')
            .andWhere('machine.M_MachineID = mc.MC_MachineID AND machine.M_Active = 1')
            .groupBy('mc.MC_MachineID, ratioQuery.Ratio, ratioQuery.Remain, ratioQuery.Capacity')
            .orderBy(orderBy, orderDir === 'desc' ? 'DESC': 'ASC')
            .offset(sStart)
            .limit(sLimit)
            .getRawMany();
        
        const count = await this.entityManager.createQueryBuilder(MachineChannel, 'mc')
            .select(['count(distinct MC_MachineID) as total'])
            .where(whereClause, queryParameter)
            .getRawOne();
        
        return {
            page: start,
            ...count,
            recordsTotal: count?.total || 0,
            recordsFiltered: count?.total || 0,
            data: rowData
        };
    }


    getMachineInventoryDetail = async (start: number, limit: number, sort?: any, machineIds?: string[], productIds?: string[]) => {
        const stock_query = `mc.MC_StockCode StockCode, (Select MS_StockName from Master_Stock (nolock) where MS_StockCode = mc.MC_StockCode) StockName`;

        let whereClause = 'mc.MC_Active = 1 AND mc.MC_Capacity > 0';
        let queryParameter;

        if (machineIds) {
            whereClause += ` AND mc.MC_MachineID in (:...machineIds)`;
            queryParameter = { machineIds: machineIds }
        }

        if (productIds) {
            whereClause += ` AND mc.MC_StockCode in (:...productIds)`;
            queryParameter = { ...queryParameter, productIds: productIds };
        } else {
            whereClause += ` AND mc.MC_StockCode <> \'\'`;
        }

        const sStart = start === 1 ? 0 : start;
        const sLimit = limit || 20;

        let orderBy = 'Ratio, Remain, mc.MC_MachineID, mc.MC_StockCode';
        let orderDir = 'ASC';

        if(sort) {
            orderBy = sort.column;
            orderDir = sort.dir;
        }

        const ratioQuery = await this.createRatioQuery();

        const b = ratioQuery.substring(ratioQuery.indexOf('cast'), ratioQuery.indexOf('FROM'));

        const rowData = await this.entityManager.createQueryBuilder()
            .select(['mc.MC_MachineID MachineID', this.location_query, stock_query, b])
            .from(MachineChannel, 'mc')
            .leftJoin(Machine, 'machine', 'mc.MC_MachineID = machine.M_MachineID')
            .where(whereClause, queryParameter)
            .andWhere('machine.M_Active = 1')
            .groupBy('mc.MC_MachineID, mc.MC_StockCode')
            .orderBy(orderBy, orderDir === 'desc' ? 'DESC': 'ASC')
            .offset(sStart)
            .limit(sLimit)
            .getRawMany();

        const count = await this.entityManager.createQueryBuilder()
            .select(['count(*) over () as total'])
            .from(MachineChannel, 'mc')
            .where(whereClause, queryParameter)
            .groupBy('MC_MachineID, MC_StockCode')
            .getRawOne();
        return {
            page: start,
            ...count,
            recordsTotal: count?.total || 0,
            recordsFiltered: count?.total || 0,
            data: rowData
        }
    }
}
