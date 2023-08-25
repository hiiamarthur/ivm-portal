
import { Inject, Logger, LoggerService, UseGuards, Controller, Post, HttpStatus, Request, Res, StreamableFile, Body } from '@nestjs/common';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { AdsService } from './ads.service';
import { AdType } from '../entities/machine';
import { format } from 'date-fns';
import { createReadStream } from 'fs';
import * as fs from 'fs';
import { join } from 'path';
import { Response } from 'express';

@UseGuards(JwtAuthGuard)
@Controller('machine/ads')
export class AdsApiController {

    constructor(
        @Inject(Logger) private readonly logger: LoggerService,
        private service: AdsService
    ){}

    @Post('config')
    async getMachineAdConfig(@Request() req, @Res() res) {
      this.logger.debug(`getMachineAdConfig machine: ${JSON.stringify(req.user)}`);
      let result;
      try {
        result = await this.service.listAdsConfig({ ...req.user });
      } catch (error) {
        this.logger.error(`getMachineAdConfig error ${JSON.stringify(error)}`)
      }
      const standbys = result.ads.filter((c) => c.MA_AdType === AdType.standby).reduce((acc, obj) => {
          acc.push(obj.MA_Config);
          return acc;
      },[]);
      const topads = result.ads.filter((c) => c.MA_AdType === AdType.topad).reduce((acc, obj) => {
          acc.push(obj.MA_Config);
          return acc;
      },[]);
      const sortByLastUpdate = result.ads.sort((a, b) => {
          if(a.MA_LastUpdate > b.MA_LastUpdate) {
            return -1
          }
          if(a.MA_LastUpdate < b.MA_LastUpdate) {
            return 1
          }
          return 0;
        })
      let playlist:any = { machine_top_playlist: topads, standby_mode_playlist: standbys, lastUpdate: format(sortByLastUpdate[0].MA_LastUpdate, 'yyyy-MM-dd HH:mm:ss') }
      if(result.custom_config) {
        playlist = { ...playlist, standby: result.custom_config.standby }
      }
      this.logger.debug(`getMachineAdConfig output ${JSON.stringify(playlist)}`)
      res.status(HttpStatus.OK).json(playlist);
    }

    @Post('download-ad')
    async downloadAd(@Request() req, @Body() reqBody, @Res({ passthrough: true }) res: Response) {
      const { schema, machineId } = req.user;
      const { filename } = reqBody;
      const adDir = join(__dirname, '..', '..', '..', '/ad_upload');
      const isFileExist = fs.existsSync(join(adDir, filename));
      if(!isFileExist) {
        throw new Error(`file: ${filename} not exist`);
      }
      const file = createReadStream(join(adDir, filename));
      const ads = await this.service.getAdForDownload({ schema: schema, machineId: machineId, adFileName: filename })
      res.set({
        'Content-Type': ads.MA_AdFileType,
        'Content-Disposition': `attachment; filename="${filename}"`,
      });
      return new StreamableFile(file);
    }
}