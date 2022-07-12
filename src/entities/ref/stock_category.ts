import { Entity, Column } from "typeorm"

@Entity('Ref_StockCategory')
export class StockCategory {

    @Column({
        name: 'RSC_CategoryID',
        primary: true
    })
    categoryID: string;

    @Column({
        name: 'RSC_CategoryName'
    })
    categoryName: string;

    @Column({
        name: 'RSC_CategoryNameEng'
    })
    categoryNameEng: string;
}