import { PrimaryColumn, OneToMany, JoinColumn, Column, Entity } from "typeorm";
import { CampaignVoucher } from './campaign_voucher';

@Entity('Ref_Campaign')
export class Campaign {

    @PrimaryColumn()
    RC_CampaignID: string;

    @Column()
    RC_Name: string;

    @Column()
    RC_NameEng: string;

    @Column()
    RC_Active: boolean;

    @Column('smalldatetime')
    RC_CreateDate: Date;

    @Column()
    RC_Remark: string;

    @Column('smalldatetime')
    RC_DateFrom: Date;

    @Column('smalldatetime')
    RC_DateTo: Date;

    @Column('smalldatetime')
    RC_LastUpdate: Date;

    @Column('simple-json')
    RC_ExtraData: any;

    @OneToMany(() => CampaignVoucher, cv => cv.campaign)
    @JoinColumn({
        name: 'RC_CampaignID',
        referencedColumnName: 'CV_CampaignID'
    })
    vouchers?: CampaignVoucher[];

}