"use strict";
var __spreadArray = (this && this.__spreadArray) || function (to, from, pack) {
    if (pack || arguments.length === 2) for (var i = 0, l = from.length, ar; i < l; i++) {
        if (ar || !(i in from)) {
            if (!ar) ar = Array.prototype.slice.call(from, 0, i);
            ar[i] = from[i];
        }
    }
    return to.concat(ar || Array.prototype.slice.call(from));
};
exports.__esModule = true;
var electron_1 = require("electron");
var path = require("path");
var WebsocketConnection_1 = require("./WebsocketConnection");
var tray;
var mainWindow;
var userString;
function createTray() {
    tray = new electron_1.Tray(path.resolve(__dirname, '../icons/tray_dark.png'));
}
function processTitle(title) {
    var result = /(\d\d:\d\d)/g.exec(title);
    return result ? result[0] : null;
}
var websocketConnection = new WebsocketConnection_1.WebsocketConnection(function (instance) {
    userString = (function () {
        var _a;
        var rotations = __spreadArray([], (_a = instance.currentRotation) !== null && _a !== void 0 ? _a : [], true);
        rotations.length = 2;
        return rotations.map(function (a) { return a.name; }).join(' > ');
    })();
});
if (require('electron-squirrel-startup')) {
    electron_1.app.quit();
}
var createWindow = function () {
    mainWindow = new electron_1.BrowserWindow({
        height: 900,
        width: 800
    });
    mainWindow.loadURL('https://mobti.me');
    createTray();
    mainWindow.webContents.on('did-navigate', function () {
        websocketConnection.connectToUrl(mainWindow.webContents.getURL());
    });
    mainWindow.on('page-title-updated', function (e) {
        var time = processTitle(mainWindow.getTitle());
        if (tray) {
            tray.setTitle([time, userString].join(' - '));
        }
    });
    // mainWindow.webContents.openDevTools();
};
electron_1.app.on('ready', createWindow);
electron_1.app.on('window-all-closed', function () {
    websocketConnection.disconnect();
    electron_1.app.quit();
});
electron_1.app.on('activate', function () {
    if (electron_1.BrowserWindow.getAllWindows().length === 0) {
        createWindow();
    }
});
//# sourceMappingURL=index.js.map