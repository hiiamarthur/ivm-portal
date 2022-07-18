import { Controller, Get, Post, Res, Render, Request, HttpStatus } from '@nestjs/common';
import { MachineService } from './machine.service';
import { getColumnOptions } from '../entities/columnNameMapping';
import { handleArrayParams, handleColumnSorter } from '../common/helper/requestParamsHandler';

@Controller('machine')
export class MachineController {

    constructor(
        private service: MachineService
    ) {}

    @Get()
    @Render('pages/tablewithfilter')
    async MachineListPage() {
        const machineList = await this.service.getAllMachineList();
        return { showActiveMachine: true, machineList: machineList, columnOp: getColumnOptions('machine_list'), action: 'machine/list', method: 'post' };
    }

    @Post('list')
    async searchMachineList(@Res() res) {
        res.status(HttpStatus.OK).json([]);
    }
}
