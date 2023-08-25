import { Injectable } from '@nestjs/common';
import { Ads, ChannelStatusText, Machine, MachineChannel, MachineChannelDrink, MachineCheckoutModule, MachineProduct, MachineStatus, MachineStock } from '../entities/machine';
import { getColumnOptions } from '../entities/columnNameMapping';
import { IService } from '../common/IService';
import { datatableNoData } from '../common/helper/requestHandler';
import { EntityManager } from 'typeorm';
import { format, parse, subDays } from 'date-fns';
import { ProductCategory, StockCategory } from '../entities/ref';
import { Campaign } from '../entities/campaign';

@Injectable()
export class MachineService extends IService {

    getRefMachineID = async () => {
        return this.entityManager.query('Select M_MachineID, M_Name From Machine (nolock) where M_Active = 1 order by M_MachineID');
    }

    getMachineList = async (params?: any) => {
        const { schema, start, limit, active, isSuperAdmin, ownerId, machineIds, sort } = params;
        let whereClause = '';
        let queryParameter = {};
        const em = await this.getEntityManager(schema);
        
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

        const count = await em.createQueryBuilder()
            .select('count(distinct m.M_MachineID) as total')
            .from(Machine, 'm')
            .where(whereClause, queryParameter)
            .getRawOne();
        
        if(!count || count?.total === 0) {
            return datatableNoData;
        }

        const sStart = start || 0;
        const sLimit = limit || 25;

        const qb = await em.getRepository(Machine).createQueryBuilder('m')
            .select(['m.M_MachineID as MachineID', 'm.M_Name as MachineName', 'type.name as MachineType', 
                'ISNULL(JSON_VALUE(systemInfo.SM_ExtraData, \'$.VendingMachine\'),\'-\') as isOnline',
                'ISNULL(JSON_VALUE(systemInfo.SM_ExtraData, \'$.Heartbeat\'),\'-\') as lastConnectionTime',
                'CAST(JSON_VALUE(mcuInfo.SM_ExtraData, \'$.Temperature\') AS numeric(10,2)) AS Temperature',
                'ISNULL(JSON_VALUE(mcuStatus.SM_ExtraData, \'$.Status\'),\'-\') as MachineStatus',
                'ISNULL(JSON_VALUE(mcuStatus.SM_ExtraData, \'$.Message\'),\'-\') as Message',
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
        const rowData = data.map(d => {
            return { 
                ...d,
                Detail: `<a class='btn btn-outline-dark' href='/machine/detail?machineId=${d.MachineID}'>詳情</a>`
            }
        })
        return {
            page: start,
            ...count,
            recordsTotal: count?.total,
            recordsFiltered: count?.total,
            data: rowData
        }
    }

    getMachineDetail = async (params: any) => {
        const { machineId, schema, canEdit } = params;
        const em = await this.getEntityManager(schema);
        let rtn;
        let machine;
        try {
            machine = await em.getRepository(Machine).createQueryBuilder('machine')
            .select(['machine', 'type'])
            .leftJoin('machine.type', 'type')
            .where('machine.M_MachineID = :machineId', { machineId: machineId })
            .maxExecutionTime(6000)
            .getOneOrFail();
        } catch (error) {
            return null;
        }
        if(machine) {
            const checkoutModules = await em.getRepository(MachineCheckoutModule).createQueryBuilder('ckm')
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
            const showChannelDrink = await em.getRepository(MachineChannelDrink)
                .createQueryBuilder()
                .select('count(distinct MCD_MachineID) as chDrinkCount')
                .where('MCD_MachineID = :machineId', { machineId: machineId })
                .getRawOne();

            const products = await this.getMachineProductList(params);
            const stocks = await this.getMachineStockList(params);
            const ch = await this.getMachineChannelList({ ...params, canEdit: canEdit })
            const campaignList = canEdit ? await this.getCampaignList(params) : null
                                  
            
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
                channelDrinkListOp: showChannelDrink.chDrinkCount > 0 ? getColumnOptions('machine_channel_drink') : null,
                campaignList: campaignList
            };
        }
        const logs = await this.getMachineEventLogs(em, machineId);
        const adsList = await this.getAdsList(params);
        return { ...rtn, ...logs, adsList: adsList };
    }

    getMachineEventLogs = async (em: EntityManager, machineId:string) => {
        const params = { machineId: machineId };
        const receipt = await this.getMachineReceipt(em, params);
        const shipments = await this.getMachineShipmentRecord(em, params);
        const eventlogs = await this.getMachineEventAction(em, params);

        return {
            receipt: receipt,
            shipments: shipments,
            eventlogs: eventlogs
        }
    }

    getMachineCheckoutModuleNotExist = async (machineId: string) => {
        return await this.entityManager.query('SELECT MCM_CheckoutTypeID, MCM_CheckoutModuleID,MCM_Active,isnull((Select RCT_CheckoutTypeName from  Ref_CheckoutType (nolock) where MCM_CheckoutTypeID = RCT_CheckoutTypeID),\'\') CheckoutTypeName , isnull((Select RCT_CheckoutTypeNameEng from Ref_CheckoutType (nolock) where MCM_CheckoutTypeID = RCT_CheckoutTypeID) ,\'\') CheckoutTypeNameEng,MCM_ModuleConfig,MCM_ExtraData,MCM_OfflineMode FROM Master_CheckoutModule (nolock) where mcm_active = 1 and  MCM_CheckoutTypeID not in (Select MCM_CheckoutTypeID from Machine_CheckoutModule(nolock) where mcm_machineID = @0)', [machineId]);
    }

    getMachineReceipt = async (em: EntityManager, params: any) => {
        const { machineId, from, to } = params;
        const timeRange = from && to ? `RC_Time between \'${from}\' and \'${to}\'` : `RC_Time > \'${format(subDays(new Date(), 7), 'yyyy-MM-dd')}\'`
        const query = 'select CONVERT(VARCHAR(20), r.RC_Time, 120) Time, r.RC_PaymentMethod Payment, rd.RCD_Item Item, rd.RCD_Amt Amt from Receipt r '+
        'left join Receipt_Detail rd on r.RC_ReceiptID = rd.RCD_ReceiptID and r.RC_MachineID = rd.RCD_MachineID ' +
        `where r.RC_MachineID = \'${machineId}\' and ${timeRange} order by RC_ReceiptID desc`;
        return await em.query(query);
    }

    getMachineShipmentRecord = async (em: EntityManager, params: any) => {
        const { machineId, from, to } = params;
        const timeRange = from && to ? `ELSR_Time between \'${from}\' and \'${to}\'` : `ELSR_Time > \'${format(subDays(new Date(), 14), 'yyyy-MM-dd')}\'`;
        const query = `select CONVERT(VARCHAR(20),ELSR_Time, 120) Time, ELSR_ChannelID Channel, ELSR_StockCode StockCode, ELSR_Remark Remark from EventLog_ShipmentRecord where ELSR_MachineID = \'${machineId}\' and ${timeRange} order by ELSR_time desc`;
        return await em.query(query);
    }

    getMachineEventAction = async (em: EntityManager, params: any) => {
        const { machineId, from, to } = params;
        const aTimeRange = from && to ? `ELA_Time between \'${from}\' and \'${to}\'` : `ELA_Time > \'${format(subDays(new Date(), 21), 'yyyy-MM-dd')}\'`;
        const mTimeRange = from && to ? `ELM_Time between \'${from}\' and \'${to}\'` : `ELM_Time > \'${format(subDays(new Date(), 21), 'yyyy-MM-dd')}\'`;
        const query =  `select CONVERT(VARCHAR(20), ELA_Time, 120) Time, ELA_AlertType Type, ELA_Detail Detail from EventLog_Alert (nolock) where ELA_MachineID = \'${machineId}\' and ELA_Alert in (\'MCU\',\'UI\',\'Remote\') and ${aTimeRange}`
        + ' union ' +
        `select CONVERT(VARCHAR(20), ELM_Time, 120) Time, ELM_Event Type, ELM_Detail Detail from EventLog_Machine (nolock) where ELM_MachineID = \'${machineId}\' and ELM_Event in (\'Door\') and ${mTimeRange} order by Time desc`;
        return await em.query(query);
    }


    getMachineChannelList = async (params: any) => {
        const { schema, machineId, canEdit } = params;
        const em = await this.getEntityManager(schema);
        const channels = await em.getRepository(MachineChannel).createQueryBuilder('channel')
            .select(['channel.*','stock.MS_StockName as StockName', 'cast(isnull(stock.MS_Price, 0) as decimal(10,2)) as MS_Price', 'stock.MS_ExtraData as MS_ExtraData', '\'\' as EditBtn'])
            .leftJoin('Master_Stock', 'stock', 'stock.MS_StockCode = channel.MC_StockCode')
            .where('channel.MC_MachineID = :machineId', { machineId: machineId })
            .orderBy('channel.MC_ChannelID')
            .getRawMany();

        const chDrink = await em.getRepository(MachineChannelDrink).createQueryBuilder('chDrink')
            .select(['chDrink.*','stock.MS_StockCode as StockCode','stock.MS_StockName as StockName'])
            .leftJoin('Master_Stock', 'stock', 'stock.MS_StockCode = chDrink.MCD_StockCode')
            .where('chDrink.MCD_MachineID = :machineId', { machineId: machineId })
            .orderBy('chDrink.MCD_ChannelID')
            .getRawMany();

        //`${s.MS_StockName} (單${capacities.CapacitySingle}/雙${capacities.CapacityDual}) $${s.MS_Price.toFixed(2)} - ${s.MS_StockCode}`
        
        return {
            channel: channels.map(ch => {
                ch.MC_MachineID = ch.MC_MachineID
                ch.MC_Active = ch.MC_Active === 1 ? true : false,
                ch.MC_MCUClearError = ch.MC_MCUClearError === 1 ? true : false,
                ch.MS_ExtraData = JSON.parse(ch.MS_ExtraData) || {};
                ch.capacities =  {
                    CapacitySingle: ch.MS_ExtraData['CapacitySingle'] || 0,
                    CapacityDual: ch.MS_ExtraData['CapacityDual'] || 0
                }
                ch.StockName = `${ch.StockName} (單${ch.capacities.CapacitySingle}/雙${ch.capacities.CapacityDual}) $${ch.MS_Price.toFixed(2)} - ${ch.MC_StockCode}`
                ch.statusText = ChannelStatusText[ch.MC_Status] || '不明錯誤'
                ch.btn = canEdit ? '<div class="activeBtns d-none">' +
                    `<a href="javascript:void(0);" data-rowid="ch_${ch.MC_MachineID}_${ch.MC_ChannelID}" data-action="update" class="btn btn-outline-dark me-1 updateBtns"></i>儲存</a>` +
                    `<a href="javascript:void(0);" data-rowid="ch_${ch.MC_MachineID}_${ch.MC_ChannelID}" class="btn btn-outline-dark" onclick="hideControls(this)"></i>取消</a>` +
                    '</div>' +
                    '<div class="deactiveBtns">' + 
                    `<a href="javascript:void(0);" data-rowid="ch_${ch.MC_MachineID}_${ch.MC_ChannelID}" class="btn btn-outline-dark me-1 editBtn" onclick="editChannel(this)"></i>編輯</a>` +
                    `<a href="javascript:void(0);" data-rowid="ch_${ch.MC_MachineID}_${ch.MC_ChannelID}" data-action="clearError" class="btn btn-outline-dark clearErrBtn">清除錯誤</a>` +
                    '</div>' : '';
                return ch;
            }),
            channelDrink: chDrink.map(chd => {
                /*chd.btn = canEdit ? '<div class="activeBtns d-none">' +
                    `<a href="javascript:void(0);" data-rowid="${chd.MCD_ChannelID}" data-action="update" class="btn btn-outline-dark me-1 updateBtns"></i>儲存</a>` +
                    `<a href="javascript:void(0);" data-rowid="${chd.MCD_ChannelID}" class="btn btn-outline-dark" onclick="hideControls(this)"></i>取消</a>` +
                    '</div>' +
                    '<div class="deactiveBtns">' + 
                    `<a href="javascript:void(0);" data-rowid="${chd.MCD_ChannelID}" class="btn btn-outline-dark me-1 editBtn" onclick="editChannel(this)"></i>編輯</a>` +
                    `<a href="javascript:void(0);" data-rowid="${chd.MCD_ChannelID}" data-action="clearError" class="btn btn-outline-dark clearErrBtn">清除錯誤</a>` +
                    '</div>' : ''*/
                chd.StockName = `${chd.MCD_ChannelID} ${chd.StockName} (${chd.StockName}) ${chd.MCD_ChannelMode} - ${chd.StockCode}`,
                chd.btn = '';
                return chd;
            })
        }
    }

    getCampaignList = async (params: any) => {
        const { schema, isSuperAdmin, ON_OwnerID } = params;
        const em = await this.getEntityManager(schema);
        if(isSuperAdmin) {
            return await em.getRepository(Campaign).find({
                where: {
                    RC_Active: true
                }
            })
        } else {
            return await em.getRepository(Campaign).createQueryBuilder()
            .where('RC_Active = 1 AND RC_CampaignID IN (select ONC_CampaignID from Owner_Campaign where ONC_OwnerID = :ownerId)', { ownerId: ON_OwnerID })
            .getMany();
        }
    }

    getAdsList = async (params:any) => {
        const { schema, machineId } = params;
        const em = await this.getEntityManager(schema);
        const data =  await em.getRepository(Ads).createQueryBuilder()
            .where('MA_Active = 1 AND MA_DateFrom < GETDATE() AND MA_DateTo >= GETDATE() AND MA_MachineID = :machineId', { machineId: machineId })
            .addOrderBy('MA_AdType', 'ASC')
            .addOrderBy('MA_Order', 'ASC')
            .getMany();
        const rtn = data.map((d) => {
            const dateFormat = 'yyyy-MM-dd HH:mm:ss';
            return {
                ...d,
                MA_AdType: d.MA_AdType === 1 ? '機頂' : '待機',
                duration: d.MA_Config.duration || 'N/A',
                scale: d.MA_Config.scale || 'N/A',
                MA_DateFrom: format(d.MA_DateFrom, dateFormat),
                MA_DateTo: format(d.MA_DateTo, dateFormat),
                MA_UploadTime: format(d.MA_UploadTime, dateFormat)
            }
        })
        return rtn;
    }

    findAMachine = async (params:any) => {
        const { schema, machineId } = params;
        const em = await this.getEntityManager(schema);
        try {
            const entity = await em.getRepository(Machine).findOneOrFail({
                where: {
                    M_MachineID: machineId
                }
            })
            return entity;
        } catch (error) {
            throw error;
        }
    }

    updateMachineCampaigns =async (params:any) => {
        const { schema, campaigns } = params;
        const em = await this.getEntityManager(schema);
        try {
            const entity = await this.findAMachine(params);
            entity.M_Config = { ...entity.M_Config, CampaignID: campaigns }
            entity.M_LastUpdate = new Date();
            em.getRepository(Machine).save(entity);
            return true;
        } catch (error) {
            throw error
        }
    }

    updateMachineConfig = async (params: any) => {
        const { schema, key, value } = params;
        const em = await this.getEntityManager(schema);
        try {
            const entity = await this.findAMachine(params);
            if(!entity.M_Config) {
                entity.M_Config = {}
            } 
            if(key === 'custom_config') {
                let obj = entity.M_Config.custom_config || {};
                obj = { ...obj, ...value }
                entity.M_Config.custom_config = obj;
            } else {
                entity.M_Config[key] = value;
            }
            entity.M_LastUpdate = new Date();
            em.getRepository(Machine).save(entity);
            return true;
        } catch (error) {
            throw error;
        }
    }

    updateMachineItems = async (params: any) => {
        const { product, stock, schema } = params;
        const em = await this.getEntityManager(schema);
        const updatedData:any = {};
        try {
            if(product){
                const pCat = await em.getRepository(ProductCategory).findOneOrFail({
                    where: {
                        categoryID: product.prdcategoryID
                    }
                })
                product.categories = [pCat];
                product.MP_Lastupdate = new Date();
                updatedData.product = await em.getRepository(MachineProduct).save(product);
            }
            if(stock) {
                const sCat = await em.getRepository(StockCategory).findOneOrFail({
                    where: {
                        categoryID: stock.stockcategoryID
                    }
                })
                stock.categories = [sCat];
                stock.MS_Lastupdate = new Date();
                updatedData.stock = await em.getRepository(MachineStock).save(stock);
            }
            return updatedData;
        } catch(error) {
            throw error;
        }
    }

    updateChannelDetail = async (params: any) => {
        const { MC_Active, MC_ExpiryDate, schema } = params;
        const em = await this.getEntityManager(schema);
        const entity = Object.assign({}, params);
        delete entity.schema;
        if(MC_Active){
            entity.MC_Active = MC_Active === "1"? true: false;
            entity.MC_Suspend = !entity.MC_Active;
        }
        if(MC_ExpiryDate){
            entity.MC_ExpiryDate = parse(MC_ExpiryDate, 'yyyy/MM/dd HH:mm', new Date());
        }
        entity.MC_LastUpdate = new Date();
        try {
            const data = await em.getRepository(MachineChannel).save(entity);
            return { ...data, statusText: ChannelStatusText[entity.MC_Status] || '不明錯誤' }
        } catch(error) {
            throw error;
        }
    }

    updateChannelDrinkDetail = async (params: any) => {
        const { MCD_Active, MCD_ExpiryDate, schema } = params;
        const em = await this.getEntityManager(schema);
        const entity = Object.fromEntries(params);
        delete entity.schema;
        entity.MCD_Suspend = !MCD_Active;
        entity.MCD_ExpiryDate = format(MCD_ExpiryDate, 'yyyy-MM-dd HH:mm:ss');
        entity.MCD_LastUpdate = new Date();
        try {
            return await em.getRepository(MachineChannelDrink).save(entity);
        } catch (error) {
            throw error;
        }
    }

    getMachineProductList = async (params: any) => {
        const { machineId, schema, canEdit } = params;
        const em = await this.getEntityManager(schema);
        const data = await em.getRepository(MachineProduct).createQueryBuilder('product')
            .select(['product'])
            .where(`product.MP_MachineID = :machineId`, { machineId: machineId })
            .orderBy('product.MP_ProductID', 'ASC')
            .getMany();
        
        return data.map(d => {
            return {
                ...d,
                btn: canEdit ? '<div>' + 
                `<a class="btn btn-outline-dark me-1 editBtn" title="編輯" href="/machine/product-sku?machineId=${d.MP_MachineID}&itemId=${d.MP_ProductID}&from=tab-2"><i class="fas fa-pencil"></i></a>` + 
                `<a href="javascript:void(0);" class="btn btn-outline-dark" data-bs-attrid="${d.MP_ProductID}" data-bs-action="delete-product" data-bs-title="Delete Product" data-bs-toggle="modal" data-bs-target="#confirmModal"> <i class="fas fa-trash"></i></a>` +
                '</div>' : ''
            }
        })
    }

    getMachineProductDetail = async (params: any) => {
        const { machineId, productId, schema } = params;
        let product;
        const em = await this.getEntityManager(schema);
        try {
            product = await em.getRepository(MachineProduct).createQueryBuilder('product')
                .select(['product', 'category', 'productDetail'])
                .leftJoin('product.category', 'category')
                .leftJoin('product.productDetail', 'productDetail')
                .where(`product.MP_MachineID = :machineId AND product.MP_ProductID = :productId`, { machineId: machineId, productId: productId }).getOneOrFail();
        } catch(error) {
            return null;
        }
        const prdImage = await em.createQueryBuilder()
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
        return { 
            ...product, 
            MP_UnitPrice: product.MP_UnitPrice.toFixed(2),
            MP_Price: product.MP_Price.toFixed(2),
            skuDetail: skuDetail,
            pageTitle: pageTitle,
            hasImage: prdImage.length > 0,
            prdImage: prdImage
        }
    }

    getMachineStockList = async (params: any) => {
        const { machineId, schema, canEdit } = params;
        const em = await this.getEntityManager(schema);
        const data = await em.getRepository(MachineStock).createQueryBuilder()
        .where('MS_MachineID = :machineId', { machineId: machineId })
        .orderBy('MS_StockCode', 'ASC')
        .getMany();
        return data.map(d => {

            return {
                ...d,
                btn: canEdit ? '<div>' + 
                `<a class="btn btn-outline-dark me-1 editBtn" title="編輯" href="/machine/product-sku?machineId=${d.MS_MachineID}&itemId=${d.MS_StockCode}&from=tab-3"><i class="fas fa-pencil"></i></a>` + 
                `<a href="javascript:void(0);" class="btn btn-outline-dark" data-bs-attrid="${d.MS_StockCode}" data-bs-action="delete-stock" data-bs-title="Delete Stock" data-bs-toggle="modal" data-bs-target="#confirmModal"> <i class="fas fa-trash"></i></a>` +
                '</div>' : ''
            }
        })
    }

    getMachineStockDetail = async (params: any) =>{
        const { machineId, skuCode, schema } = params;
        const em = await this.getEntityManager(schema);
        let stock;
        try {
            stock = await em.getRepository(MachineStock).createQueryBuilder('stock')
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

    getChannelSKUOptions = async (params: any) => {
        const { machineId, stockCode, schema } = params;
        let queryParameter:any = { machineId: machineId };
        let whereClause = 'stock.MS_MachineID = :machineId';
        const em = await this.getEntityManager(schema);
        if(stockCode) {
            queryParameter = { ...queryParameter , stockCode: stockCode }
            whereClause += ' AND stock.MS_StockCode = :stockCode';
        }
        const stock = await em.getRepository(MachineStock).createQueryBuilder('stock')
            .where(whereClause, queryParameter)
            .orderBy('stock.MS_StockCode')
            .getMany();
        return stock.map(s => {
            const capacities = {
                CapacitySingle: s.MS_ExtraData['CapacitySingle'] || 0,
                CapacityDual: s.MS_ExtraData['CapacityDual'] || 0
            }
            return {
                value: s.MS_StockCode,
                name: `${s.MS_StockName} (單${capacities.CapacitySingle}/雙${capacities.CapacityDual}) $${s.MS_Price.toFixed(2)} - ${s.MS_StockCode}`
            }
        })
    }

    deleteMachineProduct = async (params:any) => {
        const { machineId, productId, stockCode, schema } = params;
        const em = await this.getEntityManager(schema);
        const query = 'update [Machine_Product] set MP_Active = 0 where MP_MachineID = @0 and MP_ProductID = @1'
        const queryParameter = [machineId, productId];
        try {
            await em.query(query, queryParameter);

            if(stockCode) {
                await this.deleteMachineStock({
                    schema: schema,
                    machineId: machineId,
                    stockCode: stockCode
                })
            }
            return true;
        } catch (error) {
            throw error;
        }
        
    }
    
    deleteMachineStock = async (params:any) => {
        const { machineId, stockCode, schema } = params;
        const em = await this.getEntityManager(schema);
        const query = 'update [Machine_Stock] set MS_Active = 0 where MS_MachineID = @0 and MS_StockCode = @1'
        const queryParameter = [machineId, stockCode];
        try {
            await em.query(query, queryParameter);
            return true;
        } catch (error) {
            throw error;
        }
        
    }
}
