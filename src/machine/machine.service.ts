import { Injectable } from '@nestjs/common';
import { InjectEntityManager } from '@nestjs/typeorm';
import { Product, Stock } from '../entities/master';
import { EntityManager } from 'typeorm';
import { ChannelStatusText, Machine, MachineChannel, MachineChannelDrink, MachineCheckoutModule, MachineProduct, MachineStock } from '../entities/machine';

@Injectable()
export class MachineService {

    constructor(
        @InjectEntityManager() private readonly entityManager: EntityManager
    ) {}

    

    

    getRefMachineID = async () => {
        return this.entityManager.query('Select M_MachineID,M_Name From Machine (nolock) where m_active = 1 order by M_MachineID');
    }

    getMachineList = async (params: any) => {
        let whereClause;
        if (params.active) {
            whereClause = 'M_Active = :active';
        }
        if (params.machineIds) {
            whereClause = whereClause ? whereClause += ' AND M_MachineID IN (:...machineIds)' : whereClause;
        }
        if (params.machineType) {
            whereClause = whereClause ? whereClause += ' AND M_MachineType = :machineType' : 'M_MachineType = :machineType';
        }
        if (params.name) {
            whereClause = whereClause ? whereClause += ' AND (M_Name like :name OR M_NameEng like :name)' : '(M_Name like :name OR M_NameEng like :name)';
        }
        if (params.address) {
            whereClause = whereClause ? whereClause += ' AND (M_Address like :address or M_AddressEng like :address)' : '(M_Address like :address or M_AddressEng like :address)';
        }
        const data = await this.entityManager.getRepository(Machine).createQueryBuilder('m')
            .leftJoinAndSelect('m.status', 'status')
            .leftJoinAndSelect('m.type', 'type')
            .where(whereClause, { active: params.active, machineIds: params.machineIds })
            .orderBy('m.M_MachineID', 'DESC')
            .getMany();

        if (data.length > 0) {
            return data.map(d => {
                const statusList = d.status;
                if(d.status) {
                    const isOnline = statusList.filter(s => s.SM_Status === 'System' && s.SM_Section === 'Info' && s.SM_ExtraData?.VendingMachine)[0]?.SM_ExtraData?.VendingMachine || '-';
                    const heartBeatVal = statusList.filter(s => s.SM_Status === 'System' && s.SM_Section === 'Info' && s.SM_ExtraData?.Heartbeat)[0]?.SM_ExtraData?.Heartbeat || '-';
                    const temperatureVal = statusList.filter(s => s.SM_Status === 'MCU' && s.SM_Section === 'Info' && s.SM_ExtraData?.Temperature)[0]?.SM_ExtraData?.Temperature || '-';
                    const statusVal = statusList.filter(s => s.SM_Status === 'MCU' && s.SM_Section === 'Status' && s.SM_ExtraData?.Status)[0]?.SM_ExtraData?.Status || '-';
                    const messageVal = statusList.filter(s => s.SM_Status === 'MCU' && s.SM_Section === 'Status' && s.SM_ExtraData?.Message)[0]?.SM_ExtraData?.Message || '-';
                    return {
                        MachineID: d.M_MachineID,
                        MachineName: d.M_Name,
                        MachineType: `${d.type?.machineTypeID}: ${d.type?.name}` || d.M_MachineType,
                        online: isOnline,
                        lastConnectionTime: heartBeatVal,
                        temperature: temperatureVal,
                        MachineStatus: statusVal,
                        message: messageVal
                    }
                }
            })
        }
        return [];
    }

