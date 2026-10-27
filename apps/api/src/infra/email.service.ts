import { Injectable, Logger } from '@nestjs/common';
import { getEnv } from '../config/env';

export interface EmailMessage {
  to: string;
  subject: string;
  text: string;
  html?: string;
}

/**
 * Resend HTTP API. Email is best-effort: in-app notifications are the source
 * of truth. A missing key or a provider error never breaks the request.
 */
@Injectable()
export class EmailService {
  private readonly logger = new Logger(EmailService.name);

  async send(message: EmailMessage): Promise<boolean> {
    const env = getEnv();
    if (!env.EMAIL_PROVIDER_API_KEY) {
      this.logger.warn('email skipped: EMAIL_PROVIDER_API_KEY is not set');
      return false;
    }
    try {
      const response = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${env.EMAIL_PROVIDER_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          from: env.EMAIL_FROM,
          to: [message.to],
          subject: message.subject,
          text: message.text,
          html: message.html,
        }),
        signal: AbortSignal.timeout(10_000),
      });
      if (!response.ok) {
        this.logger.warn(`email provider returned ${response.status}`);
        return false;
      }
      return true;
    } catch (error) {
      this.logger.warn(`email failed: ${error instanceof Error ? error.message : 'unknown'}`);
      return false;
    }
  }
}
