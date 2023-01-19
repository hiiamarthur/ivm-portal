import { Controller, Get, Post, UseGuards, Request, Res, Render, Body, HttpStatus } from '@nestjs/common';
import { AuthenticatedGuard } from '../common/guards/authenticated.guard';

import { InventoryService } from './inventory.service';
import { getColumnOptions } from '../entities/columnNameMapping';
import { handleArrayParams, handleColumnSorter } from '../common/helper/requestHandler';
import { OwnerService } from '../owner/owner.service';

@UseGuards(AuthenticatedGuard)
@Controller('inventory')
export class InventoryController {

    constructor(
        private service: InventoryService,
        private ownerService: OwnerService
    ) {}

    @Get('iv_summary')
    @Render('pages/tablewithfilter')
    async inventorySummary(@Request() req) {
        const { ON_OwnerID, isSuperAdmin, permissionsMap, schema } = req.user;
        const machineList = isSuperAdmin ? await this.ownerService.getOwnerMachine({ schema: schema }) : await this.ownerService.getOwnerMachine({ ownerId: ON_OwnerID, schema: schema });
        const showExport = isSuperAdmin ? 1 : permissionsMap['MachineInventorySummary']['Export'] || 0;
        return { ...req, machineList: machineList, columnOp: getColumnOptions('iv_summary'), action: 'iv_summary', method: 'post', showExport: showExport };
    }

    @Post('iv_summary')
    async searchInventorySummary(@Request() req, @Body() reqBody, @Res() res) {
        const { ON_OwnerID, isSuperAdmin, schema } = req.user;

        const { order, length } = reqBody;

        const sort = handleColumnSorter(order, 'iv_summary');

        const params = {
            ...reqBody,
            schema: schema,
            machineIds: handleArrayParams(reqBody.machineIds),
            isSuperAdmin: isSuperAdmin,
            ownerId: ON_OwnerID,
            limit: length,
            sort: sort
        }

        const data = await this.service.getMachineInventoryList(params);

        res.status(HttpStatus.OK).json(data);
    }

    @Get('iv_detail')
    @Render('pages/tablewithfilter')
    async inventoryDetail(@Request() req) {
        const { ON_OwnerID, isSuperAdmin, permissionsMap, schema } = req.user;
        const machineList = isSuperAdmin ? await this.ownerService.getOwnerMachine({ schema: schema }) : await this.ownerService.getOwnerMachine({ ownerId: ON_OwnerID, schema: schema });
        const productList = isSuperAdmin ? await this.ownerService.getOwnerProducts({ schema: schema }) : await this.ownerService.getOwnerProducts({ ownerId: ON_OwnerID, schema: schema });
        const showExport = isSuperAdmin ? 1 : permissionsMap['MachineInventoryDetail']['Export'] || 0;
        return { ...req, machineList: machineList, productList: productList, columnOp: getColumnOptions('iv_detail'), action: 'iv_detail', method: 'post', showExport: showExport };
    }  

    @Post('iv_detail')
    async searchInventoryFilter(@Request() req, @Body() reqBody, @Res() res) {
        const { isSuperAdmin, ON_OwnerID, schema } = req.user;
        const { order, length } = reqBody;
        
        const sort = handleColumnSorter(order, 'iv_detail');

        const params = {
            ...reqBody,
            schema: schema,
            isSuperAdmin: isSuperAdmin,
            ownerId: ON_OwnerID,
            sort: sort,
            limit: length,
            machineIds: handleArrayParams(reqBody.machineIds),
            productIds: handleArrayParams(reqBody.productIds)
        }

        const data = await this.service.getMachineInventoryDetail(params);

        res.status(HttpStatus.OK).json(data);

    }
}
