import { Entity, PrimaryColumn, Column, OneToOne, JoinColumn, ManyToMany, JoinTable, UpdateDateColumn } from "typeorm";
import { ProductGroup } from "../ref";
import { ProductCategory } from "../ref/product_category";

@Entity('Master_ProductDetail')
export class ProductDetail {

    @PrimaryColumn()
    MPD_ProductID: string;

    @PrimaryColumn()
    MPD_SeqID: number;

    @Column()
    MPD_StockCode: string;
    
    @Column()
    MPD_Qty: number;

    @Column()
    MPD_Unit: string;

    @Column('decimal')
    MPD_UnitPrice: number;
    
    @Column('decimal')
    MPD_Price: number;
}

@Entity('Master_Product')
export class Product {

    @PrimaryColumn()
    MP_ProductID: string;
    
    @Column()
    MP_Active: boolean;
    
    @Column()
    MP_Suspend: boolean;
    
    @Column()
    MP_MachineDelivery: boolean;
    
    @Column()
    MP_DeliveryOption: boolean;
    
    @Column()
    MP_HideUI: boolean;
    
    @Column()
    MP_HideSoldout: boolean;
    
    @Column()
    MP_ProductName: string;
    
    @Column()
    MP_ProductNameEng: string;
    
    @Column()
    MP_Description: string;
    
    @Column()
    MP_DescriptionEng: string;
    
    @Column()
    MP_Brand: string;
    
    @Column()
    MP_BrandEng: string;
    
    @Column()
    MP_Unit: string;
    
    @Column('decimal')
    MP_UnitPrice: number;
    
    @Column('decimal')
    MP_Price: number;
    
    @Column()
    MP_Currency: string;
    
    @Column()
    MP_Schedule: boolean;
    
    @Column()
    MP_Deleted: boolean;

    @Column('simple-json')
    MP_ExtraData: any;

    @UpdateDateColumn({
        name: 'MP_Lastupdate',
        type: 'datetime'
    })
    MP_Lastupdate: Date;

    @Column()
    MP_ProductTypeID: string;

    @Column()
    MP_Remark: string;

    @ManyToMany(() => ProductCategory, {
        cascade: ["insert", "update"]
    })
    @JoinTable({
        name: 'Master_ProductCategory',
        joinColumn:{ 
            name: 'MPC_ProductID', referencedColumnName: 'MP_ProductID'
        },
        inverseJoinColumn: { 
            name: 'MPC_CategoryID'
        }
    })
    category: ProductCategory;

    @ManyToMany(() => ProductGroup, {
        cascade: ["insert", "update"]
    })
    @JoinTable({
        name: 'Master_ProductGroup',
        joinColumn:{ 
            name: 'MPG_ProductID', referencedColumnName: 'MP_ProductID'
        },
        inverseJoinColumn: { 
            name: 'MPG_ProductGroupID'
        }
    })
    group: ProductGroup;

    @OneToOne(() => ProductDetail)
    @JoinColumn({
        name: 'MP_ProductID',
        referencedColumnName: 'MPD_ProductID'
    })
    detail: ProductDetail;
}
