import { Injectable } from '@nestjs/common';
import { join } from 'path';
import { ConfigService } from '@nestjs/config';
import { DataSource } from 'typeorm';

@Injectable()
export class NwgroupService {

    private dataSource;

    constructor(
        private readonly configService: ConfigService
    ){
        this.dataSource = new DataSource({
            type: 'mssql',
            host: this.configService.get('DB_HOST'),
            port: Number(this.configService.get('DB_NWG_PORT')),
            username: this.configService.get('DB_NWG_USERNAME'),
            password: this.configService.get('DB_NWG_PASSWORD'),
            database: 'iVendingDB_NW',
            entities: [join(__dirname, '..', '/entities/**','/*{.js,.ts}')],
            synchronize: false,
            logging: process.env.NODE_ENV !== 'prod',
        })
    }

    getInititalizedDataSource = async () => {
        if(!this.dataSource.isInitialized) {
            return await this.dataSource.initialize();
        } else {
            return this.dataSource;
        }
    }

}
