import { Injectable } from '@nestjs/common';
import { IService } from '../common/IService';
import { Machine } from '../entities/machine';
import { SchemaName } from '../common/schema-name';
import { CampaignVoucher } from '../entities/campaign';
import { Transaction } from '../entities/txn';

@Injectable()
export class PromotionService extends IService {

     getMachineSchema = async (params: any) => {
        const { machineId } = params;
        let schema = SchemaName.IVM;
        if(machineId.indexOf('FN') !== -1){
            schema = SchemaName.HOSTING;
        }
        else if(machineId.indexOf('NW') !== -1) {
            schema = SchemaName.NW;
        }
        else if(machineId.indexOf('CS') !== -1) {
            schema = SchemaName.CS;
        }
        else if(machineId.indexOf('EV') !== -1) {
            const whereClause = 'M_Active = 1 and M_MachineID = :machineId';
            const queryParameter = { machineId: machineId }
            const iEM = await this.getEntityManager();
            const rtn = await iEM.createQueryBuilder().select('count(1) as ct').from(Machine,'m').where(whereClause, queryParameter).getRawOne();
            if(rtn && rtn.ct > 0) {
                return schema;
            } else { 
                const hEM = await this.getEntityManager(SchemaName.HOSTING);
                const rtn2 = await hEM.createQueryBuilder().select('count(1) as ct').from(Machine,'m').where(whereClause, queryParameter).getRawOne();
                if(rtn2 && rtn2.ct > 0) {
                    return SchemaName.HOSTING;
                }
            }
        }
        return schema;
    }

    findMachine = async (params: any) => {
        const { machineId } = params;
        const schema = await this.getMachineSchema(params);
        const em = await this.getEntityManager(schema);
        const entity = await em.getRepository(Machine).findOneOrFail({
            where: {
                M_MachineID: machineId,
                M_Active: true
            }
        })
        return {
            machineId: machineId,
            schema: schema,
            campaigns: entity.M_Config?.CampaignID || []
        }
    }

    getPromoVoucherData = async (params:any) => {
        const { schema, campaigns, voucherCode } = params;
        const whereClause = 'CV_Valid = :valid AND CV_DateFrom < GETDATE() AND CV_DateTo > GETDATE() AND CV_Balance > 0' +
                            ' AND CV_VoucherType IN (:...voucherTypes) AND CV_CampaignID IN (:...campaigns) AND CV_VoucherCode = :voucherCode';
        const queryParameter = { valid: true, voucherTypes: ['percentoff', 'valueoff'], campaigns: campaigns, voucherCode: voucherCode };
        const em = await this.getEntityManager(schema);
        try {
            const results = await em.getRepository(CampaignVoucher).createQueryBuilder('voucher')
            .where(whereClause, queryParameter)
            .getManyAndCount();
            const data = results[0];
            const count = results[1];
            const resultData = data.map((d) => {
                const remarks = d.CV_Remark.length > 0 ? d.CV_Remark : d.CV_VoucherType === 'valueoff' ? `Total Price - $${d.CV_VoucherData.Value}`: `${Math.round((1-d.CV_VoucherData.Value)*100)}% OFF`
                return {
                    campaignId: d.CV_CampaignID,
                    voucherCode: d.CV_VoucherCode,
                    voucherType: d.CV_VoucherType,
                    voucherValue: d.CV_VoucherData.Value,
                    balance: d.CV_Balance,
                    remark: remarks
                }
            })
            return {
                count: count,
                data: resultData
            };
        } catch (error) {
           throw error
        }
    }

    updatePromoVoucher = async (params:any) => {
        const { schema, campaignId, voucherCode, machineId, receiptId, paymentMethod } = params;
        const whereClause = 'CV_CampaignID = :campaignId and CV_VoucherCode = :voucherCode';
        const queryParameter = { campaignId: campaignId, voucherCode: voucherCode };
        const em = await this.getEntityManager(schema);
        try {
            if(!receiptId && !paymentMethod) {
                const entity = await em.getRepository(CampaignVoucher).createQueryBuilder('voucher')
                .where(whereClause, queryParameter)
                .getOneOrFail();
                if(entity.CV_Balance > 1) {
                    entity.CV_Balance = Number(entity.CV_Balance) - 1
                } else {
                    entity.CV_Balance = 0;
                    entity.CV_Used = true;
                    entity.CV_UsedTime = new Date();
                }
                return await em.getRepository(CampaignVoucher).save(entity);
            } else {
                let txn;
                if(receiptId){
                    txn = await em.getRepository(Transaction).createQueryBuilder().where('TX_MachineId = :machineId and TX_ReceiptID = :receiptId', { machineId: machineId, receiptId: receiptId }).getOne();
                }
                if(!receiptId && paymentMethod) {
                    txn = await em.getRepository(Transaction).createQueryBuilder().where('TX_MachineId = :machineId and TX_CheckoutTypeID = :paymentMethod', { machineId: machineId, paymentMethod: paymentMethod })
                    .orderBy('TX_Time', 'DESC')
                    .getOne();
                }
                if(txn) {
                    const ref = txn.txnRef;
                    txn.txnRef = ref.Discount ? ref : { ...ref, Discount: { campaignId: campaignId, 'voucherCode': voucherCode }}
                    
                    return await em.getRepository(Transaction).save(txn);
                }
            }
        } catch (error) {
            throw error
        }
    }

    
}

