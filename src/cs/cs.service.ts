import { Injectable } from '@nestjs/common';
import { join } from 'path';
import { ConfigService } from '@nestjs/config';
import { DataSource } from 'typeorm';

@Injectable()
export class CsService {

    private dataSource;

    constructor(
        private readonly configService: ConfigService
    ){
        this.dataSource = new DataSource({
            type: 'mssql',
            host: this.configService.get('DB_HOST'),
            port: Number(this.configService.get('DB_CS_PORT')),
            username: this.configService.get('DB_CS_USERNAME'),
            password: this.configService.get('DB_CS_PASSWORD'),
            database: 'iVendingDB_CS',
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
