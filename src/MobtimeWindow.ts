import { BrowserWindow, app} from 'electron';
import {Config} from "./Config";
import {MobtimeTray} from "./MobtimeTray";
import {MobtimeConnection, MobtimeState} from "./MobtimeConnection";
import Utils from "./Utils";

export class MobtimeWindow {
    window: BrowserWindow
    config = new Config()
    tray = new MobtimeTray()
    connection = new MobtimeConnection()

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
                label: 'Reload',
                type: 'normal',
                click: () => { this.reload() }
            }
        ])

        this.window.webContents.on('did-navigate', () => {
            this.connection.create(this.window.webContents.getURL())
            this.connection.setListener((mobtime) => {
                this.mobtimeListener(mobtime)
            })
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

    mobtimeListener(mobtime: MobtimeState) {
        this.tray.setTitle([
            Utils.formatTime(mobtime.timeRemaining) ?? undefined,
            mobtime.topTwoMembers().map(a => a.name).join(' > ')
        ].filter(Boolean).join(' - '))
    }
}