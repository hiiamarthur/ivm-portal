import { Inject, Injectable, Logger } from '@nestjs/common';
import * as excelJS from 'exceljs';
import { IService } from '../common/IService';
import { Voucher } from '../entities/machine';
import { CampaignVoucher } from '../entities/campaign';
import { startOfDay, endOfDay } from 'date-fns';

@Injectable()
export class ImportFileService extends IService {
    
    @Inject(Logger)
    private readonly logger: Logger;

    private readOptions = {
        map(value, index) {
            switch(index) {
              case 4:
              case 5:
                return new Date(value);
              case 3:
              case 6:
              case 7:
                return parseInt(value);
              default:
                // the rest are string
                return value;
            }
          }
    }

    readUploadFile = async (params) => {
        const { schema, objType, filename, machineId, campaignId } = params;
	    this.logger.debug(`[ImportFileService] UploadFile: ${JSON.stringify(params)}`)
        const wb = new excelJS.Workbook();
        
        try {
            const ws = await wb.csv.readFile(filename, this.readOptions);
            if (!ws.lastRow) {
                return null;
            }
            const em = await this.getEntityManager(schema);
            let repo;
            const entries: any[] = [];
            ws.eachRow((row, rowNumber) => {
                if (rowNumber === 1) {
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
                            MV_DateFrom: startOfDay(vals[5]),
                            MV_DateTo: endOfDay(new Date(vals[6])),
                            MV_CreateDate: new Date(),
                            MV_Valid: true,
                            MV_Used: false,
                            MV_UsedTime: null,
                            MV_Sync: false,
                            MV_SyncTime: null,
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
                            CV_DateFrom: startOfDay(vals[5]),
                            CV_DateTo: endOfDay(vals[6]),
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
            if(entries.length > 100) {
                await repo.save(entries, { chunk: entries.length / 100 })
            } else {
                await repo.save(entries);
            }
            return true;
        } catch (error) {
            this.logger.error(error)
            throw error;
        }
    }

    getVoucherData = (data) => {
        const { voucherType, value, isConsumeBalance, isConsumeValue } = data;
        if (!value) {
            return null;
        }
        switch (voucherType) {
            case 'debitaccount':
                //{"RemainValue":5001,"IsConsumeValue":1,"IsConsumeBalance":1}
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
