import { Controller, Post, Res, Body, HttpStatus } from '@nestjs/common';
import { GenerateExcelService } from './generate-excel.service';

@Controller('generate-excel')
export class GenerateExcelController {

    constructor(
        private service: GenerateExcelService
    ){}

    @Post()
    async downloadExcel(@Body() reqBody, @Res() res) {
        const fileName = Math.random().toString(32).slice(2)  + '.xlsx';
        const workbook = await this.service.generateExcel(reqBody.type, reqBody);
        res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
        res.setHeader("Content-Disposition", "attachment; filename=" + fileName);

        await workbook.xlsx.write(res);
    }
}
