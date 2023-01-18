import { UseGuards, Controller, Get, Post, Body, Query, Render, HttpStatus, Request, Res, UseInterceptors, UploadedFile, BadRequestException, Delete } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { handleColumnSorter, imageOrVideoFileFilter, editFileName } from '../common/helper/requestHandler';
import { getColumnOptions } from '../entities/columnNameMapping';
import { AuthenticatedGuard } from '../common/guards/authenticated.guard';
import { AdsService } from './ads.service';
import { OwnerService } from '../owner/owner.service';
import * as fs from 'fs';
import { join } from 'path';


//@UseGuards(AuthenticatedGuard)
@Controller('ads')
export class AdsController {

    constructor(
        private service: AdsService,
        private ownerService: OwnerService
    ){}

    //testing
    @Get('uploadform')
    @Render('pages/ads/uploadform')
    async adsUploadForm(@Request() req) {
        const machineList = await this.ownerService.getOwnerMachine({ schema: 'iVendingDB_IVM' })
        return { ...req, machineList: machineList }
    }

    //https://github.com/expressjs/multer#diskstorage
    @Post('upload')
    @UseInterceptors(
        FileInterceptor('adfile', {
          storage: diskStorage({
            destination: './upload',
            filename: editFileName,
          }),
          fileFilter: imageOrVideoFileFilter,
        }),
    )
    uploadFile(@UploadedFile() adfile: Express.Multer.File, @Body() reqBody, @Res() res) {
        let copySuccess = false;
        const tempLoc = join('./upload/', adfile.filename);
        const adsDir = join('..', './ad_upload');
        try {
            fs.access(adsDir, (accessError) => {
                if(!accessError) {
                    fs.copyFile(tempLoc, join(adsDir, adfile.filename), (copyError) =>{
                        if (copyError) {
                            console.error(copyError)
                        } else {
                            copySuccess = true;
                        }
                    })     
                }
            });
        } catch (error){
            console.error(error)
        }
        const echoObj = {
            originalname: adfile.originalname,
            filename: adfile.filename,
            location: copySuccess ? join(adsDir, adfile.filename) : tempLoc
        };
        res.status(HttpStatus.OK).json({ echoObj: {...reqBody, ...echoObj }, message: 'upload success'});    
    }

    @UseGuards(AuthenticatedGuard)
    @Get()
    @Render('pages/tablewithfilter')
    async adsListPage(@Request() req) { 
        const { schema } = req.user;
        const machineList = await this.ownerService.getOwnerMachine({ schema: schema })
        return { ...req, machineList: machineList, columnOp: getColumnOptions('ads'), action: 'ads/list', method: 'post', showDateRangeFilter: true };
    }

    @UseGuards(AuthenticatedGuard)
    @Post('list')
    async adsList(@Request() req, @Body() reqBody, @Res() res) {
        const { schema } = req.user;
        const { order } = reqBody;
        const sort = handleColumnSorter(order, 'ads');
        const data = await this.service.listAds({ ...reqBody, schema: schema, sort: sort });
        res.status(HttpStatus.OK).json(data);
    }

    @UseGuards(AuthenticatedGuard)
    @Get(['add', 'edit'])
    async adsEditForm(@Request() req, @Query('adsId') adsId) {
        const { schema } = req.user;
        let ads;
        if(adsId) {
            ads = await this.service.getOne({ schema: schema, adsId: adsId })
        } else {
            throw new BadRequestException('No voucherCode or campaignId')
        }
        return { ...req, ads: ads }
    }

    @UseGuards(AuthenticatedGuard)
    @Post('save')
    async saveAds(@Request() req, @Body() reqBody, @Res() res) {
        const { schema } = req.user;
        try {
            await this.service.updateAds({
                ...reqBody,
                schema: schema
            })
            res.status(HttpStatus.OK).json({message: 'success'})
        } catch (error) {
            res.status(HttpStatus.BAD_REQUEST).json({message: error.message})
        }
    }

}

