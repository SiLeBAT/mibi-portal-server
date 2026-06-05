import { DefaultMailService } from './mail';
import { MailConfiguration, MailService } from './mail.model';

export function createMailService(mailConfig: MailConfiguration): MailService {
    return new DefaultMailService(mailConfig);
}
