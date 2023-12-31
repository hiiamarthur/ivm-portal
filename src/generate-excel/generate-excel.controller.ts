import { Controller, Post, UseGuards, Request, Res, Body, BadRequestException, HttpStatus } from '@nestjs/common';
import { AuthenticatedGuard } from '../common/guards/authenticated.guard';
import { GenerateExcelService } from './generate-excel.service';
import { handleArrayParams } from '../common/helper/requestHandler';
import { format } from 'date-fns';
@UseGuards(AuthenticatedGuard)
@Controller('generate-excel')
export class GenerateExcelController {

    constructor(
        private service: GenerateExcelService
    ){}

    @Post()
    async downloadExcel(@Request() req, @Body() reqBody, @Res() res) {
        if(!reqBody.type) {
            throw new BadRequestException('type must be provided')
        }
        if(reqBody.type !== 'voucher/usage' && !reqBody.limit) {
            throw new BadRequestException('no of record must be provided and greater than 0')
        }
        const { isSuperAdmin, ON_OwnerID, schema } = req.user;
        const fileName = `Report_${format(new Date(), 'yyyy-MM-ddHH:mm:ss')}.xlsx`
        const params = { ...reqBody, isSuperAdmin: isSuperAdmin, ownerId: ON_OwnerID, schema: schema };
        if(reqBody.machineIds) {
            params.machineIds = handleArrayParams(reqBody.machineIds);
        }
        if(reqBody.productIds) {
            params.productIds = handleArrayParams(reqBody.productIds);
        }
        if(reqBody.sort) {
            params.sort = reqBody.sort.map((s) => {
                return {
                    column: s.column,
                    dir: s.dir.toUpperCase()
                }
            })
        }

        const workbook = await this.service.generateExcelReport(reqBody.type, params);
        res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
        res.setHeader('Content-Disposition', `attachment; filename=${fileName}`);
        
        if(workbook) { 
            res.status(HttpStatus.OK);
            await workbook.xlsx.write(res);
        } else {
            res.status(HttpStatus.BAD_REQUEST).send('export error');
        }
    }

    @Post('event-logs')
    async exportMachineEventLog(@Request() req, @Body() reqBody, @Res() res) {
        if(!reqBody.machineId) {
            throw new BadRequestException('machineId must be provided');
        }
        const { schema } = req.user;
        const fileName = `EventLog_${reqBody.machineId}_${format(new Date(), 'yyyy-MM-ddHH:mm:ss')}.xlsx`;
        const params = { schema: schema, ...reqBody };
        const workbook = await this.service.exportMachineEventLogs(params);
        res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
        res.setHeader('Content-Disposition', `attachment; filename=${fileName}`);

        if(workbook) { 
            res.status(HttpStatus.OK);
            await workbook.xlsx.write(res);
        } else {
            res.status(HttpStatus.BAD_REQUEST).send('export error');
        }
    }
}
