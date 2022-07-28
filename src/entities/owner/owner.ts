import { Entity, Column, PrimaryColumn, OneToOne, JoinColumn, OneToMany, AfterLoad } from 'typeorm';
import { OwnerLogin } from './owner_login';
import { OwnerPermission } from './owner_permission';

@Entity('Owner')
export class Owner {
  @PrimaryColumn()
  ON_OwnerID: string;

  @Column()
  ON_OwnerName: string;

  @Column()
  ON_OwnerNameEng: string;

  @Column()
  ON_Active: boolean;

  @Column('smalldatetime')
  ON_Lastupdate: Date;

  @Column('simple-json')
  ON_ExtraData: any;

  @OneToOne(() => OwnerLogin)
  @JoinColumn({ name: 'ON_OwnerID', referencedColumnName: 'ONL_OwnerID' })
  loginCredential: OwnerLogin;

  @OneToMany(() => OwnerPermission, (op) => op.owner, { cascade: false })
  @JoinColumn({
    name: 'ON_OwnerID',
    referencedColumnName: 'ONP_OwnerID',
  })
  readonly permissions: OwnerPermission[];

  sBackDay: number;

  permissionsMap: Map<string, any>;

  @AfterLoad()
  updatePermissionMap() {
    this.sBackDay = this.permissions && this.permissions.filter((op) => op.ONP_Function === 'salesreport').length > 0 ? this.permissions.filter((op) => op.ONP_Function === 'salesreport')?.[0].ONP_Setting['Backday'] : 180;
    this.permissionsMap = this.permissions ? this.permissions.reduce((acc, pm) => {
      acc[pm.ONP_Function] = pm.ONP_Setting;
      return acc;
    }, new Map<string, any>()) : null
  }
}