    getMachineDetail = async (machineId: string) => {
        const machine = await this.entityManager.getRepository(Machine).createQueryBuilder('machine')
            .select(['machine', 'stocks', 'status', 'type', 'adminUsers'])
            .leftJoinAndSelect('machine.products', 'products')
            .leftJoin('machine.stocks', 'stocks')
            .leftJoin('machine.status', 'status')
            .leftJoin('machine.type', 'type')
            .leftJoin('machine.adminUsers', 'adminUsers')
            .where('machine.M_MachineID =:machineId', { machineId: machineId })
            .maxExecutionTime(6000)
            .getOne();

        if (machine) {
            const chs = await this.getMachineChannelList(machineId);
            const checkoutModules = await this.entityManager.getRepository(MachineCheckoutModule).createQueryBuilder('ckm')
                .leftJoinAndSelect('ckm.type', 'type')
                .where('ckm.MCM_MachineID =:machineId', { machineId: machineId })
                .getMany();
            machine.checkOutModules = checkoutModules.map((c) => {
                return {
                    MCM_CheckoutTypeID: c.MCM_CheckoutTypeID,
                    MCM_CheckoutModuleID: c.MCM_CheckoutModuleID,
                    MCM_Active: c.MCM_Active,
                    CheckoutTypeName: c.type.name,
                    CheckoutTypeNameEng: c.type.nameEng,
                    MCM_ModuleConfig: c.MCM_ModuleConfig,
                    MCM_ExtraData: c.MCM_ExtraData,
                    MCM_OfflineMode: c.MCM_OfflineMode,
                }
            })
            const moduleNotExist = await this.getMachineCheckoutModuleNotExist(machineId);
            const receipts = await this.getMachineReceipt(machineId);
            const shipments = await this.getMachineShipmentRecord(machineId);
            const eventlogs = await this.getMachineEventLog(machineId);
            return {
                ...machine,
                ...chs,
                chkoutExclude: moduleNotExist,
                receipts: receipts,
                shipmentRecords: shipments,
                eventlogs: eventlogs
            };
        }
        return machine;
    }

    getMachineCheckoutModuleNotExist = async (machineId: string) => {
        return await this.entityManager.query('SELECT MCM_CheckoutTypeID, MCM_CheckoutModuleID,MCM_Active,isnull((Select RCT_CheckoutTypeName from  Ref_CheckoutType (nolock) where MCM_CheckoutTypeID = RCT_CheckoutTypeID),\'\') CheckoutTypeName , isnull((Select RCT_CheckoutTypeNameEng from Ref_CheckoutType (nolock) where MCM_CheckoutTypeID = RCT_CheckoutTypeID) ,\'\') CheckoutTypeNameEng,MCM_ModuleConfig,MCM_ExtraData,MCM_OfflineMode FROM Master_CheckoutModule (nolock) where mcm_active = 1 and  MCM_CheckoutTypeID not in (Select MCM_CheckoutTypeID from Machine_CheckoutModule(nolock) where mcm_machineID = @0)', [machineId]);
    }

    getMachineReceipt = async (machineId: string) => {
        return await this.entityManager.query('select RC_Time,RC_ReceiptID,RC_PaymentMethod,RCD_Item,RCD_Amt ,RC_MachineRef from receipt (nolock),receipt_Detail (nolock) where RC_ReceiptID = RCD_ReceiptID and RC_MachineID = RCD_MachineID and RC_MachineID = @0 and rc_time > (getdate() - 7) order by RC_ReceiptID desc', [machineId]);
    }

    getMachineShipmentRecord = async (machineId: string) => {
        return await this.entityManager.query('select ELSR_time,ELSR_ChannelID,ELSR_StockCode,ELSR_Remark from EventLog_ShipmentRecord (nolock)  where ELSR_MachineID = @0 and elsr_time > (getdate() - 14) order by ELSR_time desc', [machineId]);
    }

    getMachineEventLog = async (machineId: string) => {
        return await this.entityManager.query('select ELA_Time,ELA_AlertType,ELA_Detail from EventLog_Alert (nolock) where ELA_MachineID = @0 and ELA_Alert in  (\'MCU\',\'UI\',\'Remote\') and ELA_time > (getdate() - 21)'
            + ' union ' +
            'select ELM_Time,ELM_Event,ELM_Detail from EventLog_Machine (nolock) where ELM_MachineID = @0 and elm_event in (\'Door\') and elm_time > (getdate() - 21) order by ELA_Time desc', [machineId]);
    }

    getMachineChannelList = async (machineId: string) => {
        const channels = await this.entityManager.getRepository(MachineChannel).createQueryBuilder('channel')
            .where('channel.MC_MachineID = :machineId', { machineId: machineId })
            .orderBy('channel.MC_ChannelID')
            .getMany();

        const chDrink = await this.entityManager.getRepository(MachineChannelDrink).createQueryBuilder('chDrink')
            .where('chDrink.MCD_MachineID = :machineId', { machineId: machineId })
            .orderBy('chDrink.MCD_ChannelID')
            .getMany();

        return {
            channel: channels.map(d => {
                d.statusText = ChannelStatusText[d.MC_Status] || '不明錯誤';
                return d;
            }),
            channelDrink: chDrink
        }
    }

