import { Controller, Post, Res, Body, BadRequestException, HttpStatus } from '@nestjs/common';
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
            res.status(HttpStatus.BAD_REQUEST);
            throw new BadRequestException('type must be provided')
        }
        if(!reqBody.total) {
            res.status(HttpStatus.BAD_REQUEST);
            throw new BadRequestException('no of record must be provided')
        }
        const fileName = `Report_${format(new Date(), 'yyyy-MM-ddHH:mm:ss')}.xlsx`
        const params = reqBody;
        if(reqBody.machineIds) {
            params.machineIds = handleArrayParams(reqBody.machineIds);
        }
        if(reqBody.productIds) {
            params.productIds = handleArrayParams(reqBody.productIds);
        }
        const workbook = await this.service.generateExcelReport(reqBody.type, params);
        res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
        res.setHeader("Content-Disposition", "attachment; filename=" + fileName);
        
        if(workbook) { 
            res.status(HttpStatus.OK);
            await workbook.xlsx.write(res);
        } else {
            res.status(HttpStatus.BAD_REQUEST);
            res.send('fail')
        }
    }
}
