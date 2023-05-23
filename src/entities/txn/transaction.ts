import { Column, Entity, OneToOne, JoinColumn } from "typeorm";
import { TransactionDetail } from "./transaction_detail";

@Entity('Transaction')
export class Transaction {

    @Column({
        name: 'TX_MachineID',
        primary: true
    })
    machineId: string;

    @Column({
        name: 'TX_TXNID',
        primary: true
    })
    txnId: string;

    @Column({
        name: 'TX_Time',
        type: 'datetime'
    })
    txTime: Date;

    @Column({
        name: 'TX_Currency'
    })
    txCurrency: string;

    @Column({
        name: 'TX_TotalAmt',
        type: 'decimal',
        precision: 18,
        scale: 8
    })
    txTotalAmt: number;

    @Column({
        name: 'TX_SubTotal',
        type: 'decimal',
        precision: 18,
        scale: 8
    })
    txSubTotal: number;

    @Column({
        name: 'TX_SubCharge',
        type: 'decimal',
        precision: 18,
        scale: 8
    })
    txSubCharge: number;

    @Column({
        name: 'TX_TaxAmt',
        type: 'decimal',
        precision: 18,
        scale: 8
    })
    txTaxAmt: number;

    @Column({
        name: 'TX_Freight',
        type: 'decimal',
        precision: 18,
        scale: 8
    })
    txFreight: number;

    @Column({
        name: 'TX_ExchangeRate',
        type: 'decimal',
        precision: 18,
        scale: 8
    })
    txExchangeRate: number;

    @Column({
        name: 'TX_CheckoutTypeID'
    })
    txCheckoutTypeId: string;

    @Column({
        name: 'TX_CheckoutModuleID'
    })
    txCheckoutModuleId: string;
    
    @Column({
        name: 'TX_ReceiptID'
    })
    receiptId: number;

    @Column({
        name: 'TX_TerminalID'
    })
    txTerminalId: string;

    @Column({
        name: 'TX_TXNRef',
        type: 'simple-json'
    })
    txnRef: any;

    @Column({
        name: 'TX_MachineRef',
        type: 'simple-json'
    })
    txMachineRef: any;
    
    @Column({
        name: 'TX_TerminalRef',
        type: 'simple-json'
    })
    txTerminalRef: any;

    @Column({
        name: 'TX_Success'
    })
    txSuccess: string;

    @Column({
        name: 'TX_Status'
    })
    txStatus: string;

    @Column({
        name: 'TX_Sync'
    })
    txSync: number;

    @Column({
        name: 'TX_SyncTime',
        type: 'datetime'
    })
    txSyncTime: Date;

    @Column({
        name: 'TX_SyncID'
    })
    txSyncID: number;

    @Column({
        name: 'TX_RowID'
    })
    txRowID: number;

    @OneToOne(() => TransactionDetail)
    @JoinColumn([
        {
            name: 'TX_MachineID',
            referencedColumnName: 'txdMachineId'
        },
        {
            name: 'TX_TXNID',
            referencedColumnName: 'txdTxnId'
        }
    ])
    txDetail: TransactionDetail;
}
