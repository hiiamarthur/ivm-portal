import { Entity, Column, PrimaryColumn, ManyToOne, JoinColumn } from 'typeorm';
import { Owner } from './owner';
import { OwnerLogin } from './owner_login';

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

  @ManyToOne(() => Owner, {
      createForeignKeyConstraints: false,
  })
  @JoinColumn({
    name: 'ONP_OwnerID',
    referencedColumnName: 'ON_OwnerID',
  })
  readonly owner: Owner;
}
