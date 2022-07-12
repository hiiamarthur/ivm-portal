import { Entity, Column } from "typeorm"

@Entity('Ref_ProductCategory')
export class ProductCategory {

    @Column({
        name: 'RPC_CategoryID',
        primary: true
    })
    categoryID: string;

    @Column({
        name: 'RPC_CategoryName'
    })
    categoryName: string;

    @Column({
        name: 'RPC_CategoryNameEng'
    })
    categoryNameEng: string;
}