import { Column, Entity, OneToOne, JoinColumn } from "typeorm";

@Entity('DeliveryOrder_Detail')
export class DeliveryOrderDetail {

    @Column({
        name: 'DOD_MachineID',
        primary: true
    })
    machineID: string;

    @Column({
        name: 'DOD_DeliveryOrderID',
        primary: true
    })
    deliveryOrderID: string;

    @Column({
        name: 'DOD_SubID',
        primary: true
    })
    subID: number;

    @Column({
        name: 'DOD_StockCode'
    })
    stockCode: string;

    @Column({
        name: 'DOD_Qty'
    })
    qty: number;

    @Column({
        name: 'DOD_Finish'
    })
    finish: boolean;

    @Column({
        name: 'DOD_FinishTime',
        type: 'datetime'
    })
    finishTime: Date;

    @Column({
        name: 'DOD_Remark'
    })
    remark: string;

    @Column({
        name: 'DOD_Ref'
    })
    ref: string;

    @Column({
        name: 'DOD_SyncID'
    })
    syncID: number;

    @Column({
        name: 'DOD_RowID'
    })
    rowID: number;
}

@Entity('DeliveryOrder')
export class DeliveryOrder {

    @Column({
        name: 'DO_MachineID',
        primary: true
    })
    machineID: string;

    @Column({
        name: 'DO_DeliveryOrderID',
        primary: true
    })
    deliveryOrderID: string;

    @Column({
        name: 'DO_Time',
        type: 'datetime'
    })
    time: Date;

    @Column({
        name: 'DO_OrderStatus'
    })
    orderStatus: string;

    @Column({
        name: 'DO_DeliveryTypeID'
    })
    deliveryTypeID: string;

    @Column({
        name: 'DO_Finish'
    })
    finish: boolean;

    @Column({
        name: 'DO_Creator'
    })
    creator: string;

    @Column({
        name: 'DO_Detail'
    })
    detail: string;

    @Column({
        name: 'DO_Remark'
    })
    remark: string;

    @Column({
        name: 'DO_Ref',
        type: 'simple-json'
    })
    ref: any;

    @Column({
        name: 'DO_Sync'
    })
    sync: boolean;

    @Column({
        name: 'DO_SyncTime',
        type: 'datetime'
    })
    syncTime: Date;

    @Column({
        name: 'DO_SyncID'
    })
    syncID: number;

    @Column({
        name: 'DO_RowID'
    })
    rowID: number;

    @OneToOne(() => DeliveryOrderDetail)
    @JoinColumn([
        {
            name: 'DO_MachineID',
            referencedColumnName: 'machineID'
        },
        {
            name: 'DO_DeliveryOrderID',
            referencedColumnName: 'deliveryOrderID'
        }
    ])
    deliveryOrderDetail: DeliveryOrderDetail;

}