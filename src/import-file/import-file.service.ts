import { Injectable } from '@nestjs/common';
import * as excelJS from 'exceljs';
import { IService } from '../common/IService';
import { Voucher } from '../entities/machine';
import { CampaignVoucher } from '../entities/campaign';
import { Readable } from 'stream';
import { parse } from 'date-fns';

@Injectable()
export class ImportFileService extends IService {

    readUploadFile = async (arraybuffer, params) => {
        const { schema, objType, machineId, campaignId } = params;
        const wb = new excelJS.Workbook();
        const stream = Readable.from(arraybuffer);
        const ws = await wb.csv.read(stream);
        if(!ws.lastRow) {
            return null;
        }
        const em = await this.getEntityManager(schema);
        let repo;
        const entries:any[] = [];
        ws.eachRow((row, rowNumber) =>{
            if(rowNumber === 1) {
                return;
            }
            const vals = row.values;
            const vocuherData = {
                voucherType: vals[2],
                value: vals[3],
                isConsumeBalance: vals[7],
                isConsumeValue: vals[8]
            }
            switch (objType) {
                case 'machine':
                    repo = em.getRepository(Voucher);
                    entries.push({ 
                        MV_MachineID: machineId,
                        MV_VoucherCode: vals[1],
                        MV_VoucherType: vals[2],
                        MV_Balance: vals[4],
                        MV_DateFrom: parse(vals[5], 'dd/MM/yyyy', new Date()),
                        MV_DateTo: parse(vals[6], 'dd/MM/yyyy', new Date()),
                        MV_CreateDate: new Date(),
                        MV_Valid: true,
                        MV_Used: false,
                        MV_UsedTime: null,
                        MV_Sync: false,
                        MV_SyncTime: false,
                        MV_Remark: '',
                        MV_VoucherData: this.getVoucherData(vocuherData),
                        MV_ExtraData: {}
                    });
                    break;
                case 'campaign':
                    repo = em.getRepository(CampaignVoucher);
                    entries.push({
                        CV_VoucherCode: vals[1],
                        CV_VoucherType: vals[2],
                        CV_Balance: vals[4],
                        CV_DateFrom: parse(vals[5], 'dd/MM/yyyy', new Date()),
                        CV_DateTo: parse(vals[6], 'dd/MM/yyyy', new Date()),
                        CV_CreateDate: new Date(),
                        CV_Valid: true,
                        CV_Used: false,
                        CV_UsedTime: null,
                        CV_Remark: '',
                        CV_VoucherData: this.getVoucherData(vocuherData),
                        CV_ExtraData: {},
                        CV_CampaignID: campaignId
                    })
                    break;
                default: 
                    break;
            }
        });
        return await repo.save(entries);
    }

    getVoucherData = (data) => {
        const { voucherType, value, isConsumeBalance, isConsumeValue } = data;
        if(!value) {
            return null;
        }
        switch (voucherType) {
            case 'debitaccount': 
            //{"RemainValue":5001,"IsConsumeValue":1,"IsConsumeBalance":0}
                return { 
                    RemainValue: parseFloat(value),
                    IsConsumeBalance: isConsumeBalance,
                    IsConsumeValue: isConsumeValue
                }
            case 'stockcode': 
            //{"StockCode":"DRCM00001"}
                return { 
                    StockCode: value
                }
            default: 
                return { 
                    Value: value,
                    IsConsumeBalance: isConsumeBalance,
                    IsConsumeValue: isConsumeValue
                }
        }
    }
}
