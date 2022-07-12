import { Column, Entity } from "typeorm";

@Entity('Ref_ProductGroup')
export class ProductGroup {

    @Column({
        name: 'RPG_ProductGroupID',
        primary: true
    })
    productGroupID: string;

    @Column({
        name: 'RPG_ProductGroupName'
    })
    name: string;

    @Column({
        name: 'RPG_ProductGroupNameEng'
    })
    nameEng: string;
}