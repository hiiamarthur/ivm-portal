import { Injectable } from '@nestjs/common';
import { Machine, Ads } from '../entities/machine';
import { IService } from '../common/IService';
import { datatableNoData, handleArrayParams } from '../common/helper/requestHandler';
import { format, parse, startOfDay, endOfDay } from 'date-fns';
import { join } from 'path';
import * as fs from 'fs';
import * as crypto from 'crypto';
 
@Injectable()
export class AdsService extends IService {

    private dateFormat = 'yyyy-MM-dd HH:mm:ss';

    getAdsMachineList = async (params: any) => {
        const { isSuperAdmin, ownerId, schema } = params;
        try {
            const em = await this.getEntityManager(schema);
            if(isSuperAdmin) {
                return await em.getRepository(Machine).createQueryBuilder('machine')
                .leftJoinAndSelect('machine.type', 'type')
                .where('M_Active = 1 AND M_Name not like :name AND M_MachineID not like :machineId', { name: `%收機%`, machineId: '%C%' })
                .getMany();
            } else {
                return await em.getRepository(Machine).createQueryBuilder('machine')
                .leftJoinAndSelect('machine.type', 'type')
                .where('M_MachineID in (select ONM_MachineID from Owner_Machine where ONM_OwnerID = :ownerId)', { ownerId: ownerId })
                .getMany();
            }
        } catch (error) {
            throw error;
        }
    }
    
