import { Entity, Column, PrimaryColumn, JoinColumn, ManyToOne } from 'typeorm';
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
  ONL_Active: boolean;

  @Column('datetime')
  ONL_ExpireDate: Date;

  @Column('simple-json')
  ONL_Setting: any;

  @ManyToOne(()=> Owner, (owner) => owner.login)
  @JoinColumn({ name: 'ONL_OwnerID', referencedColumnName: 'ON_OwnerID' })
  owner: Owner;
}
