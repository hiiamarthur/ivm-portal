import { Injectable } from '@nestjs/common';
import { InjectEntityManager } from '@nestjs/typeorm';
import { EntityManager } from 'typeorm';
import { Machine, MachineChannel } from '../entities/machine';
import { datatableNoData } from '../common/helper/requestHandler';
@Injectable()
export class InventoryService {

    location_query = `(Select M_Name from Machine (nolock) m where m.M_MachineID = mc.MC_MachineID) as Loc`;

    constructor(
        @InjectEntityManager() private readonly entityManager: EntityManager
    ) {}
    
    filterOwnerMachine = async (ownerId: string, machineIds?: any[], productIds?:any[]) => {
        const qb = this.entityManager.getRepository(MachineChannel).createQueryBuilder('mc')
            .select('distinct MC_MachineID')
            .where('MC_MachineID in (select ONM_MachineID from Owner_Machine where ONM_OwnerID = :ownerId)', { ownerId: ownerId })
            if(machineIds){
                qb.andWhere('MC_MachineID in (:...machineIds)', { machineIds: machineIds })
            }
            if(productIds) {
                qb.andWhere('MC_StockCode in (:...productIds)', { productIds: productIds })
            }
            const count = await qb.getCount();
            if(count === 0) {
                return false;
            } else {
                const oMachines = await this.entityManager.query('select ONM_MachineID from Owner_Machine where ONM_OwnerID = @0', [ownerId]);
                const oProducts = await this.entityManager.query('select ONPL_ProductID from Owner_ProductList where ONPL_OwnerID = @0',[ownerId]);
                return {
                    machineIds: machineIds ? machineIds.filter((m) => oMachines.map(o => o.ONM_MachineID).includes(m)) : oMachines.map(o => o.ONM_MachineID),
                    productIds: productIds ? productIds.filter((p) => oProducts.map(o => o.ONPL_ProductID).includes(p)) : oProducts.map(p => p.ONPL_ProductID)
                }
        } 
    }

    createRatioQuery = async () => {
        const ratioQuery = await this.entityManager.createQueryBuilder()
            .select(['MC_MachineID, cast(cast(sum(MC_Balance) as numeric(10,2)) / sum(MC_Capacity) * 100 as numeric(10,2)) Ratio', 'sum(MC_Balance) Remain', 'Sum(MC_Capacity) Capacity'])
            .from(MachineChannel, 'ratioQuery')
            .where('MC_Active = 1 AND MC_StockCode <> \'\' AND MC_Capacity > 0')
            .groupBy('ratioQuery.MC_MachineID')
            .getQuery();
        return ratioQuery;
    }

    getMachineInventoryList = async (start: number, limit: number, params: any, sort?: any[]) => {
        const { machineIds, isSuperAdmin, ownerId } = params;
        let whereClause = 'mc.MC_Active = 1 AND mc.MC_StockCode <> \'\' AND MC_Capacity > 0';
        let queryParameter;
        if(!isSuperAdmin) {
            whereClause += ' AND mc.MC_MachineID in (:...machineIds)';
            const hasData = await this.filterOwnerMachine(ownerId, machineIds);
            if(!hasData) {
                return datatableNoData;
            } else {
                queryParameter = { machineIds: hasData?.machineIds };
            }
        } else {
            if (machineIds) {
                whereClause += ' AND mc.MC_MachineID in (:...machineIds)';
                queryParameter = { machineIds: machineIds };
            }
        }

        const sStart = start || 0;
        const sLimit = limit || 25;

        const orderBy = 'Ratio';
        const orderDir = 'DESC';

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

        const qb = await this.entityManager.createQueryBuilder()
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
        
        const count = await this.entityManager.createQueryBuilder(MachineChannel, 'mc')
            .leftJoin(Machine, 'm', 'mc.MC_MachineID = m.M_MachineID')
            .select(['count(distinct MC_MachineID) as total'])
            .where(whereClause + ' AND m.M_Active = 1', queryParameter)
            .getRawOne();
        
        return {
            page: start,
            ...count,
            recordsTotal: count?.total || 0,
            recordsFiltered: count?.total || 0,
            data: rowData
        };
    }


    getMachineInventoryDetail = async (start: number, limit: number, params: any, sort?: any[]) => {
        const { isSuperAdmin, ownerId, machineIds, productIds } = params;
        const stock_query = `mc.MC_StockCode StockCode, (Select MS_StockName from Master_Stock (nolock) where MS_StockCode = mc.MC_StockCode) StockName`;

        let whereClause = 'mc.MC_Active = 1 AND mc.MC_Capacity > 0';
        let queryParameter;

        if(!isSuperAdmin) {
            const hasData = await this.filterOwnerMachine(ownerId, machineIds, productIds);
            if(!hasData) {
                return datatableNoData;
            } else {
                whereClause += ` AND mc.MC_MachineID in (:...machineIds)`;
                queryParameter = { machineIds: hasData?.machineIds };
                if(productIds) {
                    whereClause += ` AND mc.MC_StockCode in (:...productIds)`;
                    queryParameter = { ...queryParameter, productIds: hasData?.productIds }
                }
            }
            
        } else {
            if (machineIds) {
                whereClause += ` AND mc.MC_MachineID in (:...machineIds)`;
                queryParameter = { machineIds: machineIds }
            }
    
            if (productIds) {
                whereClause += ` AND mc.MC_StockCode in (:...productIds)`;
                queryParameter = { ...queryParameter, productIds: productIds };
            } 
        }
        //whereClause += ` AND mc.MC_StockCode <> \'\'`;

        const sStart = start || 0;
        const sLimit = limit || 25;

        const orderDir = 'DESC';
        const defaultOrder = [{ column: 'Ratio', dir: orderDir}, { column: 'Remain', dir: orderDir}, { column: ' mc.MC_MachineID', dir: orderDir}, { column: 'mc.MC_StockCode', dir: 'ASC'}]

        const ratioQuery = await this.createRatioQuery();

        const b = ratioQuery.substring(ratioQuery.indexOf('cast'), ratioQuery.indexOf('FROM'));

        const qb = await this.entityManager.createQueryBuilder()
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

        const count = await this.entityManager.createQueryBuilder()
            .select(['count(*) over () as total'])
            .from(MachineChannel, 'mc')
            .leftJoin(Machine, 'm', 'mc.MC_MachineID = m.M_MachineID')
            .where(whereClause + ' AND m.M_Active = 1', queryParameter)
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
