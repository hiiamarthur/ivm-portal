import { Entity, Column, PrimaryColumn } from "typeorm";

@Entity('Machine_Voucher')
export class Voucher {

    @PrimaryColumn()
    MV_MachineID: string;
    
    @PrimaryColumn()
    MV_VoucherCode: string;

    @Column('smalldatetime')
    MV_CreateDate: Date;

    @Column()
    MV_VoucherType: string;

    @Column()
    MV_Valid: boolean;

    @Column()
    MV_Balance: number;

    @Column()
    MV_Used: boolean;

    @Column('smalldatetime')
    MV_DateFrom: Date;

    @Column('smalldatetime')
    MV_DateTo: Date;

    @Column()
    MV_UsedTime: number;

    @Column()
    MV_Sync: boolean;

    @Column('datetime')
    MV_SyncTime: Date;

    @Column()
    MV_Remark: string;

    @Column('simple-json')
    MV_VoucherData: any;

    @Column('simple-json')
    MV_ExtraData: any;
}