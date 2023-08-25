import { Column, Entity, OneToOne, JoinColumn } from "typeorm";

@Entity('Receipt_Detail')
export class ReceiptDetail {

    @Column({
        name: 'RCD_MachineID',
        primary: true
    })
    machineID: string;

    @Column({
        name: 'RCD_ReceiptID',
        primary: true
    })
    receiptID: number;

    @Column({
        name: 'RCD_SubID',
        primary: true
    })
    subID: number;

    @Column({
        name: 'RCD_Item'
    })
    item: string;

    @Column({
        name: 'RCD_ItemEng'
    })
    itemEng: string;

    @Column({
        name: 'RCD_Amt',
        type: 'decimal',
        precision: 18,
        scale: 8
    })
    amt: number;

    @Column({
        name: 'RCD_Qty'
    })
    qty: number;

    @Column({
        name: 'RCD_SubTotal',
        type: 'decimal',
        precision: 18,
        scale: 8
    })
    subTotal: number;

    @Column({
        name: 'RCD_SyncID'
    })
    syncID: number;

    @Column({
        name: 'RCD_RowID'
    })
    rowID: number;

}

@Entity('Receipt')
export class Receipt {

    @Column({
        name: 'RC_MachineID',
        primary: true
    })
    machineID: string;

    @Column({
        name: 'RC_ReceiptID',
        primary: true
    })
    receiptID: string;

    @Column({
        name: 'RC_Time',
        type: 'datetime'
    })
    time: Date;

    @Column({
        name: 'RC_TXNID'
    })
    txnID: string;

    @Column({
        name: 'RC_Currency'
    })
    currency: string;

    @Column({
        name: 'RC_TotalAmt',
        type: 'decimal',
        precision: 18,
        scale: 8
    })
    totalAmt: number;

    @Column({
        name: 'RC_SubTotal',
        type: 'decimal',
        precision: 18,
        scale: 8
    })
    subTotal: number;

    @Column({
        name: 'RC_SubCharge',
        type: 'decimal',
        precision: 18,
        scale: 8
    })
    subCharge: number;

    @Column({
        name: 'RC_TaxAmt',
        type: 'decimal',
        precision: 18,
        scale: 8
    })
    taxAmt: number;

    @Column({
        name: 'RC_Freight',
        type: 'decimal',
        precision: 18,
        scale: 8
    })
    freight: number;

    @Column({
        name: 'RC_PaymentMethod'
    })
    paymentMethod: string;

    @Column({
        name: 'RC_TerminalID'
    })
    terminalID: string;

    @Column({
        name: 'RC_MachineRef',
        type: 'simple-json'
    })
    machineRef: any;

    @Column({
        name: 'RC_TerminalRef',
        type: 'simple-json'
    })
    terminalRef: any;


    @Column({
        name: 'RC_RowID'
    })
    rowID: number;

    @Column({
        name: 'RC_Sync'
    })
    sync: number;

    @Column({
        name: 'RC_SyncTime',
        type: 'datetime'
    })
    syncTime: Date;

    @Column({
        name: 'RC_SyncID'
    })
    syncID: number;

    @OneToOne(() => ReceiptDetail)
    @JoinColumn([
        {
            name: 'RC_MachineID',
            referencedColumnName: 'machineID'
        },
        {
            name: 'RC_ReceiptID',
            referencedColumnName: 'receiptID'
        }
    ])
    detail: ReceiptDetail;

}