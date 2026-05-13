import { Actor } from '../model/actor.model';
import { PendingActorSummary } from '../model/keycloak-actors.model';
import { PendingActorDigestPort } from './pending-actor-reminder.job';
import {
    NotificationService,
    EmailNotificationMeta
} from '../../core/model/notification.model';
import { NotificationType } from '../../core/domain/enums';

interface InstituteGroup {
    id: string;
    actors: Array<{
        displayName: string;
        email: string;
        registeredAgo: string;
    }>;
}

export class MailPendingActorDigest implements PendingActorDigestPort {
    constructor(
        private readonly notificationService: NotificationService,
        private readonly appName: string,
        private readonly clientUrl: string
    ) {}

    async send(admins: Actor[], pending: PendingActorSummary[]): Promise<void> {
        const now = new Date();
        const institutes = groupByInstitute(pending, now);
        const subject = `Erinnerung: ${
            pending.length
        } ausstehende Kontoaktivierung${pending.length !== 1 ? 'en' : ''}`;
        const payload = {
            institutes,
            appName: this.appName,
            client_url: this.clientUrl
        };

        for (const admin of admins) {
            this.notificationService.sendNotification<
                typeof payload,
                EmailNotificationMeta
            >({
                type: NotificationType.DIGEST_PENDING_ACTORS,
                payload,
                meta: {
                    to: admin.email,
                    subject,
                    cc: [],
                    attachments: []
                }
            });
        }
        await Promise.resolve();
    }
}

function groupByInstitute(
    pending: PendingActorSummary[],
    now: Date
): InstituteGroup[] {
    const map = new Map<string, InstituteGroup>();
    for (const actor of pending) {
        if (!map.has(actor.instituteId)) {
            map.set(actor.instituteId, { id: actor.instituteId, actors: [] });
        }
        map.get(actor.instituteId)!.actors.push({
            displayName: actor.displayName,
            email: actor.email,
            registeredAgo: formatAgeDays(actor.registeredAt, now)
        });
    }
    return Array.from(map.values());
}

function formatAgeDays(registeredAt: Date, now: Date): string {
    const days = Math.floor(
        (now.getTime() - registeredAt.getTime()) / (24 * 60 * 60 * 1000)
    );
    return `${days} Tag${days !== 1 ? 'e' : ''}`;
}
