import { ManyToOne, PrimaryColumn, JoinColumn, Column, Entity } from "typeorm";
import { Campaign } from './campaign';

@Entity('Campaign_Voucher')
export class CampaignVoucher {

    @ManyToOne(() => Campaign, (c) => c.vouchers)
    @JoinColumn({
        name: 'CV_CampaignID',
        referencedColumnName: 'RC_CampaignID'
    })
    campaign: Campaign;

    @PrimaryColumn()
    CV_VoucherCode: string;

    @Column()
    CV_VoucherType: string;

    @Column('smalldatetime')
    CV_CreateDate: Date;

    @Column()
    CV_Valid: boolean;

    @Column()
    CV_Balance: number;

    @Column()
    CV_Used: boolean;
    
    @Column('smalldatetime')
    CV_DateFrom: Date;

    @Column('smalldatetime')
    CV_DateTo: Date;

    @Column('datetime')
    CV_UsedTime: Date;

    @Column()
    CV_Remark: string;

    @Column('simple-json')
    CV_VoucherData: any;

    @Column('simple-json')
    CV_ExtraData: any;

}