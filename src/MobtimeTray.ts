import {Tray, Menu, MenuItemConstructorOptions} from 'electron'
import * as path from "path";
import TrayImage from '../resources/tray_dark.png'

export class MobtimeTray {

    tray: Tray | undefined
    contextMenuItems: MenuItemConstructorOptions[] = []

    create() {
        this.tray = new Tray(path.resolve(__dirname, TrayImage))
        this.contextMenu();
    }

    contextMenu() {
        const menu = Menu.buildFromTemplate(this.contextMenuItems)
        this.tray.setContextMenu(menu)
    }

    addMenuItem(items: MenuItemConstructorOptions[]) {
        this.contextMenuItems.push(...items)
        this.contextMenu();
    }

    setTitle(title: string) {
        this.tray?.setTitle(title);
    }

    cleanup() {
        this.tray.destroy()
    }
}