import { Entity, Column } from "typeorm";

@Entity('Ref_MachineType')
export class MachineType {
    
    @Column({
        name: 'MT_MachineTypeID',
        primary: true
    })
    machineTypeID: string;

    @Column({
        name: 'MT_MachineTypeName'
    })
    name: string;

    @Column({
        name: 'MT_MachineTypeNameEng'
    })
    nameEng: string;

    @Column({
        name: 'MT_Remark'
    })
    remark: string;
}