import { Inject, Logger, LoggerService, UseGuards, Controller, Get, Post, Body, Render, HttpStatus, Request, Res, UseInterceptors, UploadedFile } from '@nestjs/common';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { FileInterceptor } from '@nestjs/platform-express';
import { machineAdsFilesFilter } from '../common/helper/requestHandler';
import { getColumnOptions } from '../entities/columnNameMapping';
import { AuthenticatedGuard } from '../common/guards/authenticated.guard';
import { AdsService } from './ads.service';
import { OwnerService } from '../owner/owner.service';
import { diskStorage } from 'multer';
import { AdType } from '../entities/machine';
import { format } from 'date-fns';

@UseGuards(AuthenticatedGuard)
@Controller('ads')
export class AdsController {

    constructor(
        @Inject(Logger) private readonly logger: LoggerService,
        private service: AdsService,
        private ownerService: OwnerService
    ){}

    @Get('uploadform')
    @Render('pages/ads/uploadform')
    async adsUploadForm(@Request() req) {
        const { schema } = req.user;
        const machineList = await this.ownerService.getOwnerMachine({ schema: schema })
        return { ...req, machineList: machineList }
    }

    /* https://github.com/expressjs/multer#diskstorage */
    @Post('upload')
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
        this.logger.debug(`[AdsController] upload ${adfile.originalname} to ${adfile.path}`)
        let result;
        try {
            result = await this.service.saveUploadAds({ reqBody: reqBody, schema: schema, temppath: adfile.path, originalname: adfile.originalname })
        } catch (error) {
            throw error;
        }
        res.status(HttpStatus.OK).json({ data: result, message: 'upload success'});    
    }

    @UseGuards(AuthenticatedGuard)
    @Get()
    @Render('pages/tablewithfilter')
    async adsListPage(@Request() req) { 
        const { schema } = req.user;
        const machineList = await this.ownerService.getOwnerMachine({ schema: schema })
        return { ...req, machineList: machineList, columnOp: getColumnOptions('ads'), action: 'ads/list', method: 'post', showDateRangeFilter: true };
    }

    @UseGuards(JwtAuthGuard)
    @Post('ads/config')
    async getMachineAdConfig(@Request() req, @Res() res) {
        const result = await this.service.listAds({ ...req.user });
        const standbys = result.data.filter((c) => c.MA_AdType === AdType.standby).reduce((acc, obj) => {
            acc.push(obj.MA_Config);
            return acc;
        },[]);
        const topads = result.data.filter((c) => c.MA_AdType === AdType.topad).reduce((acc, obj) => {
            acc.push(obj.MA_Config);
            return acc;
        },[]);
        const sortByLastUpdate = result.data.sort((a, b) => {
            if(a.MA_LastUpdate > b.MA_LastUpdate) {
              return 1
            }
            if(a.MA_LastUpdate < b.MA_LastUpdate) {
              return -1
            }
            return 0;
          })
        res.status(HttpStatus.OK).json({ machine_top_playlist: topads, standby_mode_playlist: standbys, lastUpdate: format(sortByLastUpdate[0].MA_LastUpdate, 'yyyy-MM-dd HH:mm:ss') })
    }

    @UseGuards(AuthenticatedGuard)
    @Post('save')
    async saveAdsDetail(@Request() req, @Body() reqBody, @Res() res) {
        res.status(HttpStatus.OK).json({ message: 'success' })
    }

}

