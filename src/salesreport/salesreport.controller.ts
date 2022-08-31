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
        const { isSuperAdmin, ON_OwnerID, permissionsMap, schema } = req.user;
        const machineList = isSuperAdmin ? await this.ownerService.getOwnerMachine({ schema: schema }) : await this.ownerService.getOwnerMachine({ ownerId: ON_OwnerID, schema: schema });
        const showExport = permissionsMap['MachineSalesSummary']['Export'] || 0;
        return { ...req, machineList: machineList, columnOp: getColumnOptions('ms_summary'), showDateRangeFilter: true, action: 'ms_summary', method: 'post', showExport: showExport };
    }

    @Post('ms_summary')
    async searchMachineSalesSummary(@Request() req, @Body() reqBody, @Res() res){
        handleSalesreportRequestBody(reqBody);
        const { isSuperAdmin, ON_OwnerID, schema } = req.user;
        const { from, to, start, length, order } = reqBody;
        const sort = handleColumnSorter(order, 'ms_summary');
        const machineIds = handleArrayParams(reqBody.machineIds);

        const params = {
            ...reqBody,
            schema: schema,
            isSuperAdmin: isSuperAdmin,
            ownerId: ON_OwnerID,
            machineIds: machineIds,
            sort: sort
        }
        
        const data = await this.service.getMachineSalesSummary(params);
        
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
        const { isSuperAdmin, ON_OwnerID, permissionsMap, schema } = req.user;
        const machineList = isSuperAdmin ? await this.ownerService.getOwnerMachine({ schema: schema }) : await this.ownerService.getOwnerMachine({ ownerId: ON_OwnerID, schema: schema });
        const showExport = permissionsMap['MachineSalesDetail']['Export'] || 0;
        return { ...req, machineList: machineList, columnOp: getColumnOptions('ms_detail'), showDateRangeFilter: true, action: 'ms_detail', method: 'post', showExport: showExport };
    }

    @Post('ms_detail')
    async searchMachineSalesDetail(@Request() req, @Body() reqBody, @Res() res){

        handleSalesreportRequestBody(reqBody);
        const { isSuperAdmin, ON_OwnerID, schema } = req.user;
        const { from, to, start, length, order } = reqBody;
        const machineIds = reqBody.machineIds ? JSON.parse(reqBody.machineIds) : null;

        const sort = handleColumnSorter(order, 'ms_detail');
        const params = {
            ...reqBody,
            schema: schema,
            isSuperAdmin: isSuperAdmin,
            ownerId: ON_OwnerID,
            machineIds: machineIds, 
            sort: sort
        }

        const data = await this.service.getMachineSalesDetail(params);
        let respData;
        if(reqBody.draw){ 
            respData = { ...data, draw: reqBody.draw }
        } else {
            respData = data;
        }
        res.status(HttpStatus.OK).json(respData);
    }

    
}

