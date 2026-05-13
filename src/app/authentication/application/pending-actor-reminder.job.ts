import { Actor } from '../model/actor.model';
import { PendingActorSummary } from '../model/keycloak-actors.model';

export interface PendingActorDigestPort {
    send(admins: Actor[], pending: PendingActorSummary[]): Promise<void>;
}

export interface ReminderActorsPort {
    listPendingActorSummaries(): Promise<PendingActorSummary[]>;
    listMibiAdmins(): Promise<Actor[]>;
}

export interface ReminderJobConfig {
    olderThanMs: number;
    windowMs: number;
}

export class PendingActorReminderJob {
    private lastSentAt: Date | null = null;

    constructor(
        private readonly actors: ReminderActorsPort,
        private readonly digest: PendingActorDigestPort,
        private readonly config: ReminderJobConfig,
        private readonly clock: () => Date = () => new Date()
    ) {}

    async run(): Promise<void> {
        const now = this.clock();

        if (
            this.lastSentAt !== null &&
            now.getTime() - this.lastSentAt.getTime() < this.config.windowMs
        ) {
            return;
        }

        const allPending = await this.actors.listPendingActorSummaries();
        const pending = allPending.filter(
            a =>
                now.getTime() - a.registeredAt.getTime() >
                this.config.olderThanMs
        );

        if (pending.length === 0) {
            return;
        }

        const admins = await this.actors.listMibiAdmins();
        await this.digest.send(admins, pending);
        this.lastSentAt = now;
    }
}
