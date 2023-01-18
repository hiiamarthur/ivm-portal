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

// https://gabrieltanner.org/blog/nestjs-file-uploading-using-multer/
export const editFileName = (req, file, callback) => {
    //req.body.destname??
    const name = file.originalname.split('.')[0];
    const fileExtName = path.extname(file.originalname);
    const radSuf = Math.random().toString(32).substring(2, 6);
    callback(null, `${name}-${radSuf}${fileExtName}`);
  };

export const imageOrVideoFileFilter = (req, file, callback) => {
    if (!file.originalname.match(/\.(jpg|jpeg|png|gif|mp4)$/)) {
      return callback(new Error('Only image or video are allowed!'), false);
    }
    callback(null, true);
};