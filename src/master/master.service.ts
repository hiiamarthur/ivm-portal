import { Injectable } from '@nestjs/common';
import { Product, Stock } from '../entities/master';
import { IService } from '../common/IService';
import { MachineProduct, MachineStock } from '../entities/machine';

@Injectable()
export class MasterService extends IService {

    searchMasterProduct = async (params?: any) => {
        const { machineId, isActive, category, productName, priceUp, priceLow, schema, start, limit, sort } = params;
        const em = await this.getEntityManager(schema);
        let whereClause = 'master.MP_ProductID not in (select distinct MP_ProductID from Machine_Product where MP_MachineID = :machineId)';
        let queryParameter: any = { machineId: machineId };

        if (isActive) {
            whereClause += ' AND master.MP_Active = :active';
            queryParameter = { ...queryParameter, active: isActive };
        }
        if(category) {
            whereClause += ' AND MP_ProductID in (select distinct MPC_ProductID From Master_ProductCategory (nolock) where MPC_CategoryID = :category)';
            queryParameter = { ...queryParameter, category: category }; 
        }
        if(productName) {
            whereClause += ' AND (MP_ProductName like :productName or MP_ProductNameEng like :productName)';
            queryParameter = { ...queryParameter, productName: `%${productName}%` };
        }
        if(priceUp && priceLow) {
            whereClause += ' AND (MP_price >= :priceLow and MP_Price <= :priceUp) ';
            queryParameter = { ...queryParameter, priceLow: priceLow, priceUp: priceUp };
        }

        const sStart = start || 0;
        const sLimit = limit || 12;

        let orderBy = 'master.MP_ProductID';
        let orderDir = 'ASC';
        
        if(sort) {
            orderBy = `master.${sort.column}`;
            orderDir = sort.dir;
        }
        
        const count = await em.getRepository(Product).createQueryBuilder('master').where(whereClause, queryParameter).getCount();
        const data = await em.getRepository(Product).createQueryBuilder('master')
        .innerJoinAndSelect('master.category', 'category')
        .where(whereClause, queryParameter)
        .orderBy(orderBy, orderDir === 'DESC' ? 'DESC' : 'ASC')
        .limit(sLimit)
        .offset(sStart)
        .getMany()
        return {
            total: count,
            data: data
        }
    }

    addMasterProductToMachine = async (params: any) => {
        const { schema, machineId, productIds } = params;
        const em = await this.getEntityManager(schema);
        if(!productIds || productIds.length === 0) {
            throw new Error('no productIds') 
        }
        productIds.forEach(async (p) => {
            const input = {
                MachineID: machineId,
                ProductID: p
            }
            try {
                await this.callStoredProcedure(em, 'spCloneMasterToMachine_Product', input);
            } catch (error) {
                throw error
            }
        })
    }

    searchMasterStock = async (params?: any) => {
        const { machineId, active, category, stockName, priceUp, priceLow, schema, start, limit, sort } = params;
        const em = await this.getEntityManager(schema);
        const existed = await em.getRepository(MachineStock).createQueryBuilder('stock')
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
            whereClause += ' AND MS_StockCode in (Select MSC_StockCode From Master_StockCategory (nolock) where msc_Categoryid = :category)';
            queryParameter = { ...queryParameter, category: category };
        }
        if(stockName) {
            whereClause += ' AND (MS_StockName like :stockName or MS_StockNameEng like :stockName)';
            queryParameter = { ...queryParameter, stockName: `%${stockName}%` };
        }
        if(priceUp && priceLow) {
            whereClause += ' AND (MS_Price >= :priceLow AND MS_Price <= :priceUp)';
            queryParameter = { ...queryParameter, priceLow: priceLow, priceUp: priceUp };
        }

        const sStart = start || 0;
        const sLimit = limit || 12;

        let orderBy = 'master.MS_StockName';
        let orderDir = 'ASC';
        
        if(sort) {
            orderBy = `master.${sort.column}`;
            orderDir = sort.dir;
        }

