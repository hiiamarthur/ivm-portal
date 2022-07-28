import { Column, Entity, PrimaryColumn } from "typeorm";

@Entity('EventLog_Login')
export class LoginLog {

    @PrimaryColumn({ name: 'ELL_ID', insert: false, update: false })
    id: number;

    @Column({ name: 'ELL_Time', type: 'datetime', insert: false, update: false })
    createTime: Date;

    @Column({ name: 'ELL_Action'})
    action: string;
    
    @Column({ name: 'ELL_StatusCode'})
    statusCode: number;
    
    @Column({ name: 'ELL_Login' })
    loginId: string;
    
    @Column({ name: 'ELL_Detail' })
    detail: string;
    
    @Column({ name: 'ELL_IP' })
    ipAddress: string;
}