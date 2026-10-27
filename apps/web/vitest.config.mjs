/** @type {import('vitest/config').UserConfig} */
export default {
  test: {
    environment: 'node',
    include: ['**/*.test.ts'],
    passWithNoTests: true,
  },
};
