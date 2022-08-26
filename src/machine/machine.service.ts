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


    getAllMachineList = async (ownerId?: string) => {
        const qb = this.entityManager.getRepository(Machine).createQueryBuilder('m')
                    .select(['m.M_MachineID as MachineID', 'm.M_Name as MachineName', 'type.MT_MachineTypeName as Model'])
                    .leftJoin('m.type', 'type');
        if(ownerId) {
            return await qb.where('m.M_MachineID in (select ONM_MachineID from Owner_Machine where ONM_OwnerID = :ownerId)', { ownerId: ownerId }).orderBy('m.M_MachineID').getRawMany();
        }
        return await this.entityManager.getRepository(Machine).createQueryBuilder('m')
            .select(['m.M_MachineID as MachineID', 'm.M_Name as MachineName', 'type.MT_MachineTypeName as Model'])
            .leftJoin('m.type', 'type')
            .orderBy('m.M_MachineID')
            .getRawMany();
    }


    getRefMachineID = async () => {
        return this.entityManager.query('Select M_MachineID,M_Name From Machine (nolock) where M_Active = 1 order by M_MachineID');
    }

    getMachineList = async (start: number, limit: number, sort: any[], params: any) => {
        const { active, isSuperAdmin, ownerId, machineIds } = params;
        let whereClause = '';
        let queryParameter = {};
        
        if(!isSuperAdmin && ownerId) {
            whereClause += 'M_MachineID IN (select ONM_MachineID from Owner_Machine where ONM_OwnerID = :ownerId)';
            queryParameter = { ...queryParameter, ownerId: ownerId }
            if (machineIds) {
                whereClause += ' AND M_MachineID in (:...machineIds)';
                queryParameter = { ...queryParameter, machineIds: machineIds }
            }
        } else {
            if(machineIds) {
                whereClause = ' M_MachineID in (:...machineIds)';
                queryParameter = { ...queryParameter, machineIds: machineIds };                
            }
        }

        if (active) {
            whereClause = whereClause.length === 0 ? ' M_Active = :active' : whereClause + ' AND M_Active = :active';
            queryParameter = { ...queryParameter, active: active }
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
        let machine;
        try {
            machine = await this.entityManager.getRepository(Machine).createQueryBuilder('machine')
            .select(['machine', 'type'])
            .leftJoin('machine.type', 'type')
            .where('machine.M_MachineID =:machineId', { machineId: machineId })
            .maxExecutionTime(6000)
            .getOneOrFail();
        } catch (error) {
            return null;
        }
        if(machine) {
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

            const products = await this.getMachineProductList(machineId);
            const stocks = await this.getMachineStockList(machineId);
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

    updateChannelStatus = async (machineId: string, channelId: string, isDrink: boolean, clearError: boolean, status: any) => {
        let updatedChannel;
        try{ 
            if(!isDrink) {
                const channel = await this.entityManager.getRepository(MachineChannel).createQueryBuilder('channel')
                .where('MC_MachineID = :machineId AND MC_ChannelID = :channelId', { machineId: machineId, channelId: channelId }).getOneOrFail();
                if(clearError) {
                    channel.MC_MCUClearError = clearError;
                    channel.MC_ErrorCode = '0';
                    channel.MC_Status = status || 0;
                    try {
                        updatedChannel = await this.entityManager.getRepository(MachineChannel).save(channel)
                    } catch(error) {
                        throw new Error('fail to update channel error status');
                    }
                }
            } else {
                const channel = await this.entityManager.getRepository(MachineChannelDrink).createQueryBuilder('chDrink')
                .where('MCD_MachineID = :machineId AND MCD_ChannelID = :channelId', { machineId: machineId, channelId: channelId }).getOneOrFail();
                if(clearError) {
                    channel.MCD_MCUClearError = clearError;
                    channel.MCD_StatusCode ='0';
                    channel.MCD_Status = status || '正常';
                    try {
                        updatedChannel = await this.entityManager.getRepository(MachineChannelDrink).save(channel)
                    } catch(error) {
                        throw new Error('fail to update channel error status');
                    }
                }
            }
            return updatedChannel;
        } catch (error) {
            return null;
        }
    }

    searchMachineProductFromMaster = async (machineId: string, params?: any) => {
        const { active, category, productName, priceUp, priceLow } = params;
        const existed = await this.entityManager.getRepository(MachineProduct).createQueryBuilder('product')
            .select('product.MP_ProductID')
            .where('product.MP_MachineID = :machineId', { machineId: machineId })
            .getRawMany();
        const productCodes = existed.map(p => p.MP_ProductID);
        let whereClause = 'master.MP_ProductID not in (:existed)';
        let queryParameter: any = { existed: productCodes };

        if (active) {
            whereClause += ' AND master.MP_Active = :active';
            queryParameter = { ...queryParameter, active:active };
        }
        if(category) {
            whereClause += ' AND MP_ProductID in (Select MPC_ProductID From Master_ProductCategory (nolock) where mpc_Categoryid = \':category\' ';
            queryParameter = { ...queryParameter, category: category }; 
        }
        if(productName) {
            whereClause += ' AND (MP_ProductName like \'%:productName%\' or MP_ProductNameEng like \'%:productName%\') ';
            queryParameter = { ...queryParameter, productName: productName };
        }
        if(priceUp && priceLow) {
            whereClause += ' AND (MP_price >= :priceLow and MP_Price <= :priceUp) ';
            queryParameter = { ...queryParameter, priceLow: priceLow, priceUp: priceUp };
        }
        return await this.entityManager.getRepository(Product).createQueryBuilder('master')
            .innerJoinAndSelect('master.detail', 'detail')
            .innerJoinAndSelect('master.category', 'category')
            .where(whereClause, queryParameter)
            .orderBy('master.MP_ProductID', 'ASC')
            .getMany();
    }

    searchMachineStockFromMaster = async (machineId: string, params?: any) => {
        const { active, category, stockName, priceUp, priceLow } = params;
        const existed = await this.entityManager.getRepository(MachineStock).createQueryBuilder('stock')
            .select('stock.MS_MachineID')
            .where('stock.MS_MachineID = :machineId', { machineId: machineId })
            .getRawMany();
        const stockCodes = existed.map(s => s.MS_StockCode);
        let whereClause = 'master.MS_StockCode not in (:existed)';
        let queryParameter: any = { existed: stockCodes };

        if (active) {
            whereClause += ' AND master.MS_Active = :active';
            queryParameter = { ...queryParameter, active: active };
        }
        if(category) {
            whereClause += ' AND MS_StockCode in (Select MSC_StockCode From Master_StockCategory (nolock) where msc_Categoryid = \':category\'';
            queryParameter = { ...queryParameter, category: category };
        }
        if(stockName) {
            whereClause += ' AND (MS_StockName like \'%:stockName%\' or MS_StockNameEng like \'%stockName%\'';
            queryParameter = { ...queryParameter, stockName: stockName };
        }
        if(priceUp && priceLow) {
            whereClause += ' AND (MS_Price >= :priceLow AND MS_Price <= :price';
            queryParameter = { ...queryParameter, priceLow: priceLow, priceUp: priceUp };
        }
        return await this.entityManager.getRepository(Stock).createQueryBuilder('master')
            .innerJoinAndSelect('master.category', 'category')
            .where(whereClause, queryParameter)
            .orderBy('master.MS_StockName')
            .getMany();
    }

    getMachineProductList = async (machineId: string) => {
        const data = await this.entityManager.getRepository(MachineProduct).createQueryBuilder('product')
            .select(['product'])
            .where(`product.MP_MachineID = :machineId`, { machineId: machineId })
            .orderBy('product.MP_ProductID', 'ASC')
            .getMany();
        
        return data.map(d =>{
            return {
                ...d,
                DetailBtn: '',
                DeleteBtn: ''
            }
        })
    }

    getMachineProductDetail = async (machineId: string, productId: string) => {
        let product;
        try {
            product = await this.entityManager.getRepository(MachineProduct).createQueryBuilder('product')
                .select(['product', 'category', 'productDetail'])
                .leftJoin('product.category', 'category')
                .leftJoin('product.productDetail', 'productDetail')
                .where(`product.MP_MachineID = :machineId AND product.MP_ProductID = :productId`, { machineId: machineId, productId: productId }).getOneOrFail();
        } catch(error) {
            return null;
        }
        const prdImage = await this.entityManager.createQueryBuilder()
                    .select('img.*')
                    .from('Machine_ProductImage', 'img')
                    .where('MPI_MachineID = :machineId and MPI_ProductID = :productId', { machineId: machineId, productId: productId })
                    .orderBy('MPI_ImageIndex')
                    .getRawMany();
                    
        const pageTitle = `${product.MP_MachineID} (${product.MP_ProductID}): ${product.MP_ProductName}`
        const skuDetail = {
            skuName: `[${product.productDetail.MPD_StockCode}] $${product.productDetail.MPD_Price.toFixed(2)} ${product.MP_ProductName}`,
            qty: product.productDetail.MPD_Qty,
            unitPrice: product.productDetail.MPD_UnitPrice.toFixed(2),
            price: product.productDetail.MPD_Price.toFixed(2),
            unit: product.productDetail.MPD_Unit
        }
        return { ...product, 
            MP_UnitPrice: product.MP_UnitPrice.toFixed(2),
            MP_Price: product.MP_Price.toFixed(2),
            skuDetail: skuDetail,
            pageTitle: pageTitle,
            hasImage: prdImage.length > 0,
            prdImage: prdImage
        }
    }

    getMachineStockList = async (machineId: string) => {
        const data = await this.entityManager.getRepository(MachineStock).createQueryBuilder()
        .where('MS_MachineID = :machineId', { machineId: machineId })
        .orderBy('MS_StockCode', 'ASC')
        .getMany();
        return data.map(d =>{
            return {
                ...d,
                DetailBtn: '',
                DeleteBtn: ''
            }
        })
    }

    getMachineStockDetail = async (machineId: string, skuCode: string) =>{
        let stock;
        try {
            stock = await this.entityManager.getRepository(MachineStock).createQueryBuilder('stock')
            .select(['stock', 'category'])
            .leftJoin('stock.category', 'category')
            .where('MS_MachineID = :machineId AND MS_StockCode = :skuCode', { machineId: machineId, skuCode: skuCode }).getOneOrFail();
        } catch (error) {
            return null
        }
        return {
            ...stock,
            MS_UnitPrice: stock.MS_UnitPrice.toFixed(2),
            MS_Price: stock.MS_Price.toFixed(2)
        }
    }

    getSKUNameList = async (machineId: string, stockCode?: string) => {
        let queryParameter:any = { machineId: machineId };
        let whereClause = 'stock.MS_MachineID = :machineId';
        if(stockCode) {
            queryParameter = { ...queryParameter , stockCode: stockCode }
            whereClause += ' AND stock.MS_StockCode = :stockCode';
        }
        const stock = await this.entityManager.getRepository(MachineStock).createQueryBuilder('stock')
            .where(whereClause, queryParameter)
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

    saveMahcineProduct = async (params: any) => {
        const { product, stock } = params;
        const updatedProduct = await this.entityManager.getRepository(MachineProduct).save(product);
        const updatedStock = await this.entityManager.getRepository(MachineStock).save(stock);
        return {
            product: updatedProduct, 
            stock: updatedStock,
        };
    }
}
