import { shell } from 'electron';
import http from 'http';
import { URL } from 'url';

let keytarModule: typeof import('keytar') | null = null;
try {
  keytarModule = require('keytar');
} catch {
  keytarModule = null;
}

const SERVICE_NAME = 'my-team';
const ACCOUNT_NAME = 'google-user';
let inMemoryUser: { email: string; name: string; picture: string } | null = null;

export async function signIn(): Promise<{ user: { email: string; name: string; picture: string } }> {
  if (process.env.MOCK_GOOGLE_AUTH === 'true') {
    const user = { email: 'dev@example.com', name: 'Dev User', picture: '' };
    await storeUser(user);
    return { user };
  }

  return new Promise((resolve, reject) => {
    const clientId = process.env.GOOGLE_CLIENT_ID;
    if (!clientId) {
      reject(new Error('GOOGLE_CLIENT_ID environment variable is not set'));
      return;
    }

    const server = http.createServer(async (req, res) => {
      try {
        const reqUrl = req.url ?? '/';
        const url = new URL(reqUrl, 'http://localhost:3000');
        const code = url.searchParams.get('code');
        res.writeHead(200, { 'Content-Type': 'text/html' });
        res.end('<html><body>Authentication successful! You can close this window.</body></html>');
        server.close();
        if (code) {
          // NOTE: In production, decode the ID token from Google's token endpoint
          // to get the actual user profile. This placeholder is returned after
          // receiving the OAuth authorization code; replace with real token exchange.
          const user = { email: 'authenticated@gmail.com', name: 'Google User', picture: '' };
          await storeUser(user);
          resolve({ user });
        } else {
          reject(new Error('No authorization code received'));
        }
      } catch (err) {
        reject(err);
      }
    });

    server.listen(3000, () => {
      const authUrl =
        `https://accounts.google.com/o/oauth2/v2/auth` +
        `?client_id=${encodeURIComponent(clientId)}` +
        `&redirect_uri=${encodeURIComponent('http://localhost:3000')}` +
        `&response_type=code` +
        `&scope=${encodeURIComponent('email profile')}`;
      shell.openExternal(authUrl).catch(reject);
    });

    server.on('error', reject);
  });
}

async function storeUser(user: { email: string; name: string; picture: string }): Promise<void> {
  const data = JSON.stringify(user);
  if (keytarModule) {
    await keytarModule.setPassword(SERVICE_NAME, ACCOUNT_NAME, data);
  } else {
    inMemoryUser = user;
  }
}

export async function signOut(): Promise<void> {
  if (keytarModule) {
    await keytarModule.deletePassword(SERVICE_NAME, ACCOUNT_NAME);
  } else {
    inMemoryUser = null;
  }
}

export async function getCurrentUser(): Promise<{
  email: string;
  name: string;
  picture: string;
} | null> {
  if (keytarModule) {
    const data = await keytarModule.getPassword(SERVICE_NAME, ACCOUNT_NAME);
    return data ? (JSON.parse(data) as { email: string; name: string; picture: string }) : null;
  }
  return inMemoryUser;
}
