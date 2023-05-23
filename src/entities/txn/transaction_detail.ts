import { Column, Entity } from "typeorm";

@Entity('Transaction_Detail')
export class TransactionDetail {

    @Column({
        name: 'TXD_MachineID',
        primary: true
    })
    txdMachineId: string;

    @Column({
        name: 'TXD_TXNID',
        primary: true
    })
    txdTxnId: string;

    @Column({
        name: 'TXD_SubID',
        primary: true
    })
    txdSubId: string;

    @Column({
        name: 'TXD_ProductID'
    })
    productId: string;

    @Column({
        name: 'TXD_Amt',
        type: 'decimal',
        precision: 18,
        scale: 8
    })
    amt: number;

    @Column({
        name: 'TXD_Qty'
    })
    qty: number;

    @Column({
        name: 'TXD_SubTotal',
        type: 'decimal',
        precision: 18,
        scale: 8
    })
    subTotal: number;

    @Column({
        name: 'TXD_SyncID'
    })
    syncID: number;
    
}