import { Injectable } from '@nestjs/common';
import { IService } from '../common/IService';
import { Voucher } from '../entities/machine';
import { parse, startOfDay, endOfDay, format } from 'date-fns';
import { datatableNoData } from '../common/helper/requestHandler';
import { In } from 'typeorm';

@Injectable()
export class VoucherService extends IService {

    getVouchers = async (params?: any) => {
        const { isSuperAdmin, ownerId, schema, canEdit, start, limit, sort, from, to, voucherType, machineIds } = params;

        let whereClause = 'MV_VoucherData <> \'{}\'';
        let queryParameter = {};
        
        if(from && to) {
            whereClause += ' AND MV_CreateDate >= :dateFrom AND MV_CreateDate < :dateTo';
            queryParameter = { 
                dateFrom: format(startOfDay(parse(from, 'yyyy-MM-dd', new Date())), 'yyyy-MM-dd HH:mm:ss'), 
                dateTo: format(endOfDay(parse(to, 'yyyy-MM-dd', new Date())), 'yyyy-MM-dd HH:mm:ss')
            }
        }

        if(voucherType) {
            whereClause += ' AND MV_VoucherType = :voucherType';
            queryParameter = { ...queryParameter, voucherType: voucherType };
        }

        if(machineIds) {
            whereClause += ' AND MV_MachineID IN (:...machineIds)';
            queryParameter = { ...queryParameter, machineIds: machineIds };
        }

        if(!isSuperAdmin) {
            whereClause += ' AND MV_MachineID IN (select ONM_MachineID from Owner_Machine where ONM_OwnerID = :ownerId)';
            queryParameter = { ...queryParameter, ownerId: ownerId }
        }

        const em = await this.getEntityManager(schema);

        const sStart = start || 0;
        const sLimit = limit || 25;

        const qb = await em.createQueryBuilder(Voucher, 'voucher')
        .where(whereClause, queryParameter)

        if(sort && sort.length > 0) {
            sort.forEach((s) => {
                qb.addOrderBy(s.column, s.dir)
            })
        } else {
            qb.orderBy('voucher.MV_CreateDate', 'DESC');
            
        }

        const count = await em.createQueryBuilder(Voucher, 'voucher').select('count(*) as total').where(whereClause, queryParameter).getRawOne();

        if(!count || count.total === 0) {
            return datatableNoData;
        }

        const data = await qb.limit(sLimit).offset(sStart).getMany();
        
        const rowData = data.map(d => {
            let btnCell = `<div class="voucherBtns" data-machineId="${d.MV_MachineID}" data-vouchercode="${d.MV_VoucherCode}">` +
                            `<a href="/voucher/edit?voucherCode=${d.MV_VoucherCode}" class="btn btn-outline-dark me-1 editBtn" title="編輯">`;
                btnCell += d.MV_Valid ?`<i class="fas fa-pencil"></i></a>`:`<i class="fas fa-eye"></i></a>`;
                btnCell += d.MV_Valid ? `<a href="javascript:void(0);" class="btn btn-outline-dark me-1" data-bs-attrid="${d.MV_VoucherCode}" data-bs-action="invalidate-voucher" data-bs-title="Invalidate Voucher" data-bs-toggle="modal" data-bs-target="#confirmModal" title="刪除"><i class="mdi mdi-delete"></i></a>`+
                            `</div>` : `</div>`; 
            return { 
                ...d,
                voucherValue: Number(d.MV_VoucherData.Value) || Number(d.MV_VoucherData.RemainValue) || d.MV_VoucherData.StockCode,
                chkbox: canEdit && d.MV_Valid ? `<input class="form-check-input border border-white" type="checkbox" name="selection" onchange="enableBtnGp()" data-vouchercode="${d.MV_VoucherCode}" />` : '',
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

    exportVoucher = async(params: any) => {
        const { isSuperAdmin, ownerId, schema, sort, from, to, voucherType, machineIds } = params;
        let whereClause = 'MV_VoucherData <> \'{}\'';
        let queryParameter = {};
        
        if(from && to) {
            whereClause += ' AND MV_CreateDate >= :dateFrom AND MV_CreateDate < :dateTo';
            queryParameter = { 
                dateFrom: format(startOfDay(parse(from, 'yyyy-MM-dd', new Date())), 'yyyy-MM-dd HH:mm:ss'), 
                dateTo: format(endOfDay(parse(to, 'yyyy-MM-dd', new Date())), 'yyyy-MM-dd HH:mm:ss')
            }
        }

        if(voucherType) {
            whereClause += ' AND MV_VoucherType = :voucherType';
            queryParameter = { ...queryParameter, voucherType: voucherType };
        }

        if(!isSuperAdmin) {
            whereClause += ' AND MV_MachineID IN (select ONM_MachineID from Owner_Machine where ONM_OwnerID = :ownerId)';
            queryParameter = { ...queryParameter, ownerId: ownerId }
        }

        if(machineIds) {
            whereClause += ' AND MV_MachineID IN (:...machineIds)';
            queryParameter = { ...queryParameter, machineIds: machineIds };
        } 

        const em = await this.getEntityManager(schema);
        const qb = await em.createQueryBuilder(Voucher, 'voucher').where(whereClause, queryParameter)

        if(sort && sort.length > 0) {
            sort.forEach((s) => {
                qb.addOrderBy(s.column, s.dir)
            })
        } else {
            qb.orderBy('voucher.MV_CreateDate', 'DESC');
        }
        try {
            const data = await qb.getMany();
        
            return data.map((d: any) => {
                return {
                    ...d,
                    voucherValue: Number(d.MV_VoucherData.Value) || Number(d.MV_VoucherData.RemainValue) || d.MV_VoucherData.StockCode,
                    MV_Valid: d.MV_Valid ? 'YES' : 'NO',
                    MV_Used: d.MV_Used ? 'YES' : 'NO',
                    MV_UsedTime: d.MV_UsedTime ? format(d.MV_UsedTime, 'yyyy-MM-dd HH:mm:ss') : 'N/A'
                }
            })     
        } catch (error) {
            throw error;
        }
    }

    getVoucher = async(params: any) => {
        const { voucherCode, schema } = params;
        
        const em = await this.getEntityManager(schema);
        let rtn: any;
        try {
            const voucher =  await em.getRepository(Voucher).findOneOrFail({
                where: {
                    MV_VoucherCode: voucherCode
                }
            })
            
            rtn = { 
                ...voucher,
                MV_CreateDate: format(voucher.MV_CreateDate, 'yyyy-MM-dd'),
                MV_DateFrom: format(voucher.MV_DateFrom, 'yyyy-MM-dd'),
                MV_DateTo: format(voucher.MV_DateTo, 'yyyy-MM-dd'),
                MV_UsedTime: voucher.MV_UsedTime ? format(voucher.MV_UsedTime, 'yyyy-MM-dd HH:mm') : null,
                voucherValue: Number(voucher.MV_VoucherData.Value) || Number(voucher.MV_VoucherData.RemainValue) || voucher.MV_VoucherData.StockCode
            };
            return rtn;
        } catch (error) {
            throw error
        }
    }

    updateVoucher = async (params: any) => {
        const defaultValue = {
            MV_Valid: true,
            MV_Used: false,
            MV_Sync: true,
            MV_ExtraData: {}
        }
        const { schema } = params;
        let entity = Object.assign({}, params);
        const em = await this.getEntityManager(schema);

        entity = {
            ...defaultValue,
            ...params
        }
        entity.MV_CreateDate = params.MV_CreateDate ? parse(params.MV_CreateDate, 'yyyy-MM-dd', new Date()) : new Date();
        entity.MV_DateFrom = parse(params.MV_DateFrom, 'yyyy-MM-dd', new Date());
        entity.MV_DateTo = parse(params.MV_DateTo, 'yyyy-MM-dd', new Date());
        entity.MV_UsedTime = params.MV_Used ? new Date() : null;
        
        delete entity.schema;
        try {
            return await em.getRepository(Voucher).save(entity);     
        } catch (error) {
            throw error
        }
    }

    changeVoucherStatus = async (params: any) => {

        const { voucherCodes, voucherStatus, schema } = params;

        const em = await this.getEntityManager(schema);
        
        try {
            const entities = await em.getRepository(Voucher).find({
                where: {
                    MV_VoucherCode: In(voucherCodes)
                }
            });
            entities.every((e, idx) => {
                switch(voucherStatus) {
                    case 'invalid':
                        e.MV_Valid = false;
                        break;
                    case 'used':
                        e.MV_Used = true;
                        e.MV_UsedTime = new Date();
                        break;
                    default:
                        break;
                }
                return e;
            })
            return await em.getRepository(Voucher).save(entities);
        } catch (error) {
            throw error;
        }
    }
}
