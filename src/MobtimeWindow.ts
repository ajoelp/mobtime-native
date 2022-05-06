import { BrowserWindow, app} from 'electron';
import {Config} from "./Config";
import {MobtimeTray} from "./MobtimeTray";
import {MobtimeConnection} from "./MobtimeConnection";

export class MobtimeWindow {
    window: BrowserWindow
    config = new Config()
    tray: MobtimeTray
    connection: MobtimeConnection

    constructor() {
        this.tray = new MobtimeTray(this)
        this.connection = new MobtimeConnection(this)
    }

    async create() {
        await this.config.load()

        if(!this.window) {
            this.window = new BrowserWindow({
                height: 900,
                width: 800,
                webPreferences: {
                    nodeIntegration: true,
                    contextIsolation: false,
                }
            })
        }

        await this.window.loadURL(await this.config.get('host'))

        this.tray.create()

        this.tray.addMenuItem([
            {
                label: 'Settings',
                type: 'normal',
                click: () => {
                    this.config.openConfig()
                }
            },
            {
                label: 'Reload Socket',
                type: 'normal',
                click: () => {
                    this.connection.reloadWebsocket()
                }
            },
            {
                label: 'Reload',
                type: 'normal',
                click: () => { this.reload() }
            }
        ])

        this.window.webContents.on('did-navigate', () => {
            this.connection.create(this.window.webContents.getURL())
        })
    }

    async reload() {
        await app.relaunch()
        await app.exit(0)
    }

    async cleanup() {
        this.tray.cleanup()
        this.connection.cleanup()
    }
}
