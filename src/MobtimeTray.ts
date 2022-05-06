import {Tray, Menu, MenuItemConstructorOptions} from 'electron'
import * as path from "path";
import TrayImage from '../resources/tray_dark.png'
import {MobtimeWindow} from "./MobtimeWindow";

export class MobtimeTray {

    public tray: Tray | undefined
    public contextMenuItems: MenuItemConstructorOptions[] = []
    private window: MobtimeWindow;

    constructor(window: MobtimeWindow) {
        this.window = window;
    }

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
