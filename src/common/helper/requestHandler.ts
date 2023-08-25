import { BadRequestException } from '@nestjs/common';
import { getColumnOptions } from '../../entities/columnNameMapping';
import * as path from 'path';

export const datatableNoData = {
    page: 0,
    recordsTotal: 0,
    recordsFiltered: 0,
    data: []
}

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

export const machineAdsFilesFilter = (req, file, callback) => {
    if (!file.mimetype.match(/(image|video)/g)) {
      return callback(new Error('Only image or video are allowed.'), false);
    }
    if(file.size >= 10485760) {
        return callback(new Error('File size exceed 10MB.'), false);
    }
    if(file.originalname.length > 40) {
        return callback(new BadRequestException('Filename should contain less than 20 charcters'), false);
    }
    callback(null, true);
};