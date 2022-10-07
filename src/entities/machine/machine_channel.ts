import { Column, Entity, JoinColumn, ManyToOne, PrimaryColumn } from "typeorm";
import { Machine } from "./machine";

@Entity('Machine_Channel')
export class MachineChannel {

    @ManyToOne(() => Machine)
    @JoinColumn({
        name: 'MC_MachineID',
        referencedColumnName: 'M_MachineID'
    })
    machine: Machine;

    @PrimaryColumn()
    MC_MachineID: string;

    @PrimaryColumn()
    MC_ChannelID: number;

    @Column()
    MC_Active: boolean;

    @Column()
    MC_Suspend: boolean;

    @Column()
    MC_StockCode: string;

    @Column({type: 'decimal', readonly: true})
    MC_Price: number;

    @Column()
    MC_Capacity: number;

    @Column()
    MC_Balance: number;

    @Column()
    MC_SalesCount: number;

    @Column()
    MC_Sensor: number;

    @Column({type: 'decimal', readonly: true})
    MC_SalesAmt: number;
    
    @Column()
    MC_Status: number;

    @Column()
    MC_ErrorCode: string;

    @Column()
    MC_Remark: string;

    @Column()
    MC_MergedChannelID: number;

    @Column('smalldatetime')
    MC_ExpiryDate: Date;

    @Column('smalldatetime')
    MC_ReminderDate: Date;

    @Column('datetime')
    MC_LastUpdate: Date;

    @Column()
    MC_MCUClearError: boolean;

    @Column()
    MC_MCUUpdate: boolean;

    @Column('simple-json')
    MC_ExtraData: any;

    @Column()
    MC_Sync: boolean;

    @Column('datetime')
    MC_SyncTime: Date;
    
    statusText: string;
}

export const ChannelStatusText = {
   0: '正常',
   4: '卡貨',
   48: '不明(48)',
   64: '不明(64)',
   80: '不明(80)',
   254: '貨道合併',
   255: '貨道連接錯誤'
}