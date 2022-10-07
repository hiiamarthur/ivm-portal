import { Column, Entity, JoinColumn, JoinTable, ManyToMany, ManyToOne, PrimaryColumn } from "typeorm"
import { StockCategory } from "../ref/stock_category";
import { Machine } from "./machine";

@Entity('Machine_Stock')
export class MachineStock {

    @ManyToOne(() => Machine)
    @JoinColumn({
        name: 'MS_MachineID',
        referencedColumnName: 'M_MachineID'
    })
    machine: Machine;

    @PrimaryColumn()
    MS_MachineID: string;

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

    @Column({type: 'decimal', precision: 18, scale: 8})
    MS_UnitPrice: number;

    @Column({type: 'decimal', precision: 18, scale: 8})
    MS_Price: number;

    @Column()
    MS_BarCode: string;
    
    @Column()
    MS_AdjustInventory: boolean;
    
    @Column('smalldatetime')
    MS_ExpiryDate: Date;
    
    @Column('smalldatetime')
    MS_ReminderDate: Date;
    
    MS_Remark: string;
    
    @Column('datetime')
    MS_Lastupdate: Date;
    
    @Column()
    MS_Sync: boolean;
    
    @Column('datetime')
    MS_SyncTime: Date;
    
    @Column('simple-json')
    MS_ExtraData: any;

    @ManyToMany(() => StockCategory, { cascade: true })
    @JoinTable({
        name: 'Machine_StockCategory',
        joinColumns: [
            { name: 'MSC_MachineID', referencedColumnName: 'MS_MachineID' },
            { name: 'MSC_StockCode', referencedColumnName: 'MS_StockCode' }
        ],
        inverseJoinColumns:[
            { name: 'MSC_CategoryID' }
        ]
    })
    category: StockCategory;
}
