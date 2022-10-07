import { Entity, ManyToOne, PrimaryColumn, Column, JoinColumn } from "typeorm"
import { Machine } from "./machine";

@Entity('Machine_ChannelDrink')
export class MachineChannelDrink {

    @ManyToOne(() => Machine)
    @JoinColumn({
        name: 'MCD_MachineID',
        referencedColumnName: 'M_MachineID'
    })
    machine: Machine;

    @PrimaryColumn()
    MCD_MachineID: string;

    @PrimaryColumn()
    MCD_ChannelID: string;

    @Column()
    MCD_ChannelMode: string;

    @Column()
    MCD_Active: boolean;

    @Column()
    MCD_Suspend: boolean;

    @Column()
    MCD_StockCode: string;
    
    @Column({type: 'decimal', readonly: true })
    MCD_Cost: number;
    
    @Column()
    MCD_Unit: string;

    @Column({ type: 'decimal', precision: 9, scale: 2})
    MCD_Capacity: number;  

    @Column({ type: 'decimal', precision: 9, scale: 2})
    MCD_Balance: number;

    @Column({ readonly: true })
    MCD_SalesCount: number;

    @Column({type: 'decimal', readonly: true})
    MCD_SalesAmt: number;

    @Column()
    MCD_Status: string;
    
    @Column()
    MCD_StatusCode: string;

    @Column()
    MCD_Remark: string;

    @Column('smalldatetime')
    MCD_ExpiryDate: Date;

    @Column('smalldatetime')
    MCD_ReminderDate: Date;

    @Column('datetime')
    MCD_LastUpdate:Date;

    @Column()
    MCD_MCUClearError: boolean;

    @Column()
    MCD_MCUUpdate: boolean;

    @Column('simple-json')
    MCD_ExtraData: any;
    
    @Column()
    MCD_Sync: boolean;

    @Column('datetime')
    MCD_SyncTime: Date;
}

export enum ChannelDrinlkMode {
    BEAN,
    BIB,
    BOX,
    CUP,
    TEA,
    WATER,
    ORANGE,
    APPLE
}