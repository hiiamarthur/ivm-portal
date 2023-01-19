import { Injectable } from '@nestjs/common';
import { Ads } from '../entities/machine';
import { IService } from '../common/IService';
import { datatableNoData } from '../common/helper/requestHandler';
import { format, parse, startOfDay, endOfDay } from 'date-fns';

@Injectable()
export class AdsService extends IService {

    getOne = async (params: any) => {
        const { schema, name } = params;
        try {
            const em = await this.getEntityManager(schema);
            return em.getRepository(Ads).findOne({
                where: {
                    MA_ADID: name
                }
            })
        } catch (error) {
            throw error;
        }
    }
    
    listAds = async (params: any) => {
        const { schema, start, limit, sort, adsType, from, to, machineIds } = params;
        let whereClause = 'MA_ADID is not null';
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
            if(adsType) {
                whereClause += ' AND MA_AdType = :adsType';
                queryParameter = { ...queryParameter, adsType: adsType }
            }
            if(machineIds) {
                whereClause += ' AND MA_MachineID in (:...machineIds)';
                queryParameter = { ...queryParameter, machineIds: machineIds }
            }

            const sStart = start || 0;
            const sLimit = limit || 25;
            const qb = em.getRepository(Ads).createQueryBuilder('ads').where(whereClause, queryParameter);
            if(sort && sort.length > 0) {
                sort.forEach((s) => {
                    qb.addOrderBy(s.column, s.dir)
                })
            } else {
                qb.orderBy('MA_UploadTime', 'DESC');
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

    updateAds = async (params: any) => {
        const { schema, entity } = params;
        try {
            const em = await this.getEntityManager(schema);
            return em.getRepository(Ads).save(entity);
        } catch (error) {
            throw error;
        }
    }

    getLastAdIndex = async (params: any) => {
        const { schema, machineId } = params;
        const em = await this.getEntityManager(schema);
        const result = await em.createQueryBuilder(Ads, 'ads')
        .where('MA_MachineID = :machineId', { machineId: machineId })
        .orderBy('MA_Index', 'DESC')
        .getOne();
        return result !== null ? result.MA_Index + 1 : 1;
    }
}
