import { Entity, Column, PrimaryColumn, ManyToOne, JoinColumn } from 'typeorm';
import { Owner } from './owner';

@Entity('Owner_Permission')
export class OwnerPermission {
  @PrimaryColumn()
  ONP_OwnerID: string;

  @PrimaryColumn()
  ONP_Section: string;

  @PrimaryColumn()
  ONP_Function: string;

  @Column('simple-json')
  ONP_Setting: any;

  @ManyToOne(() => Owner, (owner) => owner.permissions)
  @JoinColumn({
    name: 'ONP_OwnerID',
    referencedColumnName: 'ON_OwnerID',
  })
  owner: Owner;
}
