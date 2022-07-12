import { Column, Entity } from "typeorm";

@Entity('Ref_CheckoutType')
export class CheckoutType {

    @Column({
        name: 'RCT_CheckoutTypeID',
        primary: true
    })
    checkoutTypeId: string;

    @Column({
        name: 'RCT_CheckoutTypeName'
    })
    name: string;

    @Column({
        name: 'RCT_CheckoutTypeNameEng'
    })
    nameEng: string;

    @Column({
        name: 'RCT_Active'
    })
    active: boolean;

}