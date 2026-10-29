import type { ServiceDefinition } from '@osh/service-kit';

export const service: ServiceDefinition = {
  name: "Mentor Network",
  slug: "mentor-network",
  sprint: "Sprint 5",
  database: "mentor_network_db",
  provides: [
    "IMentorNetwork"
  ],
  requires: [
    "ICommunity",
    "IGitHubAPI",
    "INotification"
  ],
  owns: [
    "OutreachRequest",
    "OutreachConversation",
    "OutreachMessage",
    "BlockedUser"
  ],
};
