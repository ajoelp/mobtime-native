import {app, BrowserWindow} from 'electron';
import {MobtimeWindow} from "./MobtimeWindow";

// eslint-disable-next-line @typescript-eslint/no-var-requires
require('update-electron-app')()

const window = new MobtimeWindow()

if (require('electron-squirrel-startup')) {
  app.quit();
}

app.on('ready', () => window.create());

app.on('window-all-closed', () => {
  app.quit();
});

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    window.create()
  }
});
