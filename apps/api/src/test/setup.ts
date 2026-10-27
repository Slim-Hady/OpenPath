process.env.NODE_ENV = process.env.NODE_ENV ?? 'test';
process.env.AUTH_DEV_MODE = process.env.AUTH_DEV_MODE ?? 'true';
process.env.ENABLE_SCHEDULER = 'false';
process.env.GEMINI_API_KEY = process.env.GEMINI_API_KEY ?? '';
if (!process.env.TEST_DATABASE_URL) {
  process.env.TEST_DATABASE_URL = 'postgresql://osh:osh_dev_password@localhost:5432/osh_test';
}
process.env.DATABASE_URL = process.env.TEST_DATABASE_URL;
process.env.DIRECT_URL = process.env.TEST_DATABASE_URL;
