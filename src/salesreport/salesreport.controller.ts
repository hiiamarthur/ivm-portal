import { Controller, Get, Post, UseGuards, Request, Res, Render, Body, HttpStatus } from '@nestjs/common';
import { AuthenticatedGuard } from '../common/guards/authenticated.guard';

import { SalesReportService } from './salesreport.service';
import { getColumnOptions } from '../entities/columnNameMapping';
import { handleArrayParams,  handleColumnSorter, handleSalesreportRequestBody } from '../common/helper/requestHandler';
import { OwnerService } from '../owner/owner.service';
@UseGuards(AuthenticatedGuard)
@Controller('salesreport')
export class SalesreportController {
    
    constructor(
        private service: SalesReportService,
        private ownerService: OwnerService,
    ){}

    @Get('ms_summary')
    @Render('pages/tablewithfilter')
    async machineSalesSummary(@Request() req) {
        const { isSuperAdmin, ON_OwnerID, permissionsMap } = req.user;
        const machineList = isSuperAdmin ? await this.ownerService.getOwnerMachine() : await this.ownerService.getOwnerMachine(ON_OwnerID);
        const showExport = permissionsMap['MachineSalesSummary']['Export'] || 0;
        return { ...req, machineList: machineList, columnOp: getColumnOptions('ms_summary'), showDateRangeFilter: true, action: 'ms_summary', method: 'post', showExport: showExport };
    }

    @Post('ms_summary')
    async searchMachineSalesSummary(@Request() req, @Body() reqBody, @Res() res){
        handleSalesreportRequestBody(reqBody);
        const { isSuperAdmin, ON_OwnerID } = req.user;
        const { from, to, start, length, order } = reqBody;

        const machineIds = handleArrayParams(reqBody.machineIds);
        const params = {
            isSuperAdmin: isSuperAdmin,
            ownerId: ON_OwnerID,
            machineIds: machineIds
        }
        const sort = handleColumnSorter(order, 'ms_summary');
        const data = await this.service.getMachineSalesSummary(from, to, params, start, length, sort);
        
        let respData;
        if(reqBody.draw){ 
            respData = { ...data, draw: reqBody.draw }
        } else {
            respData = data;
        }
        res.status(HttpStatus.OK).json(respData);
    }

    @Get('ms_detail')
    @Render('pages/tablewithfilter')
    async machineSalesDetail(@Request() req) {
        const { isSuperAdmin, ON_OwnerID, permissionsMap } = req.user;
        const machineList = isSuperAdmin ? await this.ownerService.getOwnerMachine() : await this.ownerService.getOwnerMachine(ON_OwnerID);
        const showExport = permissionsMap['MachineSalesDetail']['Export'] || 0;
        return { ...req, machineList: machineList, columnOp: getColumnOptions('ms_detail'), showDateRangeFilter: true, action: 'ms_detail', method: 'post', showExport: showExport };
    }

    @Post('ms_detail')
    async searchMachineSalesDetail(@Request() req, @Body() reqBody, @Res() res){

        handleSalesreportRequestBody(reqBody);
        const { isSuperAdmin, ON_OwnerID } = req.user;
        const { from, to, start, length, order } = reqBody;
        const machineIds = reqBody.machineIds ? JSON.parse(reqBody.machineIds) : null;

        const sort = handleColumnSorter(order, 'ms_detail');
        const params = {
            isSuperAdmin: isSuperAdmin,
            ownerId: ON_OwnerID,
            machineIds: machineIds
        }

        const data = await this.service.getMachineSalesDetail(from, to, params, start, length, sort);
        let respData;
        if(reqBody.draw){ 
            respData = { ...data, draw: reqBody.draw }
        } else {
            respData = data;
        }
        res.status(HttpStatus.OK).json(respData);
    }

    
}

