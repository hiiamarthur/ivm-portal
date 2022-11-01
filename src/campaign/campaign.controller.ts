import { Controller, Render, Get, Post, Request, Res, Body, HttpStatus, UseGuards, Query } from '@nestjs/common';
import { AuthenticatedGuard } from '../common/guards/authenticated.guard';
import { CampaignService } from './campaign.service';
import { getColumnOptions } from '../entities/columnNameMapping';
import { handleColumnSorter } from '../common/helper/requestHandler';

@UseGuards(AuthenticatedGuard)
@Controller('campaign')
export class CampaignController {

    constructor(
        private service: CampaignService
    ){}

    @Get()
    @Render('pages/tablewithfilter')
    listCampaign(@Request() req) {
        return { ...req, columnOp: getColumnOptions('campaign'), action: 'campaign', method: 'post', showDateRangeFilter: true };
    }

    @Post()
    async listCampaignData(@Request() req, @Body() reqBody, @Res() res) {
        const { schema, permissionsMap } = req.user;

        const { order } = reqBody;

        const sort = handleColumnSorter(order, 'campaign');
        
        const canEdit = permissionsMap['campaignvoucher']['Edit'];

        const params = {
            ...reqBody,
            schema: schema,
            sort: sort,
            canEdit: canEdit
        }

        const data = await this.service.getCampaigns(params);

        res.status(HttpStatus.OK).json(data);
    }
    
    @Get('voucher')
    @Render('pages/tablewithfilter')
    async listCampaignVoucher(@Request() req, @Query('campaignId') campaignId) {
        const { schema, permissionsMap } = req.user;
        const showExport = permissionsMap['campaignvoucher']['Export'] || 0;
        const showImport = permissionsMap['campaignvoucher']['Import'] || 0;
        const campaignList = await this.service.getCampaigns({ schma: schema, listAll: true })
        return { ...req, campaignList: campaignList, campaignId: campaignId, columnOp: getColumnOptions('campaign/voucher'), action: 'voucher', method: 'post', showDateRangeFilter: true, showExport: showExport, showImport: showImport };
    }
    
    @Post('voucher')
    async listCampaignVoucherData(@Request() req, @Body() reqBody, @Res() res) {
        const { schema, permissionsMap } = req.user;

        const { order } = reqBody;

        const sort = handleColumnSorter(order, 'campaign/voucher');
        
        const canEdit = permissionsMap['campaignvoucher']['Edit'];

        const params = {
            ...reqBody,
            schema: schema,
            sort: sort,
            canEdit: canEdit
        }

        const data = await this.service.getCampaignVouchers(params);

        res.status(HttpStatus.OK).json(data);
    }

    @Get(['add', 'edit'])
    @Render('pages/campaign/form')
    async campaignForm(@Request() req, @Query('campaignId') campaignId) {
        const { schema } = req.user;
        let campaign;
        if(campaignId) {
            campaign = await this.service.getCampaign({
                schema: schema,
                campaignId: campaignId
            });
        }
        return { ...req, campaign: campaign }
    }

    @Get(['addvoucher', 'editvoucher'])
    @Render('pages/campaign/voucherform')
    async campaignVoucherForm(@Request() req, @Query('voucherCode') voucherCode) {
        const { schema } = req.user;
        let voucher;
        if(voucherCode) {
            voucher = await this.service.getCampaignVoucher({
                schema: schema,
                voucherCode: voucherCode
            });
        }
        const campaignList = await this.service.getCampaigns({ schma: schema, listAll: true })
        return { ...req, campaignList: campaignList, voucher: voucher }
    }

    @Post('validperiod')
    async getCampaignValidPeriod(@Request() req, @Body() reqBody, @Res() res) {
        const { schema } = req.user;
        const campaign = await this.service.getCampaign({ schema: schema, campaignId: reqBody.campaignId });
        return res.status(HttpStatus.OK).json({ dateFrom: campaign.RC_DateFrom, dateTo: campaign.RC_DateTo });
    }

    @Post('save')
    async saveCampaign(@Request() req, @Body() reqBody, @Res() res) {
        const { schema } = req.user;
        try {
            await this.service.updateCampaign({
                ...reqBody,
                schema: schema
            })
            res.status(HttpStatus.OK).json({message: 'success'})
        } catch (error) {
            res.status(HttpStatus.BAD_REQUEST).json(error)
        }
    }

    @Post('voucher/save')
    async saveCampaignVoucher(@Request() req, @Body() reqBody, @Res() res) {
        const { schema } = req.user;
        try {
            await this.service.updateCampaignVoucher({
                ...reqBody,
                schema: schema
            })
            res.status(HttpStatus.OK).json({message: 'success'})
        } catch (error) {
            res.status(HttpStatus.BAD_REQUEST).json({message: error.message })
        }
    }

    @Post('voucher/batchupdate')
    async batchUpdateCampaignVouchers(@Request() req, @Body() reqBody, @Res() res) {
        const { schema } = req.user;
        try {
            await this.service.batchUpdateCampaignVoucher({
                ...reqBody,
                schema: schema
            })
            res.status(HttpStatus.OK).json({message: 'success'})   
        } catch (error) {
            res.status(HttpStatus.BAD_REQUEST).json(error);
        }
    }

    @Post('expire')
    async campaignExpire(@Request() req, @Body() reqBody, @Res() res) {
        const { schema } = req.user;
        try {
            await this.service.setCampaignExpire({
                ...reqBody,
                schema: schema
            })
            res.status(HttpStatus.OK).json({message: 'success'})
        } catch (error) {
            res.status(HttpStatus.BAD_REQUEST).json(error)
        }
    }

    @Post('voucherexpire')
    async voucherExpire(@Request() req, @Body() reqBody, @Res() res) {
        const { schema } = req.user;
        try {
            await this.service.setVoucherExpire({
                ...reqBody,
                schema: schema
            })
            res.status(HttpStatus.OK).json({message: 'success'})
        } catch (error) {
            res.status(HttpStatus.BAD_REQUEST).json(error)
        }
    }
}
