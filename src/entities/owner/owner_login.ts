import { Entity, Column, PrimaryColumn, OneToOne } from 'typeorm';
import { Owner } from './owner'

@Entity('Owner_Login')
export class OwnerLogin {
  @PrimaryColumn()
  ONL_Login: string;

  @Column()
  ONL_Password: string;

  @Column()
  ONL_OwnerID: string;

  @Column()
  ONL_Active: number;

  @Column('datetime')
  ONL_ExpireDate: Date;

  @Column('simple-json')
  ONL_Setting: any;

  @OneToOne(() => Owner, (owner) => owner.login)
  owner: Owner;
}
