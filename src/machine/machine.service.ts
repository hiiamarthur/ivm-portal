import { Injectable } from '@nestjs/common';
import { InjectEntityManager } from '@nestjs/typeorm';
import { Product, Stock } from '../entities/master';
import { EntityManager } from 'typeorm';
import { ChannelStatusText, Machine, MachineChannel, MachineChannelDrink, MachineCheckoutModule, MachineProduct, MachineStatus, MachineStock } from '../entities/machine';
import { getColumnOptions } from '../entities/columnNameMapping';

@Injectable()
export class MachineService {

    constructor(
        @InjectEntityManager() private readonly entityManager: EntityManager
    ) {}


    getAllMachineList = async () => {
        return await this.entityManager.getRepository(Machine).createQueryBuilder('m')
            .select(['m.M_MachineID as MachineID', 'm.M_Name as MachineName', 'type.MT_MachineTypeName as Model'])
            .leftJoin('m.type', 'type')
            .orderBy('m.M_MachineID')
            .getRawMany();
    }


    getRefMachineID = async () => {
        return this.entityManager.query('Select M_MachineID,M_Name From Machine (nolock) where M_Active = 1 order by M_MachineID');
    }

    getMachineList = async (start: number, limit: number, sort: any[], params?: any) => {
        let whereClause;
        let queryParameter;
        if (params.active) {
            whereClause = 'M_Active = :active';
            queryParameter = { active: params.active }
        }
        if (params.machineIds) {
            whereClause = whereClause ? whereClause += ' AND M_MachineID IN (:...machineIds)' : whereClause;
            queryParameter = { ...queryParameter, machineIds: params.machineIds }
        }

        const sStart = start || 0;
        const sLimit = limit || 25;

        const qb = await this.entityManager.getRepository(Machine).createQueryBuilder('m')
            .select(['m.M_MachineID as MachineID', 'm.M_Name as MachineName', 'type.name as MachineType', 
                'ISNULL(JSON_VALUE(systemInfo.SM_ExtraData, \'$.VendingMachine\'),\'-\') as isOnline',
                'ISNULL(JSON_VALUE(systemInfo.SM_ExtraData, \'$.Heartbeat\'),\'-\') as lastConnectionTime',
                'CAST(JSON_VALUE(mcuInfo.SM_ExtraData, \'$.Temperature\') AS numeric(10,2)) AS Temperature',
                'ISNULL(JSON_VALUE(mcuStatus.SM_ExtraData, \'$.Status\'),\'-\') as MachineStatus',
                'ISNULL(JSON_VALUE(mcuStatus.SM_ExtraData, \'$.Message\'),\'-\') as Message', 
                '\'\' as Detail'
            ])
            .leftJoin('m.type', 'type')
            .leftJoin(MachineStatus, 'systemInfo', 'systemInfo.SM_MachineID = m.M_MachineID AND systemInfo.SM_Status = \'System\' AND systemInfo.SM_Section = \'Info\'')
            .leftJoin(MachineStatus, 'mcuInfo', 'mcuInfo.SM_MachineID = m.M_MachineID AND mcuInfo.SM_Status =\'MCU\' AND mcuInfo.SM_Section = \'Info\' AND mcuInfo.SM_ExtraData <> \'\'')
            .leftJoin(MachineStatus, 'mcuStatus', 'mcuStatus.SM_MachineID = m.M_MachineID AND mcuStatus.SM_Status = \'MCU\' AND mcuStatus.SM_Section = \'Status\' AND mcuStatus.SM_ExtraData <> \'\'')
            .where(whereClause, queryParameter)
        if (sort && sort.length > 0) {
            sort.forEach((s) => {
                qb.addOrderBy(s.column, s.dir)
                qb.addOrderBy('MachineID', 'DESC')
            })
        }
        const data = await qb.limit(sLimit).offset(sStart).getRawMany();

        const count = await this.entityManager.createQueryBuilder()
            .select('count(distinct m.M_MachineID) as total')
            .from(Machine, 'm')
            .where(whereClause, queryParameter)
            .getRawOne();

        return {
            page: start,
            ...count,
            recordsTotal: count?.total,
            recordsFiltered: count?.total,
            data: data
        }

    }

