-- Runs only when the Postgres volume is created for the first time.
-- Keeps integration tests away from both Supabase and the dev database.

CREATE DATABASE osh_test;
