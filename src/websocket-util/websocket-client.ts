import WebSocket from 'ws';

export class WebsocketAdmin {

    socket: WebSocket;

    initSocket = (port?: WebSocketAdminPort) => {
        port = port || WebSocketAdminPort.IVM;
        this.socket = new WebSocket(`wss://aws.ivmtech.com:${port}`)
        
        this.socket.on('open', () => {
            console.log('socket is opened')
            this.socket.send('something');
        })

        // this.socket.onopen = (event: any) => {
        //     console.log(`opensocket: ${event}`)
        //     this.socket.send(JSON.stringify({
        //         Action: 'Auth',
        //         AdminID: 'demo',
        //         AuthToken: 'testing',
        //         AppID: 'iVending Admin',
        //         AppVer: '1.11',
        //         Time: new Date().getTime() 
        //     }), (response) => {
        //         console.log(response)
        //     })
        // }

        this.socket.on('error', console.error);

        this.socket.on('message', function message(data) {
            console.log('received: %s', data);
          });
    }

    init(){ 
        if(!this.socket) {
            this.initSocket(WebSocketAdminPort.IVM)
        }
    }


    
}

export enum WebSocketAdminPort {
    IVM = 18889,
    HOSTING = 28889,
    NW = 31889
}