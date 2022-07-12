import { Controller, Get, Post, Res, Render, Body, HttpStatus } from '@nestjs/common';
import { MasterService } from '../master/master.service';
import { InventoryService } from './inventory.service';
import { getColumnOptions } from '../entities/columnNameMapping';
import { handleArrayParams, handleColumnSorter } from '../common/helper/requestParamsHandler';

@Controller('inventory')
export class InventoryController {

    constructor(
        private service: InventoryService,
        private masterService: MasterService
    ) {}

    @Get('iv_summary')
    @Render('pages/tablewithfilter')
    async inventorySummary() {
        const machineList = await this.masterService.getAllMachineList();

        return { machineList: machineList, columnOp: getColumnOptions('iv_summary'), action: 'iv_summary', method: 'post' };
    }

    @Post('iv_summary')
    async searchInventorySummary(@Body() reqBody, @Res() res) {

        const { start, length, order } = reqBody;

        const sort = handleColumnSorter(order, 'iv_summary');

        const machineIds = handleArrayParams(reqBody.machineIds);

        const data = await this.service.getMachineInventoryList(start, length, sort, machineIds);

        res.status(HttpStatus.OK).json(data);
    }

    @Get('iv_detail')
    @Render('pages/tablewithfilter')
    async inventoryDetail() {
        const machineList = await this.masterService.getAllMachineList();
        const productList = await this.masterService.getAllProductList();

        return { machineList: machineList, productList: productList, columnOp: getColumnOptions('iv_detail'), action: 'iv_detail', method: 'post' };
    }  

    @Post('iv_detail')
    async searchInventoryFilter(@Body() reqBody, @Res() res) {

        const { start, length, order } = reqBody;
        
        const sort = handleColumnSorter(order, 'iv_detail');

        const machineIds = handleArrayParams(reqBody.machineIds);
        const productIds = handleArrayParams(reqBody.productIds);

        const data = await this.service.getMachineInventoryDetail(start, length, sort, machineIds, productIds);

        res.status(HttpStatus.OK).json(data);

    }
}
