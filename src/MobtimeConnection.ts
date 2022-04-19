// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
import { Mobtime, nodeWebsocket, Message } from '@mobtime/sdk'

type Listener = (instance: MobtimeState) => void
type Member = {id: string, name: string};

export class MobtimeState {
    timeRemaining: number
    mob: Member[] = []
    listener: Listener

    setTimeRemaining(timeRemaining: number) {
        this.timeRemaining = timeRemaining
        this.listener?.(this);
    }

    setMob(members: Member[]) {
        this.mob = members
        this.listener?.(this);
    }

    setListener(listener: Listener) {
        this.listener = listener;
    }

    topTwoMembers() {
        const members = [...this.mob]
        members.length = Math.min(members.length, 2)
        return members
    }

}

export class MobtimeConnection {

    mobtime: any
    state = new MobtimeState()
    interval: NodeJS.Timer;

    create(urlString: string){
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
            .then(this.start.bind(this))
            .catch(() => {
                this.cleanup()
            })
    }

    start(mobtime: any) {

        mobtime.on(Message.MOB_UPDATE, () => {
            this.state.setMob(mobtime.mob().items())
        })

        this.interval = setInterval(() => {
            try {
                if (!mobtime.timer().isRunning()) return;

                this.state.setTimeRemaining(mobtime.timer().remainingMilliseconds())
                this.state.setMob(mobtime.mob().items())

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

    cleanup() {
        if(this.interval){
            clearInterval(this.interval)
        }
    }

    setListener(listener: Listener) {
        this.state.setListener(listener);
    }

}