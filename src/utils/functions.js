const SPOTIFY_CLIENT_ID = '771a396bfd864a1893e6d23c02e6e269';
const SPOTIFY_TOKEN_EXCHANGED_CODES = 'spotify_token_exchange_codes';
const SPOTIFY_CODE_VERIFIER_KEY = 'spotify_code_verifier';

export const generateRandomString = (length) => {
  var text = '';
  var possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';

  for (var i = 0; i < length; i++) {
    text += possible.charAt(Math.floor(Math.random() * possible.length));
  }
  return text;
};

export const generateCodeVerifier = (length = 64) => {
  const possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-._~';
  let text = '';

  for (let i = 0; i < length; i += 1) {
    text += possible.charAt(Math.floor(Math.random() * possible.length));
  }

  return text;
};

export const generateCodeChallenge = async (verifier) => {
  if (!verifier) {
    return null;
  }

  const encoder = new TextEncoder();
  const data = encoder.encode(verifier);
  const digest = await crypto.subtle.digest('SHA-256', data);
  const bytes = Array.from(new Uint8Array(digest));
  let binary = '';

  bytes.forEach((byte) => {
    binary += String.fromCharCode(byte);
  });

  return btoa(binary)
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/g, '');
};

export const storeCodeVerifier = (verifier) => {
  localStorage.setItem(SPOTIFY_CODE_VERIFIER_KEY, verifier);
};

export const getStoredCodeVerifier = () => {
  return localStorage.getItem(SPOTIFY_CODE_VERIFIER_KEY);
};

export const clearStoredCodeVerifier = () => {
  localStorage.removeItem(SPOTIFY_CODE_VERIFIER_KEY);
};

export const getRedirectUri = () => {
  return 'http://127.0.0.1:3000/redirect';
};

export const shouldAttemptTokenExchange = (code) => {
  try {
    const attemptedCodes = JSON.parse(localStorage.getItem(SPOTIFY_TOKEN_EXCHANGED_CODES) || '[]');

    if (attemptedCodes.includes(code)) {
      return false;
    }

    attemptedCodes.push(code);
    localStorage.setItem(SPOTIFY_TOKEN_EXCHANGED_CODES, JSON.stringify(attemptedCodes));
    return true;
  } catch (error) {
    return true;
  }
};

export const getToken = async (authCode) => {
  if (!authCode) {
    return null;
  }

  const verifier = getStoredCodeVerifier();

  if (!verifier || !shouldAttemptTokenExchange(authCode)) {
    return null;
  }

  const redirectUri = getRedirectUri();
  const params = new URLSearchParams({
    client_id: SPOTIFY_CLIENT_ID,
    grant_type: 'authorization_code',
    code: authCode,
    redirect_uri: redirectUri,
    code_verifier: verifier,
  });

  const response = await fetch('https://accounts.spotify.com/api/token', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: params.toString(),
  });

  if (!response.ok) {
    throw new Error(`Spotify token exchange failed: ${response.status}`);
  }

  const data = await response.json();
  const expiryTime = Date.now() + Number(data.expires_in || 3600) * 1000;

  localStorage.setItem('params', JSON.stringify(data));
  localStorage.setItem('expiry_time', String(expiryTime));
  clearStoredCodeVerifier();

  return data;
};

// returns hash parameters as json
export const getHashParams = (url) => {
  return url
    .slice(1)
    .split('&')
    .reduce((prev, curr) => {
      const [title, value] = curr.split('=');
      prev[title] = value;
      return prev;
    }, {});

  /*
  looks something like this: 
    {
    access_token: "BQA0pkL-LfNot7lb6d4evN4mYDgnlobcrLwS3LZNoZ8CwuiHlpjwLFEJnqclbCxs1AIDwx8T3I4oYhWlxhbajYGQdlYqouKjj7iugN3tpCx90doJTsMfpq4roSffnZ6j9Y0DEgiD96SSjTJ5YtlzD20yH7n8fHtciJfK",
    expires_in: "3600",
    state: "WzaO7990tckXSs9z",
    token_type: "Bearer"
    }
  */
};

export const getAuthCallbackParams = (rawLocation) => {
  if (!rawLocation) {
    return {};
  }

  const trimmed = rawLocation.trim();
  if (!trimmed) {
    return {};
  }

  const search = trimmed.startsWith('?') || trimmed.startsWith('#') ? trimmed.slice(1) : trimmed;
  const params = new URLSearchParams(search);

  return Object.fromEntries(params.entries());
};

export const isValidSession = () => {
  const currentTime = new Date().getTime();

  try {
    const expiryTime = Number(localStorage.getItem('expiry_time'));
    return !Number.isNaN(expiryTime) && currentTime < expiryTime;
  } catch (e) {
    console.log('couldnt get localstorage');
    return false;
  }
};

export const rgbToHex = (r, g, b) => {
  return '#' + componentToHex(r) + componentToHex(g) + componentToHex(b);
};

const componentToHex = (c) => {
  var hex = c.toString(16);
  return hex.length === 1 ? '0' + hex : hex;
};

