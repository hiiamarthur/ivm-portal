import { Column, Entity, PrimaryColumn, UpdateDateColumn, ManyToMany, JoinTable } from "typeorm";
import { StockCategory } from "../ref";

@Entity('Master_Stock')
export class Stock {

    @PrimaryColumn()
    MS_StockCode: string;

    @Column()
    MS_Active: boolean;
    
    @Column()
    MS_Suspend: boolean;
    
    @Column()
    MS_StockName: string;
    
    @Column()
    MS_StockNameEng: string;
    
    @Column()
    MS_Description: string;
    
    @Column()
    MS_DescriptionEng: string;
    
    @Column()
    MS_Brand: string;
    
    @Column()
    MS_BrandEng: string;
    
    @Column()
    MS_Unit: string;
    
    @Column('decimal')
    MS_UnitPrice: number;
    
    @Column('decimal')
    MS_Price: number;
    
    @Column()
    MS_BarCode: string;
    
    @Column()
    MS_AdjustInventory: boolean;

    @Column('smalldatetime')
    MS_ExpiryDate: Date;
    
    @Column('smalldatetime')
    MS_ReminderDate: Date;
    
    @Column()
    MS_Remark: string;
    
    @UpdateDateColumn({
        name: 'MS_LastUpdate',
        type: 'datetime'
    })
    MS_LastUpdate: Date;
    
    @Column('simple-json')
    MS_ExtraData: any;

    @ManyToMany(() => StockCategory, {
        cascade: ["insert", "update"]
    })
    @JoinTable({
        name: 'Master_StockCategory',
        joinColumn: { name: 'MSC_StockCode', referencedColumnName: 'MS_StockCode' },
        inverseJoinColumn:  { name: 'MSC_CategoryID' }
    })
    category: StockCategory;
}