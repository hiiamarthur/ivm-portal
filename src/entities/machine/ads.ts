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
    MA_AdFileName: string;

    @Column({
        type: 'varchar',
        nullable: false
    })
    MA_AdFileType: string;

    @Column({
        type: 'tinyint',
        nullable: false
    })
    MA_AdType: AdType;

    @Column()
    MA_Active: boolean;
    
    @Column()
    MA_Order: number;

    @Column('simple-json')
    MA_Config: any;

    @Column('datetime')
    MA_DateFrom: Date;

    @Column('datetime')
    MA_DateTo: Date;

    @Column('datetime')
    MA_UploadTime: Date;

    @Column('datetime')
    MA_LastUpdate: Date;

}

export enum AdType {
    topad = 1,
    standby = 2
}