    searchMachineProductFromMaster = async (machineId: string, params?: any) => {
        const existed = await this.entityManager.getRepository(MachineProduct).createQueryBuilder('product')
            .select('product.MP_ProductID')
            .where('product.MP_MachineID = :machineId', { machineId: machineId })
            .getRawMany();
        const productCodes = existed.map(p => p.MP_ProductID);
        let whereClause = 'master.MP_ProductID not in (:existed)';
        const queryParameter: any = { existed: productCodes };

        if (params.active) {
            whereClause += ' AND master.MP_Active = :active';
            queryParameter.active = params.active;
        }
        return await this.entityManager.getRepository(Product).createQueryBuilder('master')
            .innerJoinAndSelect('master.detail', 'detail')
            .innerJoinAndSelect('master.category', 'category')
            .where(whereClause, queryParameter)
            .orderBy('master.MP_ProductID')
            .getMany();
    }

    searchMachineStockFromMaster = async (machineId: string, params?: any) => {
        const existed = await this.entityManager.getRepository(MachineStock).createQueryBuilder('stock')
            .select('stock.MS_MachineID')
            .where('stock.MS_MachineID = :machineId', { machineId: machineId })
            .getRawMany();
        const stockCodes = existed.map(s => s.MS_StockCode);
        let whereClause = 'master.MS_StockCode not in (:existed)';
        const queryParameter: any = { existed: stockCodes };

        if (params.active) {
            whereClause += ' AND master.MS_Active = :active';
            queryParameter.active = params.active;
        }
        return await this.entityManager.getRepository(Stock).createQueryBuilder('master')
            .innerJoinAndSelect('master.category', 'category')
            .where(whereClause, queryParameter)
            .orderBy('master.MS_StockCode')
            .getMany();
    }

    getMachinePaymentModules = async (machineId: string) => {
        const data = await this.entityManager.getRepository(MachineCheckoutModule).createQueryBuilder('mct')
            .leftJoinAndSelect('mct.type', 'type')
            .where('mct.MCM_MachineID = :machineId', { machineId: machineId })
            .orderBy('mct.MCM_CheckoutTypeID')
            .getMany();

        return data.map(d => {
            return {
                MCM_CheckoutTypeID: d.MCM_CheckoutTypeID,
                MCM_CheckoutModuleID: d.MCM_CheckoutModuleID,
                Name: d.type.name,
                NameEng: d.type.nameEng,
                MCM_Active: d.MCM_Active,
                MCM_OfflineMode: d.MCM_OfflineMode,
                MCM_ModuleConfig: d.MCM_ModuleConfig,
                Options: d.MCM_ExtraData?.Option || [],
                MCM_Sync: d.MCM_Sync,
                MCM_SyncTime: d.MCM_SyncTime,
                MCM_LastUpdate: d.MCM_LastUpdate
            }
        })
    }

    getMachineStockList = async (machineId: string) => {
        const stock = await this.entityManager.getRepository(MachineStock).createQueryBuilder('stock')
            .leftJoinAndSelect('stock.category', 'category')
            .where('stock.MS_MachineID = :machineId', { machineId: machineId })
            .orderBy('stock.MS_StockCode')
            .getMany();
        return stock.map(s => {
            return {
                ...s,
                MS_ExtraData: s.MS_ExtraData === {} ? { CapacitySingle: 0, CapacityDual: 0 } : s.MS_ExtraData
            }
        })
    }

    getMachineProductList = async (machineId: string) => {
        return await this.entityManager.getRepository(MachineProduct).createQueryBuilder('product')
            .select(['product', 'detail', 'category.categoryName', 'category.categoryNameEng'])
            .leftJoin('product.detail', 'detail')
            .leftJoin('product.category', 'category')
            .where(`product.MP_MachineID = :machineId`, { machineId: machineId })
            .getMany();
    }
}
