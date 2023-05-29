import { Injectable } from '@nestjs/common';
import { IService } from '../common/IService';
import { parse, startOfDay, endOfDay, format } from 'date-fns';
import { datatableNoData } from '../common/helper/requestHandler';

@Injectable()
export class SalesReportService extends IService{
    
    getMachineSalesSummary = async (params: any) => {
        const { schema, isSuperAdmin, ownerId, machineIds, from, to, start, limit, sort } = params;
        const em = await this.getEntityManager(schema);
        let whereClause = 'tx.TX_Time >= :dateFrom and tx.TX_Time < :dateTo';
        let queryParameter: any = { 
            dateFrom: format(startOfDay(parse(from, 'yyyy-MM-dd', new Date())), 'yyyy-MM-dd HH:mm:ss'), 
            dateTo: format(endOfDay(parse(to, 'yyyy-MM-dd', new Date())), 'yyyy-MM-dd HH:mm:ss')
        };

        const orderBy = 'tx.TX_MachineID';
        const orderDir = 'ASC';

        if(!isSuperAdmin) {
            whereClause += ' AND tx.TX_MachineID in (select ONM_MachineID from Owner_Machine where ONM_OwnerID = :ownerId)';
            queryParameter = { ...queryParameter, ownerId: ownerId }
        }
        if (machineIds && machineIds.length > 0) {
            whereClause += ' AND tx.TX_MachineID in (:...machineIds)';
            queryParameter = { ...queryParameter, machineIds: machineIds };
        }

        const count = await em.createQueryBuilder()
                .select(['COUNT(distinct tx.TX_MachineID) as total'])
                .from('Transaction', 'tx')
                .where(whereClause, queryParameter)
                .getRawOne();
        
        if(!count || count.total === 0) {
            return datatableNoData;
        }
        
        const sStart = start || 0;
        const sLimit = limit || 25;
        
        const qb = await em.createQueryBuilder()
            .select(['tx.TX_MachineID as MachineID', 'm.M_Name as Loc', 'SUM(txd.TXD_Qty) as TotalQty',
                'CAST(SUM(CAST(txd.TXD_Amt as numeric(10,2)) * txd.TXD_Qty) as numeric(10,2)) as TotalAmt'])
            .from('Transaction', 'tx')
            .leftJoin('Transaction_Detail', 'txd', 'tx.TX_TXNID = txd.TXD_TXNID')
            .leftJoin('Machine', 'm', 'tx.TX_MachineID = m.M_MachineID')
            .where(whereClause, queryParameter)
            .groupBy('tx.TX_MachineID, m.M_Name')
            

        if(sort && sort.length > 0) {
            sort.forEach((s) => {
                qb.addOrderBy(s.column, s.dir)
            })
        } else {
            qb.orderBy(orderBy, orderDir as any)
        }

        const rowData = await qb.offset(sStart).limit(sLimit).getRawMany();

        return { 
            page: start,
            ...count,
            recordsTotal: count.total,
            recordsFiltered:  count.total,
            data: rowData
        };
    }

