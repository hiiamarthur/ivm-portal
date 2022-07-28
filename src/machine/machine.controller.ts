import { Controller, Get, Post, Res, Render, Body, Query, HttpStatus, BadRequestException, NotFoundException } from '@nestjs/common';
import { MachineService } from './machine.service';
import { getColumnOptions } from '../entities/columnNameMapping';
import { handleArrayParams, handleColumnSorter } from '../common/helper/requestParamsHandler';
import { eventlogs } from './eventlogs';
import { machine_detail } from './machine_detail';

@Controller('machine')
export class MachineController {

    constructor(
        private service: MachineService
    ) { }

    @Get()
    @Render('pages/tablewithfilter')
    async MachineListPage() {
        const machineList = await this.service.getAllMachineList();
        return {
            showActiveMachine: true, machineList: machineList,
            columnOp: getColumnOptions('machine_list'),
            action: 'machine/list', method: 'post', hideExport: true
        };
    }

    @Post('list')
    async searchMachineList(@Body() reqBody, @Res() res) {
        const { start, length, order } = reqBody;

        const sort = handleColumnSorter(order, 'machine_list');

        const machineIds = handleArrayParams(reqBody.machineIds);

        const params = {
            active: reqBody.active,
            machineIds: machineIds
        }

        const data = await this.service.getMachineList(start, length, sort, params)
        res.status(HttpStatus.OK).json(data);
    }

    // testing with data from json file 
    @Get('detail')
    @Render('pages/machine_detail')
    async machineDetail(@Query('machineId') machineId) {
        this.handleBadRequest(machineId);
        //const data = await this.service.getMachineDetail(machineId);
        const data = machine_detail;
        return data;
    }
    
    // testing with data from json file 
    @Get('eventlogs')
    async getEventLogs(@Query('machineId') machineId, @Res() res) {
        this.handleBadRequest(machineId)
        //const data = await this.service.getMachineEventLogs(machineId);
        //res.status(HttpStatus.OK).json(data);

        res.status(HttpStatus.OK).json(eventlogs);
    }

    @Post('products')
    async machineProductList(@Body() reqBody, @Res() res) {
        this.handleBadRequest(reqBody.machineId);
        const { machineId } = reqBody;
        return await this.service.getMachineProductList(machineId, reqBody);
    }

    @Post('stocks')
    async machineStockList(@Body() reqBody, @Res() res) {
        this.handleBadRequest(reqBody.machineId);
        const { machineId } = reqBody;
        return await this.service.getMachineStockList(machineId, reqBody);
    }

    handleBadRequest(machineId){
        if(!machineId){
            throw new BadRequestException('No machine id')
        }
    }
}
