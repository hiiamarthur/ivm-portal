import { Controller, Render, Get, Post, Request, Res, Body, HttpStatus, UseGuards, Query, BadRequestException } from '@nestjs/common';
import { AuthenticatedGuard } from '../common/guards/authenticated.guard';
import { VoucherService } from './voucher.service';
import { getColumnOptions } from '../entities/columnNameMapping';
import { handleColumnSorter, handleArrayParams } from '../common/helper/requestHandler';
import { OwnerService } from '../owner/owner.service';
import { MachineService } from '../machine/machine.service';

@UseGuards(AuthenticatedGuard)
@Controller('voucher')
export class VoucherController {

    constructor(
        private ownerService: OwnerService,
        private voucherService: VoucherService,
        private machineService: MachineService
    ) { }

    @Get()
    @Render('pages/tablewithfilter')
    async listpage(@Request() req) {
        const { isSuperAdmin, schema, ON_OwnerID, permissionsMap } = req.user;
        const showExport = !isSuperAdmin ? permissionsMap['machinevoucher']['Export'] || 0 : 1;
        const showImport = !isSuperAdmin ? permissionsMap['machinevoucher']['Import'] || 0 : 1;
        const machineList = isSuperAdmin ? await this.ownerService.getOwnerMachine({ schema: schema }) : await this.ownerService.getOwnerMachine({ ownerId: ON_OwnerID, schema: schema });
        return { ...req, columnOp: getColumnOptions('voucher'), machineList: machineList, action: 'voucher/list', method: 'post', showDateRangeFilter: true, showExport: showExport, showImport: showImport };
    }

    @Post('list')
    async listVoucherData(@Request() req, @Body() reqBody, @Res() res) {
        const { isSuperAdmin, ON_OwnerID, schema, permissionsMap } = req.user;

        const { order, length } = reqBody;

        const sort = handleColumnSorter(order, 'voucher');
        const machineIds = handleArrayParams(reqBody.machineIds);

        const canEdit = permissionsMap['machinevoucher']['Edit'];

        const params = {
            ...reqBody,
            schema: schema,
            isSuperAdmin: isSuperAdmin,
            ownerId: ON_OwnerID,
            sort: sort,
            limit: length,
            machineIds: machineIds,
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
        let stockOptions;
        let voucher;
        if (voucherCode) {
            voucher = await this.voucherService.getVoucher({ schema: schema, voucherCode: voucherCode });
            if (voucher.MV_VoucherType === 'stockcode') {
                const stocklist = await this.machineService.getMachineStockList({ schema: schema, machineId: voucher.MV_MachineID });
                const options = stocklist.map((s) => {
                    let optionTag = `<option value="${s.MS_StockCode}">`;
                    if (s.MS_StockCode === voucher.voucherValue) {
                        optionTag = `<option value="${s.MS_StockCode}" selected>`
                    }
                    return `${optionTag}[${s.MS_StockCode}] ${s.MS_StockName}</option>`
                })
                stockOptions = options
            }
        }
        return { ...req, machineList: machineList, voucher: voucher, stocklist: stockOptions }
    }

    @Post('save')
    async saveVoucher(@Request() req, @Body() reqBody, @Res() res) {
        const { schema } = req.user;
        try {
            await this.voucherService.updateVoucher({
                ...reqBody,
                schema: schema
            })
            res.status(HttpStatus.OK).json({ message: 'success' })
        } catch (error) {
            throw new BadRequestException(error)
        }
    }

    @Post('change-status')
    async changeVoucherStatus(@Request() req, @Body() reqBody, @Res() res) {
        const { schema } = req.user;
        try {
            await this.voucherService.changeVoucherStatus({
                ...reqBody,
                schema: schema
            })
            res.status(HttpStatus.OK).json({ message: 'success' })
        } catch (error) {
            throw new BadRequestException(error)
        }
    }
}
