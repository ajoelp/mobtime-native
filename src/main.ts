import { app, BrowserWindow, Tray, Menu } from 'electron'
import * as path from 'path'
import {WebsocketConnection} from "./WebsocketConnection";
import Store from 'electron-store'


let tray: Tray;
let mainWindow: BrowserWindow;
let userString: string

function createTray() {
    tray = new Tray(path.resolve(__dirname, '../icons/tray_dark.png'))
}

const websocketConnection = new WebsocketConnection((instance) => {
    userString = (() => {
        const rotations = [...instance.currentRotation??[]]
        rotations.length = 2
        return rotations.map(a => a.name).join(' > ')
    })()
})

const createWindow = () => {
    // Create the browser window.
    mainWindow = new BrowserWindow({
        width: 900,
        height: 700,
        webPreferences: {
            preload: path.join(__dirname, 'preload.js')
        }
    })

    // and load the index.html of the app.
    mainWindow.loadURL('https://mobti.me')

    createTray()

    mainWindow.webContents.on('did-navigate', () => {
        websocketConnection.connectToUrl(mainWindow.webContents.getURL())
    })

    mainWindow.on('page-title-updated', (e) => {
        const time = processTitle(mainWindow.getTitle())
        if(tray) {
            tray.setTitle([time, userString].join(' '))
        }
    })

    // mainWindow.webContents.openDevTools()
}

function processTitle(title: string) {
    const result = /([0-9][0-9]:[0-9][0-9])/g.exec(title)
    return result ? result[0]: null
}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.whenReady().then(() => {
    createWindow()

    app.on('activate', () => {
        // On macOS it's common to re-create a window in the app when the
        // dock icon is clicked and there are no other windows open.
        if (BrowserWindow.getAllWindows().length === 0) createWindow()
    })
})

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on('window-all-closed', () => {
    websocketConnection.disconnect()
    app.quit()
})
