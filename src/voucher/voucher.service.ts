import { Injectable } from '@nestjs/common';
import { IService } from '../common/IService';
import { Voucher } from '../entities/machine';
import { parse, startOfDay, endOfDay, format } from 'date-fns';
import { datatableNoData } from '../common/helper/requestHandler';
@Injectable()
export class VoucherService extends IService {

    getVouchers = async (params?: any) => {
        const { schema, canEdit, start, limit, sort, from, to } = params;

        let whereClause = 'MV_Valid = 1 AND MV_VoucherData <> \'{}\'';
        let queryParameter;
        
        if(from && to) {
        whereClause += ' AND MV_DateFrom >= :dateFrom AND MV_DateTo < :dateTo';
            queryParameter = { 
                dateFrom: format(startOfDay(parse(from, 'yyyy-MM-dd', new Date())), 'yyyy-MM-dd HH:mm:ss'), 
                dateTo: format(endOfDay(parse(to, 'yyyy-MM-dd', new Date())), 'yyyy-MM-dd HH:mm:ss')
            }
        }

        const em = await this.getEntityManager(schema);

        const sStart = start || 0;
        const sLimit = limit || 25;

        const qb = await em.createQueryBuilder(Voucher, 'voucher')
        .where(whereClause, queryParameter).orderBy('voucher.MV_CreateDate', 'DESC');

        if(sort && sort.length > 0) {
            sort.forEach((s) => {
                qb.addOrderBy(s.column, s.dir)
            })
        }

        const count = await em.createQueryBuilder(Voucher, 'voucher').select('count(*) as total').where(whereClause, queryParameter).getRawOne();

        if(!count || count.total === 0) {
            return datatableNoData;
        }

        const data = await qb.limit(sLimit).offset(sStart).getMany();
        
        const rowData = data.map(d => {
            const btnCell = `<div class="voucherBtns" data-machineId="${d.MV_MachineID}" data-vouchercode="${d.MV_VoucherCode}">` +
                            `<a href="/voucher/edit?voucherCode=${d.MV_VoucherCode}" class="btn btn-outline-dark me-1 editBtn" title="編輯"><i class="fas fa-pencil"></i></a>` +
                            `<a href="javascript:void(0);" class="btn btn-outline-dark me-1" data-bs-attrid="${d.MV_VoucherCode}" data-bs-action="invalidate-voucher" data-bs-title="Invalidate Voucher" data-bs-toggle="modal" data-bs-target="#confirmModal" title="刪除"><i class="mdi mdi-delete"></i></a>`+
                            `</div>`; 
            return { 
                ...d, 
                btn: canEdit ? btnCell : ''
            }
        });

        return {
            page: start,
            ...count,
            recordsTotal: count?.total || 0,
            recordsFiltered: count?.total || 0,
            data: rowData
        }
    }

    getVoucher = async(params: any) => {

        const { voucherCode, schema } = params;
        
        const em = await this.getEntityManager(schema);
        let voucher: any;
        try {
            voucher =  await em.getRepository(Voucher).findOneOrFail({
                where: {
                    MV_VoucherCode: voucherCode
                }
            })
            voucher.voucherValue = voucher.MV_VoucherData.Value || voucher.MV_VoucherData.RemainValue || voucher.MV_VoucherData.StockCode;
            return voucher;
        } catch (error) {
            throw error
        }
    }

    updateVoucher = async (params: any) => {
        const defaultValue = {
            MV_Valid: true,
            MV_Used: false,
            MV_Sync: true,
            MV_CreateDate: new Date(),
            MV_ExtraData: {}
        }
        const { schema } = params;

        const em = await this.getEntityManager(schema);

        let entity = Object.assign({}, params);
        delete entity.schema;
        entity = {
            ...defaultValue,
            entity
        }
        try {
            return await em.getRepository(Voucher).save(entity);     
        } catch (error) {
            throw error
        }
    }

    invalidVoucher = async (params: any) => {

        const { voucherCode, schema } = params;

        const em = await this.getEntityManager(schema);
        
        try {
            const entity = await em.getRepository(Voucher).findOneOrFail({
                where: {
                    MV_VoucherCode: voucherCode
                }
            });
            return await em.getRepository(Voucher).save(entity);    
        } catch (error) {
            throw error;
        }
    }
}
