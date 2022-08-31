import { Header, Injectable } from '@nestjs/common';
import * as excelJS from 'exceljs';
import { getColumnOptions } from '../entities/columnNameMapping';
import { InventoryService } from '../inventory/inventory.service';
import { SalesReportService } from '../salesreport/salesreport.service';
import { format } from 'date-fns';

@Injectable()
export class GenerateExcelService {

    constructor(
        private salesreportService: SalesReportService,
        private inventoryService: InventoryService
    ) {}

    generateExcelReport = async (type: string, params: any) => {
        let result;
        let rows;
        const columnsOp = getColumnOptions(type);
        switch(type){
            case 'ms_summary':
                result = await this.salesreportService.getMachineSalesSummary(params);
                rows = result.data;
                return this.generateWorkbook(columnsOp, rows);
            case 'ms_detail':
                result = await this.salesreportService.getMachineSalesDetail(params);
                rows = result.data;
                return this.generateWorkbook(columnsOp, rows);
            case 'iv_summary':
                result = await this.inventoryService.getMachineInventoryList(params);
                rows = result.data;
                return this.generateWorkbook(columnsOp, rows);
            case 'iv_detail':
                result = await this.inventoryService.getMachineInventoryDetail(params);
                rows = result.data;
                return this.generateWorkbook(columnsOp, rows);
            default: 
            return null;
        } 
    }

    getHeaderConfig = (columns: any[]) => {
        const defaultWidth = 20;
        return columns.map(col => {
            if(col.data === 'Loc' || col.data === 'ProductName' || col.data === 'StockName' || col.data === 'skuRatio') {
                return { header: col.title, key: col.data, width: defaultWidth * 1.5 }
            }
            return { header: col.title, key: col.data, width: defaultWidth }
        })
    }

    generateWorkbook = (headers: any[], data?: any[]) => {
        const workbook = new excelJS.Workbook();
        workbook.company = 'IVM Tech Limited';
        workbook.creator = 'IVM Admin';
        workbook.created = new Date();
        workbook.views = [
            {
                x: 0, y: 0, width: 10000, height: 20000,
                firstSheet: 0, activeTab: 1, visibility: 'visible'
            }
        ]
        const workSheetName = format(new Date(), 'yyyyMMdd');
        const workSheet = workbook.addWorksheet(workSheetName, {
            headerFooter:{ firstHeader: workSheetName, firstFooter: '' },
            pageSetup:{paperSize: 9, orientation:'landscape'}
        });
        workSheet.columns = this.getHeaderConfig(headers);
        
        workSheet.getRow(1).eachCell((cell) => {
            cell.font = { bold: true };
            cell.fill = {
                type: 'pattern',
                pattern:'solid',
                fgColor:{argb:'6F00C6FF'}
            }
            cell.border = { 
                top: { style: 'thin'},
                right: { style: 'thin' },
                left: { style: 'thin' },
                bottom : { style: 'double' }
            }
        })
        if(data.length > 0){
            workSheet.addRows(data);
            workSheet.eachRow((row, rowNum) => {
                if(rowNum !== 1 ){
                    row.eachCell(cell => {
                        cell.border = {
                            top: { style: 'thin'},
                            right: { style: 'thin' },
                            left: { style: 'thin' },
                            bottom : { style: 'thin' }
                        }
                    })
                }
            })
        }
        return workbook;
    }
}
