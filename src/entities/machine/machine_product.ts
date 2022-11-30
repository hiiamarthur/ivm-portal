import { Entity, PrimaryColumn, Column, OneToOne, JoinColumn, ManyToOne, ManyToMany, JoinTable } from "typeorm"
import { ProductCategory } from "../ref/product_category";
import { Machine } from "./machine";
@Entity('Machine_ProductDetail')
export class MachineProductDetail {

    @Column({
        name: 'MPD_MachineID',
        primary: true
    })
    MPD_MachineID: string;
    
    @Column({
        name: 'MPD_ProductID',
        primary: true
    })
    MPD_ProductID: string;

    @Column()
    MPD_SeqID: number;

    @Column()
    MPD_StockCode: string;
    
    @Column()
    MPD_Qty: number;

    @Column()
    MPD_Unit: string;

    @Column({ type: 'decimal', precision: 18, scale: 8 })
    MPD_UnitPrice: number;
    
    @Column({ type: 'decimal', precision: 18, scale: 8 })
    MPD_Price: number;

}
@Entity('Machine_Product')
export class MachineProduct {

    @ManyToOne(() => Machine, (m) => m.products)
    @JoinColumn([
        { name: 'MP_MachineID', referencedColumnName: 'M_MachineID'}
    ])
    machine: Machine;

    @PrimaryColumn()
    MP_MachineID: string;
    
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
    
    @Column({type: 'decimal', precision: 18, scale: 8})
    MP_UnitPrice: number;
    
    @Column({type: 'decimal', precision: 18, scale: 8})
    MP_Price: number;
    
    @Column()
    MP_Currency: string;
    
    @Column()
    MP_Schedule: boolean;
    
    @Column()
    MP_PriceGroup: string;
    
    @Column()
    MP_UpdateByServer: boolean;
    
    @Column()
    MP_Limited: boolean;
    
    @Column()
    MP_LimitQty: number;

    @Column()
    MP_LimitCurrent: number; 

    @Column()
    MP_Remark: string;

    @Column('datetime')
    MP_Lastupdate: Date;
    
    @Column()
    MP_Sync: boolean;

    @Column('datetime')
    MP_SyncTime: Date;

    @OneToOne(() => MachineProductDetail, { cascade: true })
    @JoinColumn([
        { name: 'MP_MachineID', referencedColumnName: 'MPD_MachineID' },
        { name: 'MP_ProductID', referencedColumnName: 'MPD_ProductID' }
    ])
    productDetail: MachineProductDetail;

    @ManyToMany(() => ProductCategory, { cascade: true })
    @JoinTable({
        name: 'Machine_ProductCategory',
        joinColumns:[
            { name: 'MPC_MachineID', referencedColumnName: 'MP_MachineID'},
            { name: 'MPC_ProductID', referencedColumnName: 'MP_ProductID'}
        ],
        inverseJoinColumns: [
            { name: 'MPC_CategoryID'}
        ]
    })
    category: ProductCategory;
}