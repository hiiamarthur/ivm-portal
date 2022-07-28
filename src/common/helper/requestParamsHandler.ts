import { BadRequestException } from '@nestjs/common';
import { getColumnOptions } from '../../entities/columnNameMapping';

export const handleSalesreportRequestBody = (reqBody) => {
    if (!reqBody || !reqBody.from || !reqBody.to) {
        throw new BadRequestException('no date range provided');
    }
}

export const handleArrayParams = (str: string) => {
    return str && str.indexOf('[') !== -1 ? JSON.parse(str) : null; 
}

export const handleColumnSorter = (order: any, columnOps: string) => {
    if(order && order.length > 0) {
        const colList = getColumnOptions(columnOps);
        return order.map(o => {
            return { column: colList[Number(o['column'])].data, dir: o['dir'].toUpperCase() }
        })
    }
    return null;
}