import { Logger, Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { DataSource } from 'typeorm';
import { TypeOrmModule } from '@nestjs/typeorm';
import { join } from 'path';
import { AppController } from './app.controller';
import { AuthModule } from './auth/auth.module';
import { OwnerModule } from './owner/owner.module';
import { DashboardModule } from './dashboard/dashboard.module';
import { SalesreportModule } from './salesreport/salesreport.module';
import { MasterModule } from './master/master.module';
import { InventoryModule } from './inventory/inventory.module';
import { GenerateExcelModule } from './generate-excel/generate-excel.module';
import { HostingModule } from './hosting/hosting.module';
import { NwgroupModule } from './nwgroup/nwgroup.module';
import { VoucherModule } from './voucher/voucher.module';
import { MachineModule } from './machine/machine.module';
import { CampaignModule } from './campaign/campaign.module';
import { ImportFileModule } from './import-file/import-file.module';
import { CsModule } from './cs/cs.module';
import { AdsModule } from './ads/ads.module';

// https://docs.nestjs.com/modules
@Module({
  imports: [
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: async(configService: ConfigService) => ({
        name: 'iVendingDB_IVM',
        type: 'mssql',
        host: configService.get('DB_HOST'),
        port: Number(configService.get('DB_PORT')),
        username: configService.get('DB_USERNAME'),
        password: configService.get('DB_PASSWORD'),
        database: 'iVendingDB_IVM',
        entities: [join(__dirname, '/entities/**','/*{.js,.ts}')],
        synchronize: false,
        timezone: 'Asia/Hong_Kong',
        logging:
          process.env.NODE_ENV === 'dev' || process.env.NODE_ENV === 'test',
      }),
      inject: [ConfigService]
    }),
    ConfigModule.forRoot({   
      envFilePath: `${process.cwd()}/.env.${process.env.NODE_ENV}`,
      isGlobal: true
    }),
    AuthModule,
    OwnerModule,
    DashboardModule,
    SalesreportModule,
    MachineModule,
    MasterModule,
    ConfigModule,
    InventoryModule,
    GenerateExcelModule,
    HostingModule,
    NwgroupModule,
    VoucherModule,
    CampaignModule,
    ImportFileModule,
    CsModule,
    AdsModule
  ],
  controllers: [AppController],
  providers: [Logger]
})
export class AppModule {
  constructor(private dataSource: DataSource) {}
}
