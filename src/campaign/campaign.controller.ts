import { Controller, Render, Get, Post, Delete, Request, Res, Body, Param, HttpStatus, UseGuards, Query, BadRequestException, NotFoundException } from '@nestjs/common';
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
        const { schema, permissionsMap, isSuperAdmin, ON_OwnerID } = req.user;

        const { order, length } = reqBody;

        const sort = handleColumnSorter(order, 'campaign');
        
        const canEdit = isSuperAdmin ? true : permissionsMap['campaignvoucher']['Edit'];

        const params = {
            ...reqBody,
            schema: schema,
            sort: sort,
            limit: length,
            canEdit: canEdit
        }
        if(!isSuperAdmin) {
            params.ownerId = ON_OwnerID
        }

        const data = await this.service.getCampaigns(params);

        res.status(HttpStatus.OK).json(data);
    }
    
    @Get('voucher')
    @Render('pages/tablewithfilter')
    async listCampaignVoucher(@Request() req, @Query('campaignId') campaignId) {
        const { schema, permissionsMap, isSuperAdmin, ON_OwnerID } = req.user;
        const showExport = !isSuperAdmin ? permissionsMap['campaignvoucher']['Export'] || 0 : 1;
        const showImport = !isSuperAdmin ? permissionsMap['campaignvoucher']['Import'] || 0 : 1;
        const campaignList = isSuperAdmin ? await this.service.getCampaigns({ schema: schema, listAll: true }) : await this.service.getCampaigns({ schma: schema, listAll: true, ownerId: ON_OwnerID })
        return { ...req, campaignList: campaignList, campaignId: campaignId, columnOp: getColumnOptions('campaign/voucher'), action: 'voucher', method: 'post', showDateRangeFilter: true, showExport: showExport, showImport: showImport };
    }
    
    @Post('voucher')
    async listCampaignVoucherData(@Request() req, @Body() reqBody, @Res() res) {
        const { schema, permissionsMap, isSuperAdmin, ON_OwnerID } = req.user;

        const { order, length } = reqBody;

        const sort = handleColumnSorter(order, 'campaign/voucher');
        
        const canEdit = isSuperAdmin ? true : permissionsMap['campaignvoucher']['Edit'];

        const params = {
            ...reqBody,
            schema: schema,
            sort: sort,
            limit: length,
            canEdit: canEdit
        }

        if(!isSuperAdmin) {
            params.ownerId = ON_OwnerID
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
    async campaignVoucherForm(@Request() req, @Query('voucherCode') voucherCode, @Query('campaignId') campaignId) {
        const { schema, isSuperAdmin, ON_OwnerID } = req.user;
        let voucher;
        if(req.originalUrl.indexOf('editvoucher') !== -1) {
            if(voucherCode && campaignId) {
                voucher = await this.service.getCampaignVoucher({
                    schema: schema,
                    voucherCode: voucherCode,
                    campaignId: campaignId
                });
            } else {
                throw new BadRequestException('No voucherCode or campaignId')
            }
        }
        const campaignList = isSuperAdmin? await this.service.getCampaigns({schema: schema, listAll: true }) : await this.service.getCampaigns({ schma: schema, listAll: true, ownerId: ON_OwnerID })
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
            res.status(HttpStatus.BAD_REQUEST).json({message: error.message})
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
            throw new BadRequestException(error)
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
            res.status(HttpStatus.OK).json({message: 'update success'})   
        } catch (error) {
            throw new BadRequestException(error)
        }
    }

    @Delete('expire/:campaignId')
    async campaignExpire(@Request() req, @Param('campaignId') campaignId, @Res() res) {
        const { schema } = req.user;
        try {
            await this.service.setCampaignExpire({
                campaignId: campaignId,
                schema: schema
            })
            res.status(HttpStatus.OK).json({message: 'update success'})
        } catch (error) {
            throw new NotFoundException(error)
        }
    }

}
