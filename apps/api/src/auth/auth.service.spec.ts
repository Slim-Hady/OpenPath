import { canLinkByEmail } from './auth.service';

describe('email account linking', () => {
  it('links only when the provider marks the email verified', () => {
    expect(canLinkByEmail({ sub: 'a', email: 'a@example.com', email_verified: true })).toBe(true);
    expect(canLinkByEmail({ sub: 'a', email: 'a@example.com', email_verified: false })).toBe(false);
    expect(canLinkByEmail({ sub: 'a', email: 'a@example.com' })).toBe(false);
  });
});
