import { Entity, Column, PrimaryColumn, ManyToOne, JoinColumn, OneToMany, OneToOne } from 'typeorm';
import { MachineProduct, MachineStock } from './index';
import { MachineType } from '../ref/machine_type';

@Entity('Machine')
export class Machine {

  @PrimaryColumn()
  M_MachineID: string;

  @Column()
  M_Name: string;

  @Column()
  M_NameEng: string;

  @Column()
  M_MachineType: string;

  @Column('smalldatetime')
  M_StartDate: Date;

  @Column()
  M_Active: boolean;

  @Column()
  M_Suspend: boolean;

  @Column()
  M_LocationLat: number;

  @Column()
  M_LocationLon: number;

  @Column()
  M_Location: string;

  @Column()
  M_LocationID: string;

  @Column()
  M_Address: string;

  @Column()
  M_AddressEng: string;

  @Column()
  M_StationName: string;

  @Column()
  M_OwnerName: string;

  @Column()
  M_StaffHandle: string;

  @Column()
  M_FollowMasterProduct: boolean;

  @Column()
  M_VerifyHardwareID: boolean;

  @Column('ntext')
  M_Remark: string;

  @Column()
  M_ServerToken: string;

  @Column()
  M_ClientUIToken: string;

  @Column()
  M_APIToken: string;

  @Column('simple-json')
  M_Config: any;

  @Column('datetime')
  M_LastUpdate: Date;

  @OneToOne(() => MachineType)
  @JoinColumn({
    name: 'M_MachineType',
    referencedColumnName: 'machineTypeID'
  })
  type: MachineType;
  
  @OneToMany(() => MachineProduct, (mp) => mp.machine)
  @JoinColumn({
    name: 'M_MachineID',
    referencedColumnName: 'MP_MachineID'
  })
  products: MachineProduct[];

  @OneToMany(() => MachineStock, (stock) => stock.machine)
  @JoinColumn({
    name: 'M_MachineID',
    referencedColumnName: 'MS_MachineID'
  })
  stocks: MachineStock[];

  checkOutModules: any[];

  @OneToMany(() => MachineStatus, status => status.machine)
  @JoinColumn({
    name: 'M_MachineID',
    referencedColumnName: 'SM_MachineID'
  })
  status?: MachineStatus[]
}

@Entity('Status_Machine') 
export class MachineStatus {

  @PrimaryColumn()
  SM_Status: string;

  @PrimaryColumn()
  SM_Section: string;

  @PrimaryColumn()
  SM_MachineID: string;

  @ManyToOne(type => Machine)
  @JoinColumn({
    name: 'SM_MachineID',
    referencedColumnName: 'M_MachineID'
  })
  machine?: Machine;

  @Column('simple-json')
  SM_ExtraData: any;

  @Column('datetime')
  SM_LastUpdate: Date;

  @Column()
  SM_Sync: boolean;

}
