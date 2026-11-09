import { describe, expect, it } from 'vitest';
import { isSameOriginMutation } from '../security';

describe('same-origin mutation guard', () => {
  it('accepts a same-origin browser request', () => {
    const request = new Request('https://processlink.example/api/jobs', { method: 'POST', headers: { origin: 'https://processlink.example' } });
    expect(isSameOriginMutation(request)).toBe(true);
  });
  it('rejects a cross-origin browser request', () => {
    const request = new Request('https://processlink.example/api/jobs', { method: 'POST', headers: { origin: 'https://attacker.example' } });
    expect(isSameOriginMutation(request)).toBe(false);
  });
  it('rejects malformed Origin headers', () => {
    const request = new Request('https://processlink.example/api/jobs', { method: 'POST', headers: { origin: 'not a url' } });
    expect(isSameOriginMutation(request)).toBe(false);
  });
  it('rejects cross-site fetches when Origin is absent', () => {
    const request = new Request('https://processlink.example/api/jobs', { method: 'POST', headers: { 'sec-fetch-site': 'cross-site' } });
    expect(isSameOriginMutation(request)).toBe(false);
  });
});
