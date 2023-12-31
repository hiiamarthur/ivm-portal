import { Controller, Get, Post, Res, Render, Body, Request, UseGuards, Query, HttpStatus, BadRequestException } from '@nestjs/common';
import { AuthenticatedGuard } from '../common/guards/authenticated.guard';
import { MachineService } from './machine.service';
import { getColumnOptions } from '../entities/columnNameMapping';
import { handleArrayParams, handleColumnSorter } from '../common/helper/requestHandler';
import { MasterService } from '../master/master.service';
import { OwnerService } from '../owner/owner.service';
import { Http } from 'winston/lib/winston/transports';

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
            machineList: machineList,
            columnOp: getColumnOptions('machine_list'),
            action: 'machine/list',
            method: 'post'
        };
    }

    @Post('list')
    async searchMachineList(@Request() req, @Body() reqBody, @Res() res) {
        const { isSuperAdmin, ON_OwnerID, schema } = req.user;
        const { order, length } = reqBody;

        const sort = handleColumnSorter(order, 'machine_list');

        const machineIds = handleArrayParams(reqBody.machineIds);

        const params = {
            ...reqBody,
            schema: schema,
            machineIds: machineIds,
            isSuperAdmin: isSuperAdmin,
            ownerId: ON_OwnerID,
            limit: length,
            sort: sort
        }

        const data = await this.service.getMachineList(params)
        res.status(HttpStatus.OK).json(data);
    }

    @Get('detail')
    @Render('pages/machine/machine_detail')
    async machineDetail(@Request() req, @Query('machineId') machineId) {
        const { schema, isSuperAdmin, permissionsMap, ON_OwnerID } = req.user;
        const canEdit = isSuperAdmin ? true : permissionsMap['machine']['Edit'] || 0; 
        const params = { schema: schema, machineId: machineId, canEdit: canEdit, isSuperAdmin: isSuperAdmin, ON_OwnerID: ON_OwnerID };
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

    @Post('update-config')
    async updateMachineConfig(@Request() req, @Body() reqBody, @Res() res) {
        const { schema } = req.uesr;
        const { custom_confg } = reqBody;
        try {
            const params = {
                schema: schema,
                obj: custom_confg
            }
            await this.service.updateMachineConfig(params);
            res.status(HttpStatus.OK).json({ message: 'update success'});
        } catch (error) {
            throw new BadRequestException(error);
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

    @Post('sku-search')
    async searchSKU (@Request() req, @Body() reqBody, @Res() res) {
        const { schema } = req.user;
        const data = await this.masterService.searchMasterStock({ ...reqBody, schema: schema });
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
            res.status(HttpStatus.OK).json({ message: 'success' });
        } catch (error) {
            throw new BadRequestException(error)
        }
    }

    @Post('add-stock')
    async addStockToMachine(@Request() req, @Body() reqBody, @Res() res) {
        const { schema } = req.user;
        const { machineId, skuCodes } = reqBody;
        try {
            await this.masterService.addMasterStockToMachine({ machineId: machineId, skuCodes: skuCodes, schema: schema });
            res.status(HttpStatus.OK).json({ message: 'success' });
        } catch (error) {
            throw new BadRequestException(error)
        }
    }

    @Post('update-product-stock')
    async updateMachineItems(@Request() req, @Body() reqBody, @Res() res) {
        const { schema } = req.user;
        const data = await this.service.updateMachineItems({ ...reqBody, schema: schema });
        res.status(HttpStatus.OK).json(data);
    }
    
    @Post('delete-product-stock')
    async deleteMachineItems(@Request() req, @Body() reqBody, @Res() res) {
        const { schema } = req.user;
        const { productId, stockCode } = reqBody;
        let result;
        if(productId) {
            result = await this.service.deleteMachineProduct({ ...reqBody, schema: schema });
        }
        if(stockCode) {
            result = await this.service.deleteMachineStock({ ...reqBody, schema: schema });
        }
        res.status(HttpStatus.OK).json({ message: result });
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

    @Post('/campaigns/update')
    async updateMachineCampaigns(@Request() req, @Body() reqBody, @Res() res) {
        try {
            await this.service.updateMachineCampaigns({ ...req.user, ...reqBody })
        } catch (error) {
            throw new BadRequestException(error)
        }
        res.status(HttpStatus.OK).json({ "message": "success" })
    }

    handleBadRequest(reqBody) {
        const { machineId } = reqBody;
        if (!machineId) {
            throw new BadRequestException('required params undefined')
        }
    }
}
