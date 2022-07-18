import { Controller, Get, Post, Res, Render, Body, HttpStatus } from '@nestjs/common';
import { SalesReportService } from './salesreport.service';
import { getColumnOptions } from '../entities/columnNameMapping';
import { handleColumnSorter, handleSalesreportRequestBody } from '../common/helper/requestParamsHandler';

@Controller('salesreport')
export class SalesreportController {
    
    constructor(
        private service: SalesReportService
    ){}

    @Get('ms_summary')
    @Render('pages/tablewithfilter')
    async machineSalesSummary() {
        const machineList = await this.service.getAllMachineList();

        return { machineList: machineList, columnOp: getColumnOptions('ms_summary'), showDateRangeFilter: true, action: 'ms_summary', method: 'post' };
    }

    @Post('ms_summary')
    async searchMachineSalesSummary(@Body() reqBody, @Res() res){
        handleSalesreportRequestBody(reqBody);

        const { from, to, start, length, order } = reqBody;

        const machineIds = reqBody.machineIds && reqBody.machineIds.indexOf('[') !== -1 ? JSON.parse(reqBody.machineIds) : null;

        const sort = handleColumnSorter(order, 'ms_summary');
        const data = await this.service.getMachineSalesSummary(from, to, start, length, sort, machineIds);
        
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
    async machineSalesDetail() {
        const machineList = await this.service.getAllMachineList();
        return { machineList: machineList, columnOp: getColumnOptions('ms_detail'), showDateRangeFilter: true, action: 'ms_detail', method: 'post' };
    }

    @Post('ms_detail')
    async searchMachineSalesDetail(@Body() reqBody, @Res() res){

        handleSalesreportRequestBody(reqBody);

        const { from, to, start, length, order } = reqBody;
        const machineIds = reqBody.machineIds ? JSON.parse(reqBody.machineIds) : null;

        const sort = handleColumnSorter(order, 'ms_detail');

        const data = await this.service.getMachineSalesDetail(from, to, start, length, sort, machineIds);
        let respData;
        if(reqBody.draw){ 
            respData = { ...data, draw: reqBody.draw }
        } else {
            respData = data;
        }
        res.status(HttpStatus.OK).json(respData);
    }

    
}

