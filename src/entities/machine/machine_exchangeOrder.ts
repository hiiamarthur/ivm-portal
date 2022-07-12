import { Column, CreateDateColumn, Entity, JoinColumn, OneToOne, PrimaryColumn, UpdateDateColumn } from "typeorm"

@Entity('Machine_ExchangeOrderChannel')
export class ExchangeOrderChannel {

    @Column({
        name: 'MEC_ExchangeID',
        primary: true
    })
    exchangeID: string;

    @Column({
        name: 'MEC_ChannelID',
        primary: true
    })
    channelID: string;

    @Column({
        name: 'MEC_StockCode',
        primary: true
    })
    stockCode: string;

    @Column()
    MEC_LotID: string;

    @Column()
    MEC_Qty: number;

    @Column()
    MEC_Remark: string;
    
}

@Entity('Machine_ExchangeOrderStock')
export class ExchangeOrderStock { 

    @Column({
        name: 'MEOS_ExchangeID',
        primary: true
    })
    exchangeID: string;

    @Column({
        name: 'MEOS_StockCode',
        primary: true
    })
    stockCode: string;

    @Column({
        primary: true
    })
    MEOS_LotID: string;

    @Column()
    MEOS_Qty: number;

    @Column()
    MEOS_Remark: string;
}

@Entity('Machine_ExchangeOrder')
export class MachineExchangeOrder {

    @PrimaryColumn()
    MEO_ExchangeID: string;

    @Column()
    MEO_MachineID: string;

    @CreateDateColumn({
        name: 'MEO_Time',
        type: 'datetime'
    })
    MEO_Time: Date;

    @Column()
    MEO_CreateBy: string;

    @Column()
    MEO_WarehouseID: string;

    @Column()
    MEO_LogisticID: string;

    @Column()
    MEO_Remark: string;

    @Column()
    MEO_Finish: boolean;

    @Column()
    MEO_FinishTime: Date;

    @Column()
    MEO_Status: string;

    @UpdateDateColumn({
        name: 'MEO_LastUpdate',
        type: 'datetime'
    })
    MEO_LastUpdate: Date;

    @Column('simple-json')
    MEO_ExtraData: any;

    @OneToOne(() => ExchangeOrderChannel)
    @JoinColumn({ name: 'MEO_ExchangeID', referencedColumnName: 'exchangeID' })
    channel: ExchangeOrderChannel;

    @OneToOne(() => ExchangeOrderStock)
    @JoinColumn({ name: 'MEO_ExchangeID', referencedColumnName: 'exchangeID' })
    stock: ExchangeOrderStock;

}


