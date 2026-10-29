import type { ServiceDefinition } from '@osh/service-kit';

export const service: ServiceDefinition = {
  name: "Notification",
  slug: "notification",
  sprint: "Sprint 1 + Sprint 4",
  database: "notification_db",
  provides: [
    "INotification"
  ],
  requires: [
    "IEmailService"
  ],
  owns: [
    "Notification",
    "NotificationPreference"
  ],
};
