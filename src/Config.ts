import { app, shell } from 'electron'
import * as path from 'path'
import {readFile, writeFile} from 'fs/promises'
import { existsSync } from 'fs'

export interface MobtimeConfig {
    host: string
}

export class Config {

    config: MobtimeConfig

    configPath() {
        return path.join(
            app.getPath('home'),
            '.mobtime.json'
        )
    }

    configExists(): boolean {
        return existsSync(this.configPath());
    }

    async load() {
        if(!this.configExists()) {
            await this.generateDefaultConfig()
            return;
        }
        const data = (await readFile(this.configPath())).toString('utf-8')
        this.config = JSON.parse(data) as MobtimeConfig
    }

    async openConfig() {
        await shell.openPath(this.configPath());
    }

    async generateDefaultConfig() {
        this.config = {
            host: 'https://mobti.me'
        }
        await writeFile(this.configPath(), JSON.stringify(this.config, null, 2))
    }

    async get(key: keyof MobtimeConfig): Promise<string | undefined> {
        if(!this.config) {
            await this.load()
        }
        return this.config[key] ?? undefined
    }
}