import { Entity, ManyToOne, PrimaryColumn, Column, JoinColumn } from "typeorm"
import { Machine } from "./machine";

@Entity('Machine_AD')
export class Ads {

    @ManyToOne(() => Machine)
    @JoinColumn({
        name: 'MA_MachineID',
        referencedColumnName: 'M_MachineID'
    })
    machine: Machine;

    @PrimaryColumn()
    MA_MachineID: string;

    @PrimaryColumn()
    MA_ADID: string;

    @Column({
        type: 'tinyint',
        nullable: false
    })
    MA_AdType: AdType;

    @Column()
    MA_Active: boolean;
    
    @Column()
    MA_Index: number;

    @Column('smalldatetime')
    MA_Datefrom: Date;

    @Column('smalldatetime')
    MA_Dateto: Date;

    @Column('smalldatetime')
    MA_UploadTime: Date;

    @Column('datetime')
    MA_LastUpdate: Date;

    @Column('simple-json')
    MA_Config: any;

    @Column({
        type: 'tinyint',
        readonly: true 
    })
    MA_Sync: boolean;

    @Column({
        type: 'datetime',
        readonly: true
    })
    MA_SyncTime: Date;
}

export enum AdType {
    topvideo = 1,
    fullscreen = 2
}