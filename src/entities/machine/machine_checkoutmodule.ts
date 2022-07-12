import { Column, Entity, JoinColumn, ManyToOne, OneToOne, PrimaryColumn } from "typeorm";
import { CheckoutType } from "../ref/checkout_type";
import { Machine } from './index';

@Entity('Machine_CheckoutModule')
export class MachineCheckoutModule {

    @OneToOne(() => CheckoutType)
    @JoinColumn({
        name: 'MCM_CheckoutTypeID',
        referencedColumnName: 'checkoutTypeId'
    })
    type: CheckoutType;

    @ManyToOne(() => Machine)
    @JoinColumn({
        name: 'MCM_MachineID',
        referencedColumnName: 'M_MachineID'
    })
    machine: Machine;

    @PrimaryColumn()
    MCM_MachineID: string;

    @PrimaryColumn()
    MCM_CheckoutTypeID: string;

    @PrimaryColumn()
    MCM_CheckoutModuleID: string;

    @Column()
    MCM_Active: boolean;

    @Column()
    MCM_OfflineMode: boolean;

    @Column('simple-json')
    MCM_ModuleConfig: any;

    @Column('simple-json')
    MCM_ExtraData: any;

    @Column()
    MCM_Sync: boolean;
    
    @Column('datetime')
    MCM_SyncTime: Date;
    
    @Column('datetime')
    MCM_LastUpdate: Date;
}