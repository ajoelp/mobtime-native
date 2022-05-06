// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
import { Mobtime, nodeWebsocket, Message } from '@mobtime/sdk'
import {MobtimeWindow} from "./MobtimeWindow";
import Utils from "./Utils";

type Listener = (instance: MobtimeState) => void
type Member = {id: string, name: string};

export class MobtimeState {
    timeRemaining: number
    mob: Member[] = []

    setTimeRemaining(timeRemaining: number) {
        this.timeRemaining = timeRemaining
    }

    setMob(members: Member[]) {
        this.mob = members
    }

    topTwoMembers() {
        const members = [...this.mob]
        members.length = Math.min(members.length, 2)
        return members
    }

}

export const MAX_RETRIES = 5;

export class MobtimeConnection {

    public mobtime: any
    public interval: NodeJS.Timer;
    public retries = 0
    public state = new MobtimeState()
    private window: MobtimeWindow;
    private urlString: string;

    constructor(window: MobtimeWindow) {
        this.window = window;
    }

    create(urlString: string){
        this.urlString = urlString
        const url = new URL(urlString)

        if(url.pathname === '/') {
            this.cleanup()
            return;
        }

        this.mobtime = new Mobtime()
            .usingSocket(
                nodeWebsocket(
                    url.pathname.replace(/^\/+/, ''),
                    {
                        domain: url.host,
                        secure: true
                    }
                )
            )
            .then((mobtime: any) => {
                this.start(mobtime)
                mobtime.on('close', () => this.websocketDisconnected())
                mobtime.on('error', () => this.websocketDisconnected())
            })
            .catch(() => {
                this.cleanup()
                this.mobtime.off('close', () => this.websocketDisconnected())
                this.mobtime.off('error', () => this.websocketDisconnected())
            })
    }

    websocketDisconnected() {
        this.cleanup()
        this.window.tray.setTitle("Websocket disconnected.")
    }

    reloadWebsocket(){
        this.cleanup()
        this.create(this.urlString)
    }

    start(mobtime: any) {
        this.retries = 0

        mobtime.on(Message.MOB_UPDATE, () => {
            this.state.setMob(mobtime.mob().items())
            this.updateTimingTitle(this.state);
        })

        this.interval = setInterval(() => {
            try {
                if (!mobtime.timer().isRunning()) return;

                this.state.setTimeRemaining(mobtime.timer().remainingMilliseconds())
                this.state.setMob(mobtime.mob().items())
                this.updateTimingTitle(this.state);

                if (this.state.timeRemaining === 0) {
                    mobtime
                        .timer()
                        .complete()
                        .commit();
                }
            } catch (e) {
                this.cleanup()
            }
        }, 250)
    }

    updateTimingTitle(mobtime: MobtimeState) {
        this.window.tray.setTitle([
            Utils.formatTime(mobtime.timeRemaining) ?? undefined,
            mobtime.topTwoMembers().map(a => a.name).join(' > ')
        ].filter(Boolean).join(' - '))
    }

    cleanup() {
        if(this.interval){
            clearInterval(this.interval)
            this.interval = null
        }
    }
}
