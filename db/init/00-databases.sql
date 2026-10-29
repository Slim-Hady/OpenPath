-- One database per service (PM1 design: one data owner per service).
-- Runs once, on an empty Postgres data volume.

CREATE DATABASE "account_db";
CREATE DATABASE "developer_profile_db";
CREATE DATABASE "issue_search_db";
CREATE DATABASE "contribution_tracking_db";
CREATE DATABASE "onboarding_learning_db";
CREATE DATABASE "ai_guide_db";
CREATE DATABASE "community_recognition_db";
CREATE DATABASE "mentor_network_db";
CREATE DATABASE "notification_db";
CREATE DATABASE "admin_db";
