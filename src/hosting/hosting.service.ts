import { Injectable } from '@nestjs/common';
import { join } from 'path';
import { ConfigService } from '@nestjs/config';
import { DataSource, In } from 'typeorm';
import { Machine } from '../entities/machine';

@Injectable()
export class HostingService {

    private dataSource;

    constructor(
        private readonly configService: ConfigService
    ){
        this.dataSource = new DataSource({
            type: 'mssql',
            host: this.configService.get('DB_HOST'),
            port: Number(this.configService.get('DB_PORT')),
            username: this.configService.get('DB_USERNAME'),
            password: this.configService.get('DB_PASSWORD'),
            database: 'iVendingDB_Hosting',
            entities: [join(__dirname, '..', '/entities/**','/*{.js,.ts}')],
            synchronize: false,
            logging: process.env.NODE_ENV !== 'prod',
        });
    }

    getInititalizedDataSource = async () => {
        if(!this.dataSource.isInitialized) {
            return await this.dataSource.initialize();
        } else {
            return this.dataSource;
        }
    }
    
}