        const count = await em.getRepository(Stock).createQueryBuilder('master').where(whereClause, queryParameter).getCount();
        const data = await em.getRepository(Stock).createQueryBuilder('master')
            .innerJoinAndSelect('master.category', 'category')
            .where(whereClause, queryParameter)
            .orderBy(orderBy, orderDir === 'DESC' ? 'DESC' : 'ASC')
            .limit(sLimit)
            .offset(sStart)
            .getMany();
        return {
            total: count,
            data: data
        }
    }

    addMasterStockToMachine = async (params: any) => {
        const { schema, machineId, skuCodes } = params;
        const em = await this.getEntityManager(schema);
        if(!skuCodes || skuCodes.length === 0) {
            throw new Error('no stock codes')
        }
        skuCodes.forEach(async (s) => {
            const input = { 
                MachineID: machineId,
                StockCode: s
            }
            try {
                await this.callStoredProcedure(em, 'spCloneMasterToMachine_Stock', input);
            } catch (error) {
                throw error
            }
        })
    }

    getMasterProduct = async (params: any) => {
        const { schema, productCode }= params;
        const ds = await this.getEntityManager(schema);
        let where: any = {
            MP_Active: true
        }
        if(productCode){
            where = { ...where, MP_ProductID: productCode }
        }
        try {
            return await ds.getRepository(Product).find({
                where: where,
                order: {
                    MP_ProductID: 'ASC'
                },
                relations: ['category', 'detail'],
                take: 10
            })
        } catch(error) {
            throw error
        }
    }

    getProductDetailRefSKU = async (productId: string, ownerId?: string) => {
        let whereClause = 'prd.MP_ProductID = (:productId)';
        let queryParameter: any = { productId: productId };
        try {
            if (ownerId) {
                whereClause += ' AND onpl.ONPL_OwnerID = (:ownerId)';
                queryParameter = { ...queryParameter, ownerId: ownerId };
                return await this.entityManager.getRepository(Product).createQueryBuilder('prd')
                    .leftJoin('Owner_ProductList', 'onpl', 'onpl.ONPL_ProductID = prd.MP_ProductID')
                    .where(whereClause, queryParameter)
                    .getOneOrFail();
            } else {
                return await this.entityManager.getRepository(Product).createQueryBuilder('prd')
                    .select(['prd', 'category', 'detail'])
                    .leftJoin('prd.category', 'category')
                    .leftJoin('prd.detail', 'detail')
                    .where(whereClause, queryParameter).getOneOrFail();
            }
        } catch (error) {
            return null;
        }
    }

    saveMasterProduct = async (body: any) => {
        const updated: any = {
            MP_ProductID: body.produt_code,
            MP_Active: body.active,
            MP_Suspend: body.suspend,
            MP_MachineDelivery: body.machine_delivery,
            MP_DeliveryOption: body.delivery_option,
            MP_HideUI: body.hide_ui,
            MP_HideSoldout: body.hide_sold_out,
            MP_ProductName: body.product_name,
            MP_ProductNameEng: body.product_name_eng,
            MP_Description: body.description,
            MP_DescriptionEng: body.description_eng,
            MP_Brand: body.brand,
            MP_BrandEng: body.brand_eng,
            MP_Unit: body.unit,
            MP_UnitPrice: body.cost,
            MP_Price: body.price,
            MP_Currency: body.currency
        }
        if (body.category) {
            updated.category = body.category;
        }
        if (body.detail) {
            updated.detail = body.detail;
        }
        try {
            const result = await this.entityManager.getRepository(Product).save(updated);
            return result ? 'Product detail updated' : 'sql error';
        } catch (error) {
            throw error;
        }
    }

    getStockList = async (ownerId?: string) => {
        let whereClause = 'onsl.ONSL_OwnerID = \'global\'';
        let queryParameter;
        if (ownerId) {
            whereClause += ' OR onsl.ONSL_OwnerID = (:ownerID)';
            queryParameter = { ...queryParameter, ownerID: ownerId };
        }
        return await this.entityManager.getRepository(Stock).createQueryBuilder('s')
            .select(['s.*', '(s.MS_Price - s.MS_UnitPrice) as revenue'])
            .distinctOn(['s.MS_StockCode'])
            .leftJoin('Owner_StockList', 'onsl', 's.MS_StockCode = onsl.ONSL_StockCode')
            .where(whereClause, queryParameter)
            .orderBy('s.MS_StockCode');
    }

    getStockDetailAndCategory = async (stockCode: string, ownerId?: string) => {
        let whereClause = 's.MS_StockCode = (:stockCode) AND onsl.ONSL_OwnerID = \'global\'';
        let queryParameter: any = { stockCode: stockCode };
        if (ownerId) {
            whereClause = 's.MS_StockCode = (:stockCode) AND (onsl.ONSL_OwnerID = \'global\' OR onsl.ONSL_OwnerID = (:ownerId)';
            queryParameter = { ...queryParameter, ownerId: ownerId }
        }
        return await this.entityManager.getRepository(Stock).createQueryBuilder('s')
            .leftJoin('Owner_StockList', 'onsl', 's.MS_StockCode = onsl.ONSL_StockCode')
            .innerJoinAndSelect('s.category', 'category')
            .where(whereClause, queryParameter)
            .getOneOrFail();
    }

    saveStock = async (body: any) => {
        const updated: any = {
            MS_StockCode: body.stock_code,
            MS_Active: body.active,
            MS_Suspend: body.suspend,
            MS_StockName: body.stock_name,
            MS_StockNameEng: body.stock_name_eng,
            MS_Description: body.description,
            MS_DescriptionEng: body.description_eng,
            MS_Brand: body.brand,
            MS_BrandEng: body.brand_eng,
            MS_Unit: body.unit,
            MS_UnitPrice: body.cost,
            MS_Price: body.price
        }
        if (body.category) {
            updated.category = body.category;
        }
        try {
            const result = await this.entityManager.getRepository(Stock).save(updated);
            return result ? 'Stock detail updated' : 'sql error';
        } catch (error) {
            throw error;
        }
    }

    getAllProductGroups = async (schema: string) => {
        return (await this.getEntityManager(schema)).query('select RPG_ProductGroupID as id, RPG_ProductGroupName as name from Ref_ProductGroup order by RPG_ProductGroupID');
    }

    getAllProductCategories = async (schema: string) => {
        const ds = await this.getEntityManager(schema);
        const data = await ds.query('select RPC_CategoryID as id, RPC_CategoryName as name from Ref_ProductCategory');
        return data;
    }

    getAllStockCategories = async (schema: string) => {
        const ds = await this.getEntityManager(schema);
        return await ds.query('select RSC_CategoryID as id, RSC_CategoryName as name from Ref_StockCategory');
    }

    getAllMachineTypes = async (schema: string) => {
        const ds = await this.getEntityManager(schema);
        return await ds.query('select MT_MachineTypeID as id, MT_MachineTypeName as name from Ref_MachineType order by MT_MachineTypeID desc');
    }

    getAllDeliveryOptions = async (schema: string) => {
        const ds = await this.getEntityManager(schema);
        return await ds.query('select RDO_OptionID as id, RDO_Name as name from Ref_DeliveryOption order by RDO_OptionID')
    }
}
