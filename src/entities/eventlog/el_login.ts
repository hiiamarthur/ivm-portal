import { Column, Entity, PrimaryColumn } from "typeorm";

@Entity('EventLog_Login')
export class LoginLog {

    @PrimaryColumn()
    ELL_ID: number;

    @Column('datetime')
    ELL_Time: Date;

    @Column()
    ELL_Action: string;
    
    @Column()
    ELL_StatusCode: number;
    
    @Column()
    ELL_Login: string;
    
    @Column()
    ELL_Detail: string;
    
    @Column()
    ELL_IP: string;
}