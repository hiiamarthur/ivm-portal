import { Injectable } from '@nestjs/common';
import { IService } from '../common/IService';
import { Campaign, CampaignVoucher } from '../entities/campaign';
import { datatableNoData } from '../common/helper/requestHandler';
import { format, startOfDay, endOfDay, parse } from 'date-fns';
import * as crypto from 'crypto';

@Injectable()
export class CampaignService extends IService {

    getCampaigns = async (params: any) => {
        const { schema, canEdit, start, limit, sort, from, to, listAll, ownerId } = params;
        const em = await this.getEntityManager(schema);

        const sStart = start || 0;
        const sLimit = limit || 25;
        let whereClause = 'RC_Active = 1';
        let queryParameter = {};
        
        if(listAll) {
            if(ownerId) {
                return await em.getRepository(Campaign).createQueryBuilder()
                    .where('RC_Active = 1 AND RC_CampaignID IN (select ONC_CampaignID from Owner_Campaign where ONC_OwnerID = :ownerId)', { ownerId: ownerId })
                    .getMany();
            } else {
                return await em.getRepository(Campaign).find({
                    where: {
                        RC_Active: true
                    }
                })
            }
        }
 
        if(from && to) {
            whereClause += ' AND RC_CreateDate >= :dateFrom AND RC_CreateDate < :dateTo';
            queryParameter = { 
                dateFrom: format(startOfDay(parse(from, 'yyyy-MM-dd', new Date())), 'yyyy-MM-dd HH:mm:ss'), 
                dateTo: format(endOfDay(parse(to, 'yyyy-MM-dd', new Date())), 'yyyy-MM-dd HH:mm:ss')
            }
        }

        if(ownerId) {
            whereClause += ' AND RC_CampaignID IN (select ONC_CampaignID from Owner_Campaign where ONC_OwnerID = :ownerId)';
            queryParameter = { 
                ...queryParameter,
                ownerId: ownerId
            }
        }

        const qb = await em.createQueryBuilder(Campaign, 'campaign').where(whereClause, queryParameter)

        if(sort && sort.length > 0) {
            sort.forEach((s) => {
                qb.addOrderBy(s.column, s.dir)
            })
        } else {
            qb.orderBy('RC_CreateDate', 'DESC');
        }

        const count = await em.createQueryBuilder(Campaign, 'campaign').select('count(*) as total').where(whereClause, queryParameter).getRawOne();

        if(!count || count.total === 0) {
            return datatableNoData;
        }

        const data = await qb.limit(sLimit).offset(sStart).getMany();
        
        const rowData = data.map(d => {
            const btnCell = `<div class="voucherBtns">` +
                            `<a href="/campaign/addvoucher?campaignId=${d.RC_CampaignID}" class="btn btn-outline-dark me-1" title="New Voucher">New Voucher</a>` +
                            `<a href="/campaign/voucher?campaignId=${d.RC_CampaignID}" data-campaignId="${d.RC_CampaignID}" class="btn btn-outline-dark me-1" title="List Voucher">Voucher List</a>` +
                            `<a href="/campaign/edit?campaignId=${d.RC_CampaignID}" class="btn btn-outline-dark me-1 editBtn" title="編輯"><i class="fas fa-pencil"></i></a>` +
                            `<a href="javascript:void(0);" class="btn btn-outline-dark me-1" data-bs-attrid="${d.RC_CampaignID}" data-bs-name="${d.RC_Name}" data-bs-action="campaign-expire" data-bs-title="End/Expire Campaign" data-bs-toggle="modal" data-bs-target="#confirmModal" title="刪除"><i class="fas fa-trash"></i></a>`+
                            `</div>`; 
            return { 
                ...d, 
                btn: canEdit ? btnCell : ''
            }
        });

        return {
            page: sStart,
            ...count,
            recordsTotal: count?.total || 0,
            recordsFiltered: count?.total || 0,
            data: rowData
        }
    }

