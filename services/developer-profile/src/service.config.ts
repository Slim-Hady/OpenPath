import type { ServiceDefinition } from '@osh/service-kit';

export const service: ServiceDefinition = {
  name: "Developer Profile",
  slug: "developer-profile",
  sprint: "Sprint 1",
  database: "developer_profile_db",
  provides: [
    "ISkillProfile"
  ],
  requires: [
    "ILLMService",
    "ICVParser (in-process)",
    "IAISettings"
  ],
  owns: [
    "DeveloperProfile",
    "Skill",
    "UserSkill",
    "Language",
    "UserLanguage",
    "CvFile"
  ],
};
