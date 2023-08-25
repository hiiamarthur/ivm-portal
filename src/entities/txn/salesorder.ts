import { Column, Entity, OneToOne, JoinColumn } from "typeorm";

//@Entity('SalesOrder_Detail')
export class SalesOrderDetail {

    @Column({
        name: 'SOD_MachineID',
        primary: true
    })
    machineID: string;

    @Column({
        name: 'SOD_MachineSalesOrderID',
        primary: true
    })
    machineSalesOrderID: string;
    
    @Column({
        name: 'SOD_SubID',
        primary: true
    })
    subID: number;
    
    @Column({
        name: 'SOD_SystemSalesOrderID'
    })
    systemSalesOrderID: string;

    @Column({
        name: 'SOD_ProductID'
    })
    productID: string;

    @Column({
        name: 'SOD_Amt'
    })
    amt: number;

    @Column({
        name: 'SOD_Qty'
    })
    qty: number;

    @Column({
        name: 'SOD_SubTotal'
    })
    subTotal: number;

    @Column({
        name: 'SOD_Discount'
    })
    discount: number;

    @Column({
        name: 'SOD_ExtraData',
        type: 'simple-json'
    })
    extraData: any;

    @Column({
        name: 'SOD_RowID'
    })
    rowID: number;
}

//@Entity('SalesOrder')
export class SalesOrder {

    @Column({
        name: 'SO_MachineID',
        primary: true
    })
    machineID: string;

    @Column({
        name: 'SO_MachineSalesOrderID',
        primary: true
    })
    machineSalesOrderID: string;

    @Column({
        name: 'SO_SystemSalesOrderID'
    })
    systemSalesOrderID: string;

    @Column({
        name: 'SO_TXNID'
    })
    txnID: string;

    @Column({
        name: 'SO_Time'
    })
    time: Date;

    @Column({
        name: 'SO_CheckoutTypeID'
    })
    CheckoutTypeID: string;

    @Column({
        name: 'SO_CheckoutModuleID'
    })
    CheckoutModuleID: string;

    @Column({
        name: 'SO_Pending'
    })
    pending: boolean;

    @Column({
        name: 'SO_Cancel'
    })
    cancel: boolean;

    @Column({
        name: 'SO_Closed'
    })
    closed: boolean;

    @Column({
        name: 'SO_Refund'
    })
    refund: boolean;

    @Column({
        name: 'SO_Success'
    })
    success: boolean;

    @Column({
        name: 'SO_Finish'
    })
    finish: boolean;

    @Column({
        name: 'SO_ExchangeRate'
    })
    exchangeRate: number;

    @Column({
        name: 'SO_Currency'
    })
    currency: string;

    @Column({
        name: 'SO_CurrencyPay'
    })
    currencyPay: string;

    @Column({
        name: 'SO_TaxAmt'
    })
    taxAmt: number;

    @Column({
        name: 'SO_TaxAmt'
    })
    subCharge: number;

    @Column({
        name: 'SO_Freight'
    })
    freight: number;

    @Column({
        name: 'SO_SubTotal'
    })
    subTotal: number;

    @Column({
        name: 'SO_TaxAmt'
    })
    totalAmt: number;

    @Column({
        name: 'SO_OrderRef',
        type: 'simple-array'
    })
    orderRef: any;

    @Column({
        name: 'SO_TXNRef',
        type: 'simple-json'
    })
    txnRef: any;

    @Column({
        name: 'SO_TerminalID'
    })
    terminalID: string;
    
    @Column({
        name: 'SO_Sync'
    })
    sync: boolean;

    @OneToOne(() => SalesOrderDetail)
    @JoinColumn([
        {
            name: 'SO_MachineID',
            referencedColumnName: 'machineID'
        },
        {
            name: 'SO_MachineSalesOrderID',
            referencedColumnName: 'machineSalesOrderID'
        },
        {
            name: 'SO_SubID',
            referencedColumnName: 'subID'
        }
    ])
    detail: SalesOrderDetail;
    
}