    getCampaign = async (params: any) => {
        const { schema, campaignId } = params;
        const em = await this.getEntityManager(schema);
        try {
            const entity = await em.getRepository(Campaign).findOneOrFail({
                where: {
                    RC_CampaignID: campaignId
                },
                relations: ['vouchers']
            })
            
            return { 
                ...entity,
                RC_CreateDate: format(entity.RC_CreateDate, 'yyyy-MM-dd'),
                RC_LastUpdate: format(entity.RC_LastUpdate, 'yyyy-MM-dd'),
                RC_DateFrom: format(entity.RC_DateFrom, 'yyyy-MM-dd'),
                RC_DateTo: format(entity.RC_DateTo, 'yyyy-MM-dd')
            };
        } catch (error) {
            throw error;
        }
    }

    getCampaignVouchers = async (params: any) => {
        const { schema, canEdit, start, limit, sort, from, to, voucherType, campaignId, ownerId } = params;
        let whereClause = 'CV_VoucherData <> \'{}\'';
        let queryParameter = {};
        
        if(from && to) {
            whereClause += ' AND CV_CreateDate >= :dateFrom AND CV_CreateDate < :dateTo';
            queryParameter = { 
                dateFrom: format(startOfDay(parse(from, 'yyyy-MM-dd', new Date())), 'yyyy-MM-dd HH:mm:ss'), 
                dateTo: format(endOfDay(parse(to, 'yyyy-MM-dd', new Date())), 'yyyy-MM-dd HH:mm:ss')
            }
        }

        if(campaignId) {
            whereClause += ' AND CV_CampaignID = :campaignId';
            queryParameter = { ...queryParameter, campaignId: campaignId };
        }

        if(voucherType) {
            whereClause += ' AND CV_VoucherType = :voucherType';
            queryParameter = { ...queryParameter, voucherType: voucherType };
        }

        if(ownerId) {
            whereClause += ' AND CV_CampaignID IN (select ONC_CampaignID from Owner_Campaign where ONC_OwnerID = :ownerId)';
            queryParameter = { ...queryParameter, ownerId: ownerId };
        }

        const em = await this.getEntityManager(schema);

        const sStart = start || 0;
        const sLimit = limit || 25;

        const qb = await em.getRepository(CampaignVoucher).createQueryBuilder('vouchers')
        .leftJoinAndSelect('vouchers.campaign', 'campaign')
        .where(whereClause, queryParameter)

        if(sort && sort.length > 0) {
            sort.forEach((s) => {
                if(s.column === 'campaignName') {
                    qb.addOrderBy('campaign.RC_Name', s.dir)
                }else {
                    qb.addOrderBy(s.column, s.dir)
                }
            })
        } 
        else {
            qb.orderBy('CV_CreateDate', 'DESC');
        }

        const count = await em.createQueryBuilder(CampaignVoucher, 'voucher').select('count(*) as total').where(whereClause, queryParameter).getRawOne();

        if(!count || count.total === 0) {
            return datatableNoData;
        }

        const data = await qb.limit(sLimit).offset(sStart).getMany();

        const rowData = data.map(d => {
            let btnCell = `<div class="voucherBtns" data-campaignId="${d.CV_CampaignID}" data-vouchercode="${d.CV_VoucherCode}">` +
                           `<a href="/campaign/editvoucher?voucherCode=${d.CV_VoucherCode}&campaignId=${d.CV_CampaignID}" class="btn btn-outline-dark me-1 editBtn" title="編輯">`;
                btnCell += d.CV_Valid ? `<i class="fas fa-pencil"></i></a>`: `<i class="fas fa-eye"></i></a>`;
                btnCell += d.CV_Valid ? `<a href="javascript:void(0);" class="btn btn-outline-dark me-1" data-bs-campaignid="${d.CV_CampaignID}" data-bs-attrid="${d.CV_VoucherCode}" data-bs-action="invalidate-campaign-voucher" data-bs-title="Invalidate Campaign Voucher" data-bs-toggle="modal" data-bs-target="#confirmModal" title="刪除"><i class="mdi mdi-delete"></i></a></div>`: `</div>`; 
            
            return { 
                ...d, 
                campaignId: d.CV_CampaignID,
                campaignName: d.campaign.RC_Name,
                voucherValue: Number(d.CV_VoucherData.RemainValue) || Number(d.CV_VoucherData.Value) || d.CV_VoucherData.StockCode,
                chkbox: canEdit && d.CV_Valid ? `<input class="form-check-input border border-white" type="checkbox" name="selection" onchange="enableBtnGp()" data-campaignId="${d.CV_CampaignID}" data-vouchercode="${d.CV_VoucherCode}" />` : '',
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

    exportCampaignVoucher = async (params: any) => {
        const { isSuperAdmin, ownerId, schema, sort, from, to, voucherType, campaignId } = params;
        let whereClause = 'CV_VoucherData <> \'{}\'';
        let queryParameter = {};
        if(from && to) {
            whereClause += ' AND CV_CreateDate >= :dateFrom AND CV_CreateDate < :dateTo';
            queryParameter = { 
                dateFrom: format(startOfDay(parse(from, 'yyyy-MM-dd', new Date())), 'yyyy-MM-dd HH:mm:ss'), 
                dateTo: format(endOfDay(parse(to, 'yyyy-MM-dd', new Date())), 'yyyy-MM-dd HH:mm:ss')
            }
        }

        if(voucherType) {
            whereClause += ' AND CV_VoucherType = :voucherType';
            queryParameter = { ...queryParameter, voucherType: voucherType };
        }

        if(!isSuperAdmin) {
            whereClause += ' AND CV_CampaignID IN (select ONC_CampaignID from Owner_Campaign where ONC_OwnerID = :ownerId)';
            queryParameter = { ...queryParameter, ownerId: ownerId };
        }

        if(campaignId) {
            whereClause += ' AND CV_CampaignID = :campaignId';
            queryParameter = { ...queryParameter, campaignId: campaignId };
        }

        const em = await this.getEntityManager(schema);
        const qb = await em.getRepository(CampaignVoucher).createQueryBuilder('vouchers')
        .leftJoinAndSelect('vouchers.campaign', 'campaign')
        .where(whereClause, queryParameter)

        if(sort && sort.length > 0) {
            sort.forEach((s) => {
                if(s.column === 'campaignName') {
                    qb.addOrderBy('campaign.RC_Name', s.dir)
                }else {
                    qb.addOrderBy(s.column, s.dir)
                }
            })
        } 
        else {
            qb.orderBy('CV_CreateDate', 'DESC');
        }

        try {
            const data = await qb.getMany();
            return data.map((d: any) =>{
                return {
                    ...d,
                    campaignId: d.CV_CampaignID,
                    campaignName: d.campaign.RC_Name,
                    voucherValue: Number(d.CV_VoucherData.RemainValue) || Number(d.CV_VoucherData.Value) || d.CV_VoucherData.StockCode,
                    CV_Valid: d.CV_Valid ? 'YES':'NO',
                    CV_Used: d.CV_Used ? 'YES':'NO',
                    CV_CreateDate: format(d.CV_CreateDate, 'yyyy-MM-dd HH:mm:ss'),
                    CV_UsedTime: d.CV_UsedTime ? format(d.CV_UsedTime, 'yyyy-MM-dd HH:mm:ss') : 'N/A'
                }
            })    
        } catch(error) {
            throw error
        }
    }

    getCampaignVoucher = async (params: any) => {
        const { schema, voucherCode, campaignId } = params;
        const em = await this.getEntityManager(schema);
        try {
            const entity = await em.getRepository(CampaignVoucher).findOneOrFail({
                where: {
                    CV_VoucherCode: voucherCode,
                    CV_CampaignID: campaignId
                },
                relations: ['campaign']
            })
            
            return { 
                ...entity,
                CV_CreateDate: format(entity.CV_CreateDate, 'yyyy-MM-dd'),
                CV_DateFrom: format(entity.CV_DateFrom, 'yyyy-MM-dd'),
                CV_DateTo: format(entity.CV_DateTo, 'yyyy-MM-dd'),
                CV_UsedTime: entity.CV_UsedTime ? format(entity.CV_UsedTime, 'yyyy-MM-dd HH:mm'): null,
                voucherValue: Number(entity.CV_VoucherData.RemainValue) || Number(entity.CV_VoucherData.Value) || entity.CV_VoucherData.StockCode
            };
        } catch (error) {
            throw error;
        }
    }

    generateCampaignID = () => {
        return `${crypto.randomBytes(32).toString('hex',0,6)}${format(new Date(), 'yyyyMMdd')}`
    }

    updateCampaign = async (params: any) => {
        const defaultValue = {
            RC_LastUpdate: new Date(),
            RC_ExtraData: {},
        }
        const { schema } = params;
        let entity = Object.assign({}, params);
        const em = await this.getEntityManager(schema);

        entity.RC_Active = params.RC_Active || false;
        entity.RC_CampaignID = params.RC_CampaignID || this.generateCampaignID();
        entity.RC_CreateDate = params.RC_CreateDate ? parse(params.RC_CreateDate, 'yyyy-MM-dd', new Date()) : new Date();
        entity.RC_DateFrom = parse(params.RC_DateFrom, 'yyyy-MM-dd', new Date());
        entity.RC_DateTo = parse(params.RC_DateTo, 'yyyy-MM-dd', new Date());
        entity = {
            ...defaultValue,
            ...entity
        }
        delete entity.schema;
        
        try {
            return await em.getRepository(Campaign).save(entity);     
        } catch (error) {
            throw error
        }
    }

    updateCampaignVoucher = async (params: any) => {
        const defaultValue = {
            CV_Valid: true,
            CV_Used: false,
            CV_Sync: true,
            CV_ExtraData: {}
        }
        const { schema } = params;
        let entity = Object.assign({}, params);
        const em = await this.getEntityManager(schema);
        let campaign;
        if(params.CV_CampaignID) {
            campaign = await em.getRepository(Campaign).findOneOrFail({
                where: {
                    RC_CampaignID: params.CV_CampaignID
                }
            })
        }
        const vDateFrom = parse(params.CV_DateFrom, 'yyyy-MM-dd', new Date());
        const vDateTo = parse(params.CV_DateTo, 'yyyy-MM-dd', new Date());
        if(vDateFrom < campaign.RC_DateFrom || vDateTo > campaign.RC_DateTo) {
            throw new Error('voucher valid period should not be longer than campaign valid period')
        }
        entity = {
            campaign: campaign,
            ...defaultValue,
            ...entity
        }
        entity.CV_VoucherCode = params.CV_VoucherCode || 'cv' + Math.random().toString(36).substring(4);
        entity.CV_CreateDate = params.CV_CreateDate ? parse(params.CV_CreateDate, 'yyyy-MM-dd', new Date()) : new Date();
        entity.CV_UsedTime = params.CV_UsedTime ? params.CV_UsedTime || new Date() : null;
        entity.CV_DateFrom = parse(params.CV_DateFrom, 'yyyy-MM-dd', new Date());
        entity.CV_DateTo = parse(params.CV_DateTo, 'yyyy-MM-dd', new Date());

        delete entity.campaignId;
        delete entity.schema;
        
        try {
            return await em.getRepository(CampaignVoucher).save(entity);
        } catch (error) {
            throw error
        }
    }

    batchUpdateCampaignVoucher = async(params: any) => {
        const { schema, vouchers } = params;
        const em = await this.getEntityManager(schema);
        try {
            await em.getRepository(CampaignVoucher).save(vouchers)
        } catch (error) {
            throw error;
        }
    }

    setCampaignExpire = async (params: any) => {
        const { schema, campaignId } = params;
        const em = await this.getEntityManager(schema);
        try {
            const entity = await em.getRepository(Campaign).findOneOrFail({
                where: {
                    RC_CampaignID: campaignId,
                    RC_Active: true
                },
                relations: ['vouchers']
            });
            entity.RC_Active = false;
            entity.RC_LastUpdate = new Date();
            entity.vouchers.forEach((v, idx) =>{
                v.CV_Valid = false;
            });
            await em.getRepository(Campaign).save(entity)     
        } catch (error) {
            throw error
        }
    }

    setVoucherExpire = async (params: any) => {
        const { schema, voucherCode, remark } = params;
        const em = await this.getEntityManager(schema);
        try {
            const entity = await em.getRepository(CampaignVoucher).findOneOrFail({
                where: {
                    CV_VoucherCode: voucherCode
                }
            })
            entity.CV_Valid = false;
            if(remark) {
                entity.CV_Remark = remark;
            }
            await em.getRepository(CampaignVoucher).save(entity)     
        } catch (error) {
            throw error
        }
    }
}
