import { client as WebSocket, connection as Connection } from 'websocket'

const URL_REGEX = /https?:\/\/.*\/(.*)/

type MobOrder = string[]

type CurrentRotation = {
    id: string;
    name: string
}

type SomethingChanged = (instance: WebsocketConnection) => void

export class WebsocketConnection {
    currentPath?: URL
    websocket?: WebSocket
    connection?: Connection

    mobOrder?: MobOrder = []
    currentRotation?: CurrentRotation[];
    changed: SomethingChanged;

    constructor(changed: SomethingChanged) {
        this.changed = changed
    }

    connectToUrl(url: string) {
        this.currentPath = new URL(url)

        if(this.currentPath.pathname === '/') {
            this.disconnect()
            return;
        }

        this.connect()
    }

    connect() {
        if(!this.currentPath) return;

        console.log('Connecting to sockets')

        this.websocket = new WebSocket()

        this.websocket.on('connectFailed', function(error) {
            console.log('Connect Error: ' + error.toString());
        });

        this.websocket.on('connect', (connection) => {
            this.connection = connection
            this.connection.on('message', (message) => {
                if (message.type === 'utf8') {
                    const event = JSON.parse(message.utf8Data)
                    this.processEvent(event)
                }
            })
            this.connection.on('error', function(error) {
                console.log("Connection Error: " + error.toString());
            });
            this.connection.on('close', function() {
                console.log('echo-protocol Connection Closed');
            });
        })

        this.websocket.connect(`wss://${this.currentPath.host}${this.currentPath.pathname}`);

        if(!this.currentPath){
            this.disconnect()
        }
    }

    processEvent(event: any) {
        if(event.type === 'settings:update') {
            this.mobOrder = event.settings.mobOrder.split(',') ?? [];
        }
        if(event.type === 'mob:update') {
            this.currentRotation = event.mob ?? []
        }
        this.changed(this)
    }

    disconnect(){
        console.log('Disconnecting from socket')
        this.connection?.close()
        this.websocket = undefined;
        this.currentPath = undefined;
        this.mobOrder = []
        this.currentRotation = []
    }
}