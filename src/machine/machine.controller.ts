import { Controller, Get, Post, Res, Render, Body, Request, UseGuards, Query, HttpStatus, BadRequestException } from '@nestjs/common';
import { AuthenticatedGuard } from '../common/guards/authenticated.guard';
import { MachineService } from './machine.service';
import { getColumnOptions } from '../entities/columnNameMapping';
import { handleArrayParams, handleColumnSorter } from '../common/helper/requestHandler';
import { MasterService } from '../master/master.service';
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
        const { isSuperAdmin, ON_OwnerID, schema } = req.user;
        
        const machineList = isSuperAdmin ? await this.ownerService.getOwnerMachine({ schema: schema }) : await this.ownerService.getOwnerMachine({ ownerId: ON_OwnerID, schema: schema });
        
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
        const { isSuperAdmin, ON_OwnerID, schema } = req.user;
        const { start, length, order } = reqBody;

        const sort = handleColumnSorter(order, 'machine_list');

        const machineIds = handleArrayParams(reqBody.machineIds);

        const params = {
            ...reqBody,
            schema: schema,
            machineIds: machineIds,
            isSuperAdmin: isSuperAdmin,
            ownerId: ON_OwnerID,
            sort: sort
        }

        const data = await this.service.getMachineList(params)
        res.status(HttpStatus.OK).json(data);
    }

    @Get('detail')
    @Render('pages/machine/machine_detail')
    async machineDetail(@Request() req, @Query('machineId') machineId) {
        const { schema } = req.user;
        const params = { schema: schema, machineId: machineId };
        this.handleBadRequest(params);
        const data = await this.service.getMachineDetail(params);
        const channelSkuOptions = await this.service.getChannelSKUOptions(params);
        return { ...req, ...data, channelSkuOptions: channelSkuOptions };
    }


    @Get('product-sku')
    @Render('pages/machine/machine_product_form')
    async getProductForm(@Request() req, @Query('machineId') machineId, @Query('viewOnly') viewOnly?, @Query('itemId') itemId?) {
        const { schema } = req.user;
        const isViewOnly = viewOnly ? viewOnly : true;
        
        const prdCategories = await this.masterService.getAllProductCategories(schema);
        const stockCategories = await this.masterService.getAllStockCategories(schema);
        let prd;
        let sku;

        if(itemId) {
            prd = await this.service.getMachineProductDetail({
                machineId: machineId,
                productId: itemId,
                schema: schema
            });
            sku = await this.service.getMachineStockDetail({
                machineId: machineId,
                skuCode: itemId,
                schema: schema
            });            
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
        this.handleBadRequest(reqBody);
        const { machineId, schema } = reqBody;
        const data = await this.service.getMachineProductList({ machineId: machineId, schema: schema });
        res.status(HttpStatus.OK).json(data);
    }

    @Post('stocks')
    async machineStockList(@Body() reqBody, @Res() res) {
        this.handleBadRequest(reqBody);
        const { machineId, schema } = reqBody;
        const data = this.service.getMachineStockList({ machineId: machineId, schema: schema });
        res.status(HttpStatus.OK).json(data);
    }

    handleBadRequest(reqBody) {
        const { machineId, schema } = reqBody;
        if (!machineId || !schema) {
            throw new BadRequestException('required params undefined')
        }
    }
}
