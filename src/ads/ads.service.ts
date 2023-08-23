import { Injectable } from '@nestjs/common';
import { Ads } from '../entities/machine';
import { IService } from '../common/IService';
import { datatableNoData } from '../common/helper/requestHandler';
import { format, parse, startOfDay, endOfDay } from 'date-fns';
import { join } from 'path';
import * as fs from 'fs';
 
@Injectable()
export class AdsService extends IService {
    
    listAds = async (params: any) => {
        const { schema, start, limit, sort, adFileName, adFileType, adType, from, to, machineIds, machineId } = params;
        let whereClause = 'MA_AdFileName is not null';
        let queryParameter = {};
        try {
            const em = await this.getEntityManager(schema);
            if(from && to) {
                whereClause += ' AND MA_UploadTime >= :dateFrom AND MA_UploadTime < :dateTo';
                queryParameter = { 
                    dateFrom: format(startOfDay(parse(from, 'yyyy-MM-dd', new Date())), 'yyyy-MM-dd HH:mm:ss'), 
                    dateTo: format(endOfDay(parse(to, 'yyyy-MM-dd', new Date())), 'yyyy-MM-dd HH:mm:ss')
                }
            }
            if(adFileName) {
                whereClause += ' AND MA_AdFileName = :adFileName'
                queryParameter = { ...queryParameter, adFileName: adFileName }
            }
            if(adFileType) {
                whereClause += ' AND MA_AdFileType = :adFileType'
                queryParameter = { ...queryParameter, adFileType: adFileType }
            }
            if(adType) {
                whereClause += ' AND MA_AdType = :adType';
                queryParameter = { ...queryParameter, adType: adType }
            }
            if(machineIds) {
                whereClause += ' AND MA_MachineID in (:...machineIds)';
                queryParameter = { ...queryParameter, machineIds: machineIds }
            }
            if(machineId) {
                whereClause += ' AND MA_MachineID = :machineId';
                queryParameter = { ...queryParameter, machineId: machineId } 
            }

            const sStart = start || 0;
            const sLimit = limit || 25;
            const qb = em.getRepository(Ads).createQueryBuilder('ads').where(whereClause, queryParameter);
            if(sort && sort.length > 0) {
                sort.forEach((s) => {
                    qb.addOrderBy(s.column, s.dir)
                })
            } else {
                qb.orderBy('MA_MachineID', 'ASC');
                qb.addOrderBy('MA_AdType', 'ASC');
                qb.addOrderBy('MA_Order', 'ASC');
            }
            const count = await em.createQueryBuilder(Ads, 'ads').select('count(*) as total').where(whereClause, queryParameter).getRawOne();

            if(!count || count.total === 0) {
                return datatableNoData;
            }

            const data = await qb.limit(sLimit).offset(sStart).getMany();
            return {
                page: start,
                ...count,
                recordsTotal: count?.total || 0,
                recordsFiltered: count?.total || 0,
                data: data
            }
        } catch (error) {
            throw error;
        }
    }

    saveUploadAds = async (params: any) => {
        const { reqBody, schema, temppath, originalname } = params;
        const adsDir = join('./upload', '..', 'ad_upload');
        // move file to /ad_upload
        await fs.rename(temppath, join(adsDir, originalname), (err) => {
            if (err) throw err;
        })
        fs.unlinkSync(temppath);
        const machineIds = reqBody.machineIds.split(',');
        const entities = machineIds.map(async (machineId) => {
            return {
                MA_AdFileName: reqBody.MA_AdFileName,
                MA_AdFileType: reqBody.MA_AdFileType,
                MA_AdType: reqBody.MA_AdType,
                MA_Active: reqBody.MA_Active ? reqBody.MA_Active : 0,
                MA_MachineID: machineId,
                MA_UploadTime: new Date(),
                MA_LastUpdate: new Date(),
                MA_Order: reqBody.MA_Order
            }
        })
        try {
            const em = await this.getEntityManager(schema);
            return em.getRepository(Ads).save(entities);
        } catch (error) {
            throw error;
        }
    }

    saveAdsDetail = async (params: any) => {
        const em = await this.getEntityManager(params.schema);
        try {
            await em.save(params.enitity);
            return true
        } catch (error) {
            throw error;
        }
    }
}
