import { Injectable } from '@nestjs/common';
import { Product, Stock } from '../entities/master';
import { IService } from '../common/IService';

@Injectable()
export class MasterService extends IService {

    getAllProductList = async (params?: any) => {
        const { active, schema } = params;
        let whereClause = 'MS_Active = 1';
        if (active) {
            whereClause = `MS_Active = ${active}`;
        }
        return await (await this.getEntityManager(schema)).createQueryBuilder()
            .select('MS_StockCode StockCode, MS_StockName StockName, cast(cast(MS_UnitPrice as numeric(10, 2)) as varchar) UnitPrice')
            .from('Master_Stock', 'ms')
            .where(whereClause)
            .orderBy('MS_StockCode')
            .getRawMany();
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
        //ds.release()
        return data;
    }

    getAllStockCategories = async (schema: string) => {
        const ds = await this.getEntityManager(schema);
        return await ds.query('select RSC_CategoryID as id, RSC_CategoryName from Ref_StockCategory');
    }

    getAllMachineTypes = async () => {
        return await this.entityManager.query('select MT_MachineTypeID as id, MT_MachineTypeName as name from Ref_MachineType order by MT_MachineTypeID desc');
    }

    getAllDeliveryOptions = async () => {
        return await this.entityManager.query('select RDO_OptionID as id, RDO_Name name from Ref_DeliveryOption order by RDO_OptionID')
    }
}