    getMachineDetail = async (machineId: string) => {
        let rtn;
        const machine = await this.entityManager.getRepository(Machine).createQueryBuilder('machine')
            .select(['machine', 'type'])
            .leftJoin('machine.type', 'type')
            .where('machine.M_MachineID =:machineId', { machineId: machineId })
            .maxExecutionTime(6000)
            .getOne();
        if(!machine) {
            return null;
        }
        if (machine) {
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
            const showChannelDrink = await this.entityManager.getRepository(MachineChannelDrink)
            .createQueryBuilder()
            .select('count(distinct MCD_MachineID) as chDrinkCount')
            .where('MCD_MachineID = :machineId', { machineId: machineId })
            .getRawOne();

            const products = await this.getMachineProductList(machineId, null);
            const stocks = await this.getMachineStockList(machineId, null);
            const ch = await this.getMachineChannelList(machineId);

            rtn = {
                title: `${machine.M_MachineID} ${machine.M_Name}`,
                ...machine,
                products: products,
                stocks: stocks,
                ...ch,
                showChannelDrink : showChannelDrink.chDrinkCount > 0,
                productListOp: getColumnOptions('machine_product'),
                stockListOp: getColumnOptions('machine_stock'),
                channelListOp: getColumnOptions('machine_channel'),
                channelDrinkListOp: showChannelDrink.chDrinkCount > 0 ? getColumnOptions('machine_channel_drink') : null
            };
        }
        return rtn;
    }

    getMachineEventLogs = async (machineId:string) => {
        const receipt = await this.getMachineReceipt(machineId);
        const shipments = await this.getMachineShipmentRecord(machineId);
        const eventlogs = await this.getMachineEventLog(machineId);

        return {
            receipt: receipt,
            shipments: shipments,
            eventlogs: eventlogs
        }
    }

    getMachineCheckoutModuleNotExist = async (machineId: string) => {
        return await this.entityManager.query('SELECT MCM_CheckoutTypeID, MCM_CheckoutModuleID,MCM_Active,isnull((Select RCT_CheckoutTypeName from  Ref_CheckoutType (nolock) where MCM_CheckoutTypeID = RCT_CheckoutTypeID),\'\') CheckoutTypeName , isnull((Select RCT_CheckoutTypeNameEng from Ref_CheckoutType (nolock) where MCM_CheckoutTypeID = RCT_CheckoutTypeID) ,\'\') CheckoutTypeNameEng,MCM_ModuleConfig,MCM_ExtraData,MCM_OfflineMode FROM Master_CheckoutModule (nolock) where mcm_active = 1 and  MCM_CheckoutTypeID not in (Select MCM_CheckoutTypeID from Machine_CheckoutModule(nolock) where mcm_machineID = @0)', [machineId]);
    }

    getMachineReceipt = async (machineId: string) => {
        const qurey = 'select CONVERT(VARCHAR(20), r.RC_Time, 120) Time, r.RC_PaymentMethod Payment, rd.RCD_Item Item, rd.RCD_Amt Amt from Receipt r '+
        'left join Receipt_Detail rd on r.RC_ReceiptID = rd.RCD_ReceiptID and r.RC_MachineID = rd.RCD_MachineID ' +
        'where  r.RC_MachineID = @0 and rc_time > (getdate() - 7) order by RC_ReceiptID desc'
        return await this.entityManager.query(qurey, [machineId]);
    }

    getMachineShipmentRecord = async (machineId: string) => {
        return await this.entityManager.query('select CONVERT(VARCHAR(20),ELSR_time, 120) Time, ELSR_ChannelID Channel, ELSR_StockCode StockCode,ELSR_Remark Remark from EventLog_ShipmentRecord (nolock) where ELSR_MachineID = @0 and elsr_time > (getdate() - 14) order by ELSR_time desc', [machineId]);
    }

    getMachineEventLog = async (machineId: string) => {
        return await this.entityManager.query('select CONVERT(VARCHAR(20), ELA_Time, 120) Time, ELA_AlertType Type, ELA_Detail Detail from EventLog_Alert (nolock) where ELA_MachineID = @0 and ELA_Alert in  (\'MCU\',\'UI\',\'Remote\') and ELA_time > (getdate() - 21)'
            + ' union ' +
            'select CONVERT(VARCHAR(20), ELM_Time, 120) Time, ELM_Event Type, ELM_Detail Detail from EventLog_Machine (nolock) where ELM_MachineID = @0 and elm_event in (\'Door\') and elm_time > (getdate() - 21) order by Time desc', [machineId]);
    }

