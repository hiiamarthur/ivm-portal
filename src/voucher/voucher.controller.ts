import {  Controller, Render, Get, Post, Request, Res, Body, HttpStatus, UseGuards, Query } from '@nestjs/common';
import { AuthenticatedGuard } from '../common/guards/authenticated.guard';
import { VoucherService } from './voucher.service';
import { getColumnOptions } from '../entities/columnNameMapping';
import { handleColumnSorter } from '../common/helper/requestHandler';
import { OwnerService } from '../owner/owner.service';

@UseGuards(AuthenticatedGuard)
@Controller('voucher')
export class VoucherController {

    constructor(
        private ownerService: OwnerService,
        private voucherService: VoucherService
    ) {}

    @Get()
    @Render('pages/tablewithfilter')
    listpage(@Request() req) {
        const { permissionsMap } = req.user;
        const showExport = permissionsMap['machinevoucher']['Export'] || 0;
        const showImport = permissionsMap['machinevoucher']['Import'] || 0;
        return { ...req, columnOp: getColumnOptions('voucher'), action: 'voucher/list', method: 'post', showDateRangeFilter: true,showExport: showExport, showImport: showImport };
    }

    @Post('list')
    async listVoucherData(@Request() req, @Body() reqBody, @Res() res) {
        const { schema, permissionsMap } = req.user;

        const { order } = reqBody;

        const sort = handleColumnSorter(order, 'voucher');

        const canEdit = permissionsMap['machinevoucher']['Edit'];

        const params = {
            ...reqBody,
            schema: schema,
            sort: sort,
            canEdit: canEdit
        }

        const data = await this.voucherService.getVouchers(params);

        res.status(HttpStatus.OK).json(data);
    }

    @Get(['add', 'edit'])
    @Render('pages/voucher/form')
    async voucherform(@Request() req, @Query('voucherCode') voucherCode) {
        const { isSuperAdmin, schema, ON_OwnerID } = req.user;
        const machineList = isSuperAdmin ? await this.ownerService.getOwnerMachine({ schema: schema }) : await this.ownerService.getOwnerMachine({ ownerId: ON_OwnerID, schema: schema });
        let voucher;
        if(voucherCode) {
           voucher = await this.voucherService.getVoucher({ schema: schema, voucherCode: voucherCode })
        }
        return { ...req, machineList: machineList, voucher: voucher }
    }

    @Post('save')
    async saveVoucher(@Request() req, @Body() reqBody, @Res() res) {
        const { schema } = req.user;
        try {
            const result = await this.voucherService.updateVoucher({
                ...reqBody,
                schema: schema
            })
            res.status(HttpStatus.OK).json(result)
        } catch (error) {
            res.status(HttpStatus.BAD_REQUEST).json(error)
        }
    }

    @Post('invalid')
    async invalidVoucher(@Request() req, @Body() reqBody, @Res() res) {
        const { schema } = req.user;
        const { voucherCode } = reqBody;
        try {
            const updated = await this.voucherService.invalidVoucher({
                schema: schema,
                voucherCode: voucherCode
            })
            res.status(HttpStatus.OK).json({ message: 'success' })
        } catch (error) {
            res.status(HttpStatus.BAD_REQUEST).json(error)
        }
    }
}
