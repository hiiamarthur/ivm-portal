import { Controller, Get, Post, Res, Render, Body, Request, UseGuards, Query, HttpStatus, BadRequestException } from '@nestjs/common';
import { AuthenticatedGuard } from '../common/guards/authenticated.guard';
import { MachineService } from './machine.service';
import { getColumnOptions } from '../entities/columnNameMapping';
import { handleArrayParams, handleColumnSorter } from '../common/helper/requestHandler';
import { MasterService } from '../master/master.service';
import { eventlogs } from './eventlogs';
import { OwnerService } from '../owner/owner.service';

@UseGuards(AuthenticatedGuard)
@Controller('machine')
export class MachineController {

    constructor(
        private service: MachineService,
        private ownerService: OwnerService,
        private masterService: MasterService,
    ) {}

    @Get()
    @Render('pages/tablewithfilter')
    async MachineListPage(@Request() req) {
        const { isSuperAdmin, ON_OwnerID } = req.user;
        
        const machineList = isSuperAdmin ? await this.ownerService.getOwnerMachine() : await this.ownerService.getOwnerMachine(ON_OwnerID);
        
        return {
            ...req,
            showActiveMachine: true, 
            machineList: machineList,
            columnOp: getColumnOptions('machine_list'),
            action: 'machine/list',
            method: 'post',
            showExport: false
        };
    }

    @Post('list')
    async searchMachineList(@Request() req, @Body() reqBody, @Res() res) {
        const { isSuperAdmin, ON_OwnerID } = req.user;
        const { start, length, order } = reqBody;

        const sort = handleColumnSorter(order, 'machine_list');

        const machineIds = handleArrayParams(reqBody.machineIds);

        const params = {
            active: reqBody.active,
            machineIds: machineIds,
            isSuperAdmin: isSuperAdmin,
            ownerId: ON_OwnerID
        }

        const data = await this.service.getMachineList(start, length, sort, params)
        res.status(HttpStatus.OK).json(data);
    }

    // testing with data from json file 
    @Get('detail')
    @Render('pages/machine/machine_detail')
    async machineDetail(@Request() req, @Query('machineId') machineId) {
        this.handleBadRequest(machineId);
        const data = await this.service.getMachineDetail(machineId);
        //const logs = await this.service.getMachineEventLogs(machineId);
        const logs = eventlogs;
        return { ...req, ...data, ...logs };
    }


    @Get('product-sku')
    @Render('pages/machine/machine_product_form')
    async getProductForm(@Request() req, @Query('machineId') machineId, @Query('viewOnly') viewOnly?, @Query('itemId') itemId?) {
        this.handleBadRequest(machineId);
        const isViewOnly = viewOnly ? viewOnly : true;
        
        const prdCategories = await this.masterService.getAllProductCategories();
        const stockCategories = await this.masterService.getAllStockCategories();
        let prd;
        let sku;

        if(itemId) {
            prd = await this.service.getMachineProductDetail(machineId, itemId);
            sku = await this.service.getMachineStockDetail(machineId, itemId);            
        }
         
        return { 
            ...req,
            title:viewOnly ? '產品/SKU詳情' : '編輯產品/SKU',
            MachineID: machineId, 
            backurl: `detail?machineId=${machineId}`,
            viewOnly: isViewOnly,
            prdCategories: prdCategories, 
            stockCategories: stockCategories, 
            prd: prd, 
            sku: sku
        }
    }

    @Post('products')
    async machineProductList(@Body() reqBody, @Res() res) {
        this.handleBadRequest(reqBody.machineId);
        const { machineId } = reqBody;
        const data = await this.service.getMachineProductList(machineId);
        res.status(HttpStatus.OK).json(data);
    }

    @Post('stocks')
    async machineStockList(@Body() reqBody, @Res() res) {
        this.handleBadRequest(reqBody.machineId);
        const { machineId } = reqBody;
        const data = this.service.getMachineStockList(machineId);
        res.status(HttpStatus.OK).json(data);
    }

    handleBadRequest(machineId) {
        if (!machineId) {
            throw new BadRequestException('No machine id')
        }
    }
}
