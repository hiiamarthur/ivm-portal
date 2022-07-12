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
        const colIdx = order[0]['column'];
        const colList = getColumnOptions(columnOps);
        return { column: colList[Number(colIdx)].data, dir: order[0].dir }
    }
    return null;
}