    listAds = async (params: any) => {
        const { schema, start, limit, sort, adFileName, adFileType, adType, from, to, machineIds, machineId } = params;
        let whereClause = 'MA_AdFileName is not null';
        let queryParameter = {};
        try {
            const em = await this.getEntityManager(schema);
            if(from && to) {
                whereClause += ' AND MA_UploadTime >= :dateFrom AND MA_UploadTime < :dateTo';
                queryParameter = { 
                    dateFrom: format(startOfDay(parse(from, 'yyyy-MM-dd', new Date())), this.dateFormat), 
                    dateTo: format(endOfDay(parse(to, 'yyyy-MM-dd', new Date())), this.dateFormat)
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

            let data:any[] = await qb.limit(sLimit).offset(sStart).getMany();
            data = data.map((d) =>{ 
                return {
                    ...d,
                    MA_AdType: d.MA_AdType === 1 ? '機頂' : '待機',
                    MA_DateFrom: format(d.MA_DateFrom, this.dateFormat),
                    MA_DateTo: format(d.MA_DateTo, this.dateFormat),
                    duration: d.MA_Config.duration || 'N/A',
                    scale: d.MA_Config.scale || 'N/A',
                    MA_UploadTime: format(d.MA_UploadTime, this.dateFormat),
                    MA_LastUpdate: format(d.MA_LastUpdate, this.dateFormat),
                    btn: `<a href="ads/detail?adId=${d.MA_ADID}" class="btn btn-outline-dark me-1" title="Edit Ads" viewAds"><i class="fas fa-pencil"></i></a>` +
                    `<a href="#" class="btn btn-outline-dark me-1 delAds ${d.MA_Active === false ? 'd-none': ''}" title="刪除" data-adid="${d.MA_ADID}" onclick="changeAdsStatus(event)"><i class="mdi mdi-delete"></i></a>` +
                    `<a href="#" class="btn btn-outline-dark enableAds ${d.MA_Active ? 'd-none': ''}" title="使用" data-adid="${d.MA_ADID}" onclick="changeAdsStatus(event)"><i class="fas fa-check fw-bolder"></i></a>`
                }
            })
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

    listAdsConfig = async (params: any) => {
        const { schema, machineId } = params;
        const em = await this.getEntityManager(schema);
        const ads = await em.getRepository(Ads).find({
            where: {
                MA_MachineID: machineId
            }
        })
        const machine = await em.getRepository(Machine).findOne({
            where: {
                M_MachineID: machineId
            }
        })
        if(machine.M_Config && machine.M_Config.custom_config ) {
            return { ads: ads, custom_config: machine.M_Config.custom_config }
        } else {
            return { ads: ads, custom_config: null }
        }        
    }

    getAdForDownload = async (params: any) => {
        const { schema, machineId, adFileName } = params;
        const em = await this.getEntityManager(schema);
        try {
            const entities = await em.getRepository(Ads).find({
                where: {
                    MA_MachineID: machineId,
                    MA_AdFileName: adFileName
                },
                order: {
                    MA_LastUpdate: 'desc'
                }
            })
            if(entities.length === 0) {
                throw new Error('file not exist');
            }
            return entities[0];
        } catch (error) {
            throw error;
        }
    }


    saveUploadAds = async (params: any) => {
        const { reqBody, schema, temppath, originalname, file_format } = params;
        const adsDir = join('./upload', '..', '..', 'ad_upload');
        // move file to /ad_upload
        await fs.rename(temppath, join(adsDir, originalname), (err) => {
            if (err) throw err;
        })
        let adConfig:any = {"name": reqBody.MA_AdFileName, "duration": reqBody.duration, "file_format": file_format};
        if(reqBody.scale) {
            adConfig = { ...adConfig, "scale": reqBody.scale }
        }
        try {
            const em = await this.getEntityManager(schema);
            if(reqBody.machineIds) {
                const machineIds = handleArrayParams(reqBody.machineIds);
                const chunks = machineIds.reduce((resultArray, item, index) => { 
                    const chunkIndex = Math.floor(index/100)
                  
                    if(!resultArray[chunkIndex]) {
                      resultArray[chunkIndex] = [] // start a new chunk
                    }
                  
                    resultArray[chunkIndex].push(item)
                  
                    return resultArray
                  }, [])
                const result = chunks.map(async (chunk) => {
                    const entities = chunk.map((machineId) => {
                        const adid = crypto.randomBytes(32).toString('hex', 0, 15);
                        return {
                            MA_ADID: adid,
                            MA_AdFileName: reqBody.MA_AdFileName,
                            MA_AdFileType: reqBody.MA_AdFileType,
                            MA_AdType: reqBody.MA_AdType,
                            MA_Active: true,
                            MA_MachineID: machineId,
                            MA_DateFrom: reqBody.MA_DateFrom,
                            MA_DateTo: reqBody.MA_DateTo,
                            MA_UploadTime: new Date(),
                            MA_LastUpdate: new Date(),
                            MA_Order: reqBody.MA_Order,
                            MA_Config: adConfig
                        }
                    })
                    await em.getRepository(Ads).save(entities);
                    return entities;
                })  
                return result;
            } else {
                const entity = {
                        MA_ADID: reqBody.MA_ADID,
                        MA_AdFileName: reqBody.MA_AdFileName,
                        MA_AdFileType: reqBody.MA_AdFileType,
                        MA_AdType: reqBody.MA_AdType,
                        MA_Active: true,
                        MA_MachineID: reqBody.MA_MachineID,
                        MA_DateFrom: reqBody.MA_DateFrom,
                        MA_DateTo: reqBody.MA_DateTo,
                        MA_UploadTime: new Date(),
                        MA_LastUpdate: new Date(),
                        MA_Order: reqBody.MA_Order,
                        MA_Config: adConfig
                }
                return em.getRepository(Ads).save(entity);
            } 
        } catch (error) {
            throw error;
        }
    }

    getAdsDetail = async (params: any) => {
        const { schema, adId } = params;
        const em = await this.getEntityManager(schema);
        const pickerFormat = 'yyyy-MM-dd';
        try {
            const entity = await em.getRepository(Ads).findOne({
                where: {
                    MA_ADID: adId
                }
            })
            return {
                ...entity,
                MA_AdType: entity.MA_AdType,
                MA_DateFrom: format(entity.MA_DateFrom, pickerFormat),
                MA_DateTo: format(entity.MA_DateTo, pickerFormat),
                duration: entity.MA_Config.duration || 'N/A',
                scale: entity.MA_Config.scale || 'N/A',
                MA_UploadTime: format(entity.MA_UploadTime, pickerFormat),
                MA_LastUpdate: format(entity.MA_LastUpdate, pickerFormat)
            }
        } catch (error) {
            throw error;
        }
    }

    saveAdsDetail = async (params: any) => {
        const { schema, ads } = params;
        const em = await this.getEntityManager(schema);
        try {
            if(!ads) {
                throw new Error('no entity')
            }
            ads.MA_LastUpdate = new Date();
            await em.getRepository(Ads).save(ads);
            return true
        } catch (error) {
            throw error;
        }
    }

    disabledAds = async (params: any) => {
        const { schema, adId } = params;
        try {
            const em = await this.getEntityManager(schema);
            const entity = await em.getRepository(Ads).findOne({
                where: {
                    MA_ADID: adId
                }
            })
            entity.MA_Active = false;
            entity.MA_LastUpdate = new Date();
            await em.getRepository(Ads).save(entity);
            return true;
        } catch (error) {
            throw error;
        }
    }
}
