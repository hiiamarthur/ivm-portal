import { Controller, Post, Res, Body, BadRequestException } from '@nestjs/common';
import { GenerateExcelService } from './generate-excel.service';
import { handleArrayParams, handleColumnSorter } from '../common/helper/requestParamsHandler';
import { format } from 'date-fns';

@Controller('generate-excel')
export class GenerateExcelController {

    constructor(
        private service: GenerateExcelService
    ){}

    @Post()
    async downloadExcel(@Body() reqBody, @Res() res) {
        if(!reqBody.type) {
            throw new BadRequestException('type must be provided')
        }
        if(!reqBody.total) {
            throw new BadRequestException('no of record must be provided')
        }
        const fileName = `Report_${format(new Date(), 'yyyy-MM-ddHH:mm:ss')}.xlsx`
        const params = reqBody;
        if(reqBody.order) {
            params.order = handleColumnSorter(reqBody.order, reqBody.type);
        }
        if(reqBody.machineIds) {
            params.machineIds = handleArrayParams(reqBody.machineIds);
        }
        if(reqBody.productIds) {
            params.productIds = handleArrayParams(reqBody.productIds);
        }
        delete params.type;
        const workbook = await this.service.generateExcelReport(reqBody.type, params);
        res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
        res.setHeader("Content-Disposition", "attachment; filename=" + fileName);

        await workbook.xlsx.write(res);
    }
}
