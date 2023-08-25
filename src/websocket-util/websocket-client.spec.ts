import { Test, TestingModule } from '@nestjs/testing';
import { AppModule } from '../app.module';
import { WebsocketAdmin } from './websocket-client';

describe('WebSocketAdminClient Unit Test', () => {
    let client: WebsocketAdmin

    beforeAll(async () => {
        const module: TestingModule = await Test.createTestingModule({
            imports: [AppModule]
        }).compile();

        client = module.get<WebsocketAdmin>(WebsocketAdmin);
        
    })

    // afterEach(() => {
    //     client.closeSocket();
    // })

    it('test initSocket', (done) => {
        client.init();
        done();
    })

    

})