    getMachineChannelList = async (machineId: string) => {
        const channels = await this.entityManager.getRepository(MachineChannel).createQueryBuilder('channel')
            .select(['channel.*','stock.MS_StockName as StockName', 'cast(isnull(stock.MS_Price, 0) as decimal(10,2)) as MS_Price', 'stock.MS_ExtraData as MS_ExtraData', '\'\' as EditBtn'])
            .leftJoin('Master_Stock', 'stock', 'stock.MS_StockCode = channel.MC_StockCode')
            .where('channel.MC_MachineID = :machineId', { machineId: machineId })
            .orderBy('channel.MC_ChannelID')
            .getRawMany();

        const chDrink = await this.entityManager.getRepository(MachineChannelDrink).createQueryBuilder('chDrink')
            .select(['chDrink.*','stock.MS_StockCode as StockCode','stock.MS_StockName as StockName'])
            .leftJoin('Master_Stock', 'stock', 'stock.MS_StockCode = chDrink.MCD_StockCode')
            .where('chDrink.MCD_MachineID = :machineId', { machineId: machineId })
            .orderBy('chDrink.MCD_ChannelID')
            .getRawMany();

        //`${s.MS_StockName} (單${capacities.CapacitySingle}/雙${capacities.CapacityDual}) $${s.MS_Price.toFixed(2)} - ${s.MS_StockCode}`
        return {
            channel: channels.map(ch => {
                ch.MS_ExtraData = JSON.parse(ch.MS_ExtraData) || {};
                ch.capacities =  {
                    CapacitySingle: ch.MS_ExtraData['CapacitySingle'] || 0,
                    CapacityDual: ch.MS_ExtraData['CapacityDual'] || 0
                }
                ch.StockName = `${ch.StockName} (單${ch.capacities.CapacitySingle}/雙${ch.capacities.CapacityDual}) $${ch.MS_Price.toFixed(2)} - ${ch.MC_StockCode}`
                ch.statusText = ChannelStatusText[ch.MC_Status] || '不明錯誤';
                return ch;
            }),
            channelDrink: chDrink.map(chd => {
                chd.StockName = `${chd.MCD_ChannelID} ${chd.StockName} (${chd.StockName}) ${chd.MCD_ChannelMode} - ${chd.StockCode}`;
                return chd;
            })
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

    getMachineProductList = async (machineId: string, params: any) => {
        const data = await this.entityManager.getRepository(MachineProduct).createQueryBuilder('product')
            .select(['product', 'category'])
            .leftJoin('product.category', 'category')
            .where(`product.MP_MachineID = :machineId`, { machineId: machineId })
            .orderBy('product.MP_ProductID', 'ASC')
            .getMany();
        
        return data.map(d =>{
            return {
                ...d,
                EditBtn: '',
                DeleteBtn: ''
            }
        })
    }

    getMachineStockList = async (machineId: string, params: any) => {
        const data = await this.entityManager.getRepository(MachineStock).createQueryBuilder()
        .where('MS_MachineID = :machineId', { machineId: machineId })
        .orderBy('MS_StockCode', 'ASC')
        .getMany();
        return data.map(d =>{
            return {
                ...d,
                EditBtn: '',
                DeleteBtn: ''
            }
        })
    }

    //testing
    getChannelSKUList = async (machineId: string) => {
        const stock = await this.entityManager.getRepository(MachineStock).createQueryBuilder('stock')
            .where('stock.MS_MachineID = :machineId', { machineId: machineId })
            .orderBy('stock.MS_StockCode')
            .getMany();
        return stock.map(s => {
            const capacities = {
                CapacitySingle: s.MS_ExtraData['CapacitySingle'] || 0,
                CapacityDual: s.MS_ExtraData['CapacityDual'] || 0
            }
            return `${s.MS_StockName} (單${capacities.CapacitySingle}/雙${capacities.CapacityDual}) $${s.MS_Price.toFixed(2)} - ${s.MS_StockCode}`
        })
    }
}
