import { clearStoredCodeVerifier, getAuthCallbackParams, getRedirectUri, getStoredCodeVerifier, getToken, shouldAttemptTokenExchange, storeCodeVerifier } from './functions';

describe('PKCE verifier helpers', () => {
  beforeEach(() => {
    window.localStorage.clear();
    window.sessionStorage.clear();
  });

  it('persists and retrieves the verifier across storage layers', () => {
    const verifier = 'abc123XYZ';

    storeCodeVerifier(verifier);

    expect(getStoredCodeVerifier()).toBe(verifier);

    clearStoredCodeVerifier();

    expect(getStoredCodeVerifier()).toBeNull();
  });

  it('uses the full current origin for the redirect URI', () => {
    const originalLocation = window.location;

    Object.defineProperty(window, 'location', {
      configurable: true,
      value: {
        origin: 'http://127.0.0.1:3000',
        hostname: '127.0.0.1',
      },
    });

    expect(getRedirectUri()).toBe('http://127.0.0.1:3000/redirect');

    Object.defineProperty(window, 'location', {
      configurable: true,
      value: originalLocation,
    });
  });

  it('only attempts one token exchange per authorization code', () => {
    expect(shouldAttemptTokenExchange('code-1')).toBe(true);
    expect(shouldAttemptTokenExchange('code-1')).toBe(false);
    expect(shouldAttemptTokenExchange('code-2')).toBe(true);
  });

  it('reads authorization response params from either query or hash callbacks', () => {
    expect(getAuthCallbackParams('?code=abc123&state=test')).toMatchObject({ code: 'abc123', state: 'test' });
    expect(getAuthCallbackParams('#access_token=token&expires_in=3600&token_type=Bearer')).toMatchObject({
      access_token: 'token',
      expires_in: '3600',
      token_type: 'Bearer',
    });
  });

  it('stores an absolute expiry timestamp after exchanging the token', async () => {
    global.fetch = jest.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ access_token: 'token', expires_in: 3600 }),
    });

    storeCodeVerifier('verifier');
    await getToken('auth-code');

    const expiryTime = Number(window.localStorage.getItem('expiry_time'));
    expect(expiryTime).toBeGreaterThan(Date.now());
    expect(expiryTime).toBeGreaterThan(Date.now() + 3_500_000);
  });
});
