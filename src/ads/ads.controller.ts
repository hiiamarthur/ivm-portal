import { Inject, Logger, LoggerService, UseGuards, Controller, Get, Post, Put, Body, Query, Render, HttpStatus, Request, Res, UseInterceptors, UploadedFile, BadRequestException } from '@nestjs/common';

import { FileInterceptor } from '@nestjs/platform-express';
import { machineAdsFilesFilter, handleArrayParams } from '../common/helper/requestHandler';
import { getColumnOptions } from '../entities/columnNameMapping';
import { AuthenticatedGuard } from '../common/guards/authenticated.guard';
import { AdsService } from './ads.service';
import { diskStorage } from 'multer';
import { join } from 'path';
import * as fs from 'fs';


@UseGuards(AuthenticatedGuard)
@Controller('ads')
export class AdsController {

    constructor(
        @Inject(Logger) private readonly logger: LoggerService,
        private service: AdsService
    ){}

    @Get('uploadform')
    @Render('pages/ads/uploadform')
    async adsUploadForm(@Request() req) {
        const {ON_OwnerID, schema } = req.user;
        const machineList = await this.service.getAdsMachineList({ schema: schema, ownerId: ON_OwnerID })
        return { ...req, machineList: machineList }
    }

    /* https://github.com/expressjs/multer#diskstorage */
    @Put('upload')
    @UseInterceptors(
        FileInterceptor('adfile', {
          storage: diskStorage({
            destination: './upload'
          }),
          fileFilter: machineAdsFilesFilter,
        }),
    )
    async uploadFile(@UploadedFile() adfile, @Request() req, @Body() reqBody, @Res() res) {
        const { schema } = req.user;
        this.logger.debug(`[AdsController] upload ${adfile.originalname} to ${adfile.path}`);
        const adsDir = join('./upload', '..', '..', 'ad_upload');
        const fileExist = fs.existsSync(join(adsDir, adfile.originalname));
        if(fileExist) {
            throw new BadRequestException(`file ${adfile.originalname} already exist. Please change the filename before upload`);
        }
        const file_format = adfile.mimetype.substring(0, 5);
        let result;
        try {
            result = await this.service.saveUploadAds({ 
                reqBody: reqBody, 
                schema: schema, 
                temppath: adfile.path, 
                originalname: adfile.originalname.replaceAll(' ','_'),
                file_format: file_format
            })
        } catch (error) {
            throw error;
        }
        res.status(HttpStatus.OK).json({ data: result, message: 'upload success'});    
    }

    @Get()
    @Render('pages/tablewithfilter')
    async adsListPage(@Request() req) { 
        const { isSuperAdmin, ON_OwnerID, schema } = req.user;
        const machineList = await this.service.getAdsMachineList({ schema: schema, isSuperAdmin: isSuperAdmin, ownerId: ON_OwnerID })
        return { ...req, machineList: machineList, columnOp: getColumnOptions('ads'), action: 'ads/list', method: 'post', showDateRangeFilter: true };
    }

    @Post('list')
    async machineadsList(@Request() req, @Body() reqBody, @Res() res) {
        let params = {
            ...reqBody,
            schema: req.user.schema,
            limit: reqBody.length
        }
        if(reqBody.machineIds && reqBody.machineIds.length > 0) {
            params = { ...params, machineIds: handleArrayParams(reqBody.machineIds) }
        }
        const result = await this.service.listAds(params)
        res.status(HttpStatus.OK).json(result);
    }

    @Get('detail')
    @Render('pages/ads/detail')
    async adsDetail(@Request() req, @Query('adId') adId) {
        const { schema } = req.user;
        const params = {
            schema: schema,
            adId: adId
        }
        const entity = await this.service.getAdsDetail(params);
        return { ...req, ads: entity } 
    }

    @Post('save-detail')
    async saveAdsDetail(@Request() req, @Body() reqBody, @Res() res) {
        try {
            await this.service.saveAdsDetail({ ...req, ...reqBody })
            res.status(HttpStatus.OK).json({ message: 'success' })
        } catch (error) {
            res.status(HttpStatus.BAD_REQUEST).json({ message: error.message })
        }
    }

    @Post('change-status')
    async disabledAds(@Request() req, @Body() reqBody, @Res() res) {
        const { schema } = req.user;
        const { adId, disabled } = reqBody;
        const params = {
            schema: schema,
            adId: adId,
            disabled: disabled
        }
        try {
            await this.service.disabledAds(params);
            res.status(HttpStatus.OK).json({ message: 'update success' })
        } catch (error) {
            res.status(HttpStatus.BAD_REQUEST).json({ message: error.message })
        }
    }
}

