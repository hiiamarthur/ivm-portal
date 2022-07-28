import { Column, Entity, JoinColumn, ManyToOne, PrimaryColumn } from "typeorm";
import { Machine } from '../machine';

@Entity('EventLog_Machine')
export class MachineLog {

    @PrimaryColumn()
    ELM_ID: string;

    @ManyToOne(() => Machine)
    @JoinColumn({
        name: 'ELM_MachineID',
        referencedColumnName: 'M_MachineID'
    })
    machine: Machine;

    @Column()
    ELM_MachineID: string;
    
    @Column('datetime')
    ELM_Time: Date;

    @Column()
    ELM_Event: string;
    
    @Column()
    ELM_Detail: string;
    
    @Column('simple-json')
    ELM_ExtraData: any;
    
    @Column()
    ELM_Creator: string;
}