    getMachineSalesDetail = async (params: any) => {
        const { schema, machineIds, isSuperAdmin, ownerId, from, to, start, limit, sort } = params;
        const em = await this.getEntityManager(schema);
        let whereClause = 'tx.TX_Time >= :dateFrom and tx.TX_Time < :dateTo';
        let queryParameter: any = { 
            dateFrom: format(startOfDay(parse(from, 'yyyy-MM-dd', new Date())), 'yyyy-MM-dd HH:mm:ss'), 
            dateTo: format(endOfDay(parse(to, 'yyyy-MM-dd', new Date())), 'yyyy-MM-dd HH:mm:ss')
        };

        const sStart = start || 0;
        const sLimit = limit || 25;
        
        const orderBy = 'txs.Time';
        const orderDir = 'ASC';

        if(!isSuperAdmin) {
            whereClause += ' AND tx.TX_MachineID in (select ONM_MachineID from Owner_Machine where ONM_OwnerID = :ownerId)';
            queryParameter = { ...queryParameter, ownerId: ownerId }
        }
        if (machineIds) {
            whereClause += ' AND tx.TX_MachineID in (:...machineId)';
            queryParameter = { ...queryParameter, machineId: machineIds };
        }

        const count = await em.createQueryBuilder()
            .select(['top 1 count(*) over () as total'])
            .from('Transaction', 'tx')
            .leftJoin('Transaction_Detail', 'txd', 'txd.TXD_TXNID = tx.TX_TXNID')
            .where(whereClause, queryParameter)
            .getRawOne();
        
        if(!count || count.total === 0) {
            return datatableNoData;
        }

        const txRemark = 'CASE WHEN JSON_VALUE(TX_TXNRef, \'$.Discount.voucherCode\') IS NOT NULL THEN CONCAT(\'使用優惠碼: \', JSON_VALUE(TX_TXNRef, \'$.Discount.voucherCode\')) ' +
        'WHEN TX_CheckoutTypeID IN( \'CampaignVoucher\', \'MachineVoucher\') THEN CONCAT(\'使用 \', JSON_VALUE(TX_TXNRef, \'$.VoucherCode\'), \' 付款\')' + 
        ' ELSE \'-\' END AS txRemark'

        const txs = await em.createQueryBuilder()
            .select(['tx.TX_MachineID as MachineID', 'CONVERT(VARCHAR(20), tx.TX_Time, 120) as Time', 'tx.TX_CheckoutTypeID as Payment', txRemark])
            .addSelect(['txd.TXD_ProductID as ProductID', 'CAST(txd.TXD_Amt as numeric(10, 2)) as Amount'])
            .from('Transaction', 'tx')
            .leftJoin('Transaction_Detail', 'txd', 'txd.TXD_TXNID = tx.TX_TXNID')
            .where(whereClause, queryParameter);

        const qb = await em.createQueryBuilder()
            .select(['txs.*', 'mp.MP_ProductName as ProductName', 'm.M_Name as Loc'])
            .from(`( ${txs.getQuery()} )`, 'txs')
            .leftJoin('Master_Product', 'mp', 'mp.MP_ProductID = txs.ProductID')
            .leftJoin('Machine', 'm', 'txs.MachineID = m.M_MachineID')
            
        if(sort && sort.length > 0) {
            sort.forEach((s) => {
                qb.addOrderBy(s.column, s.dir)
            })
        } else {
            qb.orderBy(orderBy, orderDir as any)
        }
        
        const rowData = await qb.setParameters(txs.getParameters()).offset(sStart).limit(sLimit).getRawMany();

        return { 
            page: start,
            ...count,
            recordsTotal: count?.total || 0,
            recordsFiltered: count?.total || 0,
            data: rowData
        };
    }

    
    getProductSalesSummary = async (dateFrom: string, dateTo: string, params: any, start: number, limit: number) => {
        const { machineIDs, productIDs } = params;
        let whereClause = 'tx.TX_Time >= :dateFrom and tx.TX_Time < :dateTo';
        let queryParameter: any = { 
            dateFrom: format(startOfDay(parse(dateFrom, 'yyyy-MM-dd', new Date())), 'yyyy-MM-dd HH:mm:ss'), 
            dateTo: format(endOfDay(parse(dateTo, 'yyyy-MM-dd', new Date())), 'yyyy-MM-dd HH:mm:ss')
        };

        const sStart = start || 0;
        const sLimit = limit || 25;

        if (machineIDs) {
            whereClause += ' AND tx.TX_MachineID in (:...machineId)';
            queryParameter = { ...queryParameter, machineId: machineIDs };
        }
        if (productIDs) {
            whereClause += ' AND txd.TXD_ProductID in (:...productId)';
            queryParameter = { ...queryParameter, productId: productIDs };
        }
        const txs = await this.entityManager.createQueryBuilder()
            .select(['txd.TXD_ProductID as ProductID', 'SUM(txd.TXD_Qty) as TotalQty', 'SUM(txd.TXD_Amt) as TotalAmt'])
            .from('Transaction', 'tx')
            .leftJoin('Transaction_Detail', 'txd', 'txd.TXD_TXNID = tx.TX_TXNID')
            .where(whereClause, queryParameter)
            .groupBy('txd.TXD_ProductID');

        const count = await this.entityManager.createQueryBuilder()
                .select(['count(*) over () as total'])
                .from('Transaction', 'tx')
                .leftJoin('Transaction_Detail', 'txd', 'txd.TXD_TXNID = tx.TX_TXNID')
                .where(whereClause, queryParameter)
                .groupBy('txd.TXD_ProductID')
                .getRawOne();
        
        const rowData = await this.entityManager.createQueryBuilder()
            .select(['txs.*', 'mp.MP_ProductName as ProductName'])
            .from(`( ${txs.getQuery()} )`, 'txs')
            .leftJoin('Master_Product', 'mp', 'mp.MP_ProductID = txs.ProductID')
            .orderBy('txs.ProductID')
            .setParameters(txs.getParameters())
            .offset(sStart)
            .limit(sLimit)
            .getRawMany();

        const formattedRowData = rowData.map(d => {
            d.TotalAmt = d.TotalAmt.toFixed(2);
            return d;
        })
        
        return {
            page: start,
            ...count,
            recordsTotal: count.total,
            recordsFiltered: count.total,
            data: formattedRowData
        }
    }
}
