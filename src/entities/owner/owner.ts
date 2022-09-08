import { Entity, Column, PrimaryColumn, OneToOne, JoinColumn, JoinTable, OneToMany, AfterLoad, ManyToMany } from 'typeorm';
import { Machine } from '../machine';
import { Product, Stock } from '../master';
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

  @OneToOne(() => OwnerLogin, (login) => login.owner, { cascade: ['insert', 'update'] })
  @JoinColumn({ name: 'ON_OwnerID', referencedColumnName: 'ONL_OwnerID' })
  login?: OwnerLogin;

  @OneToMany(() => OwnerPermission, (op) => op.owner)
  @JoinColumn({ name: 'ON_OwnerID', referencedColumnName: 'ONP_OwnerID' })
  permissions?: OwnerPermission[];

  @ManyToMany(() => Machine, { cascade: ['insert', 'update'] })
  @JoinTable({
    name: 'Owner_Machine',
    joinColumn: { name: 'ONM_OwnerID', referencedColumnName: 'ON_OwnerID' },
    inverseJoinColumn:  { name: 'ONM_MachineID' }
  })
  machines: Machine[];

  @ManyToMany(() => Product, { cascade:  ['insert', 'update']})
  @JoinTable({
    name: 'Owner_ProductList',
    joinColumn: { name: 'ONPL_OwnerID', referencedColumnName: 'ON_OwnerID' },
    inverseJoinColumn:  { name: 'ONPL_ProductID' }
  })
  products: Product[];

  @ManyToMany(() => Stock, { cascade: true })
  @JoinTable({
    name: 'Owner_StockList',
    joinColumn: { name: 'ONSL_OwnerID', referencedColumnName: 'ON_OwnerID' },
    inverseJoinColumn:  { name: 'ONSL_StockCode' }
  })
  stocks: Stock[];
  
  userRole: string;

  isSuperAdmin: boolean;

  sBackDay: number;

  permissionsMap: Map<string, any>;

  @AfterLoad()
  updatePermission() {
    this.userRole = this.ON_ExtraData?.Role || 'Client';
    this.isSuperAdmin = this.ON_ExtraData?.Role && this.ON_ExtraData?.Role === 'SuperAdmin';
    this.sBackDay = this.permissions ? this.getsBackDay(this.permissions) : null;
    this.permissionsMap = this.permissions ? this.permissions.reduce((acc, pm) => {
      acc[pm.ONP_Function] = pm.ONP_Setting;
      return acc;
    }, new Map<string, any>()) : null
  }

  getsBackDay(permissions: any[]) {
    if (!permissions) return null
    if(permissions.find(op => op.ONP_Function === 'sBackDay')) {
      return permissions.find(op => op.ONP_Function === 'sBackDay').ONP_Setting?.value;
    } else if(permissions.find(op => op.ONP_Function === 'salesreport')){
      return permissions.find(op => op.ONP_Function === 'salesreport').ONP_Setting?.Backday;
    } else {
      return null
    }
  }
}
