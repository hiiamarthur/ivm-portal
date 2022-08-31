import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { DataSource } from 'typeorm';
import { TypeOrmModule } from '@nestjs/typeorm';
import { join } from 'path';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { OwnerModule } from './owner/owner.module';
import { DashboardModule } from './dashboard/dashboard.module';
import { SalesreportModule } from './salesreport/salesreport.module';
import { MasterModule } from './master/master.module';
import { InventoryModule } from './inventory/inventory.module';
import { GenerateExcelModule } from './generate-excel/generate-excel.module';
import { OwnerService } from './owner/owner.service';
import { HostingModule } from './hosting/hosting.module';

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
          process.env.NODE_ENV !== 'prod',
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
    MasterModule,
    ConfigModule,
    InventoryModule,
    GenerateExcelModule,
    HostingModule
  ],
  controllers: [AppController],
  providers: [AppService, OwnerService],
})
export class AppModule {
  constructor(private dataSource: DataSource) {}
}
