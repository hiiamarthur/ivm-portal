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
        const prdCategories = await this.masterService.getAllProductCategories(schema);
        return { ...req, ...data, categories: prdCategories, channelSkuOptions: channelSkuOptions };
    }


    @Get('product-sku')
    @Render('pages/machine/machine_product_form')
    async getProductForm(@Request() req, @Query('machineId') machineId, @Query('itemId') itemId?) {
        const { schema } = req.user;
        
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
            MachineID: machineId, 
            prdCategories: prdCategories, 
            stockCategories: stockCategories, 
            prd: prd, 
            sku: sku
        }
    }

    @Post('update-channel')
    async updateChannel(@Request() req, @Body() reqBody, @Res() res){
        const { schema } = req.user;
        try {
            const updated = await this.service.updateChannelDetail({
                ...reqBody,
                schema: schema,
            })
            res.status(HttpStatus.OK).json(updated);
        } catch (error) {
            throw new BadRequestException(error);
        }
    }

    @Post('product-search')
    async searchProducts (@Request() req, @Body() reqBody, @Res() res) {
        const { schema } = req.user;
        const data = await this.masterService.searchMasterProduct({ ...reqBody, schema: schema });
        res.status(HttpStatus.OK).json(data);
    }

    @Post('add-product')
    async addProductToMachine(@Request() req, @Body() reqBody, @Res() res) {
        const { schema } = req.user;
        const { machineId, productIds, includeSKU } = reqBody;
        try {
            await this.masterService.addMasterProductToMachine({ ...reqBody, schema: schema })
            if(includeSKU) {
                await this.masterService.addMasterStockToMachine({ machineId: machineId, skuCodes: productIds, schema: schema })
            }
        } catch (error) {
            throw error
        }
        const prds = await this.service.getMachineProductList({ machineId: machineId, schema: schema });
        const pNew = prds.filter((d) => productIds.includes(d.MP_ProductID))
        if(includeSKU) {
            const skus = await this.service.getMachineStockList({ machineId: machineId, schema: schema });
            const sNew = skus.filter((s) => productIds.includes(s.MS_StockCode));
            if(pNew.length === productIds.length && sNew.length === productIds.length) {
                res.status(HttpStatus.OK).send();
            }
        } else {
            if(pNew.length === productIds.length) {
                res.status(HttpStatus.OK).send(); 
            }
        }
    }

    @Post('add-stock')
    async addStockToMachine(@Request() req, @Body() reqBody, @Res() res) {
        const { schema } = req.user;
        const { machineId, skuCodes } = reqBody;
        try {
            await this.masterService.addMasterStockToMachine({ machineId: machineId, skuCodes: skuCodes, schema: schema })
        } catch (error) {
            throw error
        }
        const skus = await this.service.getMachineStockList({ machineId: machineId, schema: schema });
        const sNew = skus.filter((s) => skuCodes.includes(s.MS_StockCode));
        if(sNew.length === skuCodes.length){
            res.status(HttpStatus.OK).send();
        }
    }

    @Post('update-product-stock')
    async updateMachineItems(@Request() req, @Body() reqBody, @Res() res) {
        const { schema } = req.user;
        const data = await this.service.updateMachineItems({ ...reqBody, schema: schema });
        res.status(HttpStatus.OK).json(data);
    }

    @Post('product-list')
    async machineProductList(@Request() req, @Body() reqBody, @Res() res) {
        this.handleBadRequest(reqBody);
        const { machineId } = reqBody;
        const { schema } = req.user;
        const data = await this.service.getMachineProductList({ machineId: machineId, schema: schema });
        res.status(HttpStatus.OK).json(data);
    }

    @Post('stock-list')
    async machineStockList(@Request() req, @Body() reqBody, @Res() res) {
        this.handleBadRequest(reqBody);
        const { machineId } = reqBody;
        const { schema } = req.user;
        const data = await this.service.getMachineStockList({ machineId: machineId, schema: schema });
        res.status(HttpStatus.OK).json(data);
    }

    handleBadRequest(reqBody) {
        const { machineId } = reqBody;
        if (!machineId) {
            throw new BadRequestException('required params undefined')
        }
    }
}
