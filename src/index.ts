import {app, BrowserWindow, Tray} from 'electron';
import * as path from 'path';
import {WebsocketConnection} from "./WebsocketConnection";

let tray: Tray;
let mainWindow: BrowserWindow;
let userString: string

function createTray() {
  tray = new Tray(path.resolve(__dirname, '../icons/tray_dark.png'))
}

function processTitle(title: string) {
  const result = /(\d\d:\d\d)/g.exec(title)
  return result ? result[0]: null
}

const websocketConnection = new WebsocketConnection((instance) => {
  userString = (() => {
    const rotations = [...instance.currentRotation??[]]
    rotations.length = 2
    return rotations.map(a => a.name).join(' > ')
  })()
})

if (require('electron-squirrel-startup')) {
  app.quit();
}

const createWindow = (): void => {
  mainWindow = new BrowserWindow({
    height: 900,
    width: 800,
  });

  mainWindow.loadURL('https://mobti.me')

  createTray()

  mainWindow.webContents.on('did-navigate', () => {
    websocketConnection.connectToUrl(mainWindow.webContents.getURL())
  })

  mainWindow.on('page-title-updated', (e) => {
    const time = processTitle(mainWindow.getTitle())
    if(tray) {
      tray.setTitle([time, userString].join(' - '))
    }
  })

  // mainWindow.webContents.openDevTools();
};

app.on('ready', createWindow);

app.on('window-all-closed', () => {
  websocketConnection.disconnect()
  app.quit();
});

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});
