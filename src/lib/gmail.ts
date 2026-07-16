import { initializeApp } from 'firebase/app';
import { getAuth, signInWithPopup, GoogleAuthProvider, onAuthStateChanged, User } from 'firebase/auth';
import firebaseConfig from '../../firebase-applet-config.json';

// Initialize Firebase App
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

// Google Auth Provider setup with required Gmail scopes
const provider = new GoogleAuthProvider();
provider.addScope('https://mail.google.com/');
provider.addScope('https://www.googleapis.com/auth/gmail.send');
provider.addScope('https://www.googleapis.com/auth/gmail.readonly');
provider.addScope('https://www.googleapis.com/auth/gmail.compose');

// Keep auth states in-memory
let isSigningIn = false;
let cachedAccessToken: string | null = null;

// Initialize auth state listener
export const initAuth = (
  onAuthSuccess?: (user: User, token: string) => void,
  onAuthFailure?: () => void
) => {
  return onAuthStateChanged(auth, async (user: User | null) => {
    if (user) {
      if (cachedAccessToken) {
        if (onAuthSuccess) onAuthSuccess(user, cachedAccessToken);
      } else if (!isSigningIn) {
        // Try to fetch token if already signed in, but popup token is safer
        // Clear token cache if not fully loaded
        cachedAccessToken = null;
        if (onAuthFailure) onAuthFailure();
      }
    } else {
      cachedAccessToken = null;
      if (onAuthFailure) onAuthFailure();
    }
  });
};

// Google Sign-In with popup
export const googleSignIn = async (): Promise<{ user: User; accessToken: string } | null> => {
  try {
    isSigningIn = true;
    const result = await signInWithPopup(auth, provider);
    const credential = GoogleAuthProvider.credentialFromResult(result);
    if (!credential?.accessToken) {
      throw new Error('Failed to get access token from Google Auth');
    }

    cachedAccessToken = credential.accessToken;
    return { user: result.user, accessToken: cachedAccessToken };
  } catch (error: any) {
    console.error('Google login error:', error);
    throw error;
  } finally {
    isSigningIn = false;
  }
};

export const getAccessToken = async (): Promise<string | null> => {
  return cachedAccessToken;
};

export const logout = async () => {
  await auth.signOut();
  cachedAccessToken = null;
};

// Gmail Interface Definitions
export interface GmailMessage {
  id: string;
  threadId: string;
  subject?: string;
  from?: string;
  to?: string;
  date?: string;
  snippet?: string;
  body?: string;
  isSent?: boolean;
}

// Fetch list of Gmail messages (Inbound and Outbound)
export const fetchGmailMessages = async (
  accessToken: string,
  query: string = '',
  maxResults: number = 15
): Promise<GmailMessage[]> => {
  try {
    const url = new URL('https://gmail.googleapis.com/gmail/v1/users/me/messages');
    url.searchParams.set('maxResults', maxResults.toString());
    if (query) {
      url.searchParams.set('q', query);
    }

    const response = await fetch(url.toString(), {
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const errorMsg = await response.text();
      throw new Error(`Gmail API messages fetch failed: ${errorMsg}`);
    }

    const data = await response.json();
    if (!data.messages || data.messages.length === 0) {
      return [];
    }

    // Fetch details for each message (in parallel)
    const detailedMessages = await Promise.all(
      data.messages.map(async (msg: { id: string }) => {
        try {
          return await fetchGmailMessageDetail(accessToken, msg.id);
        } catch (e) {
          console.error(`Failed to fetch details for message ${msg.id}`, e);
          return {
            id: msg.id,
            threadId: '',
            snippet: 'Error loading preview...',
          } as GmailMessage;
        }
      })
    );

    return detailedMessages;
  } catch (error) {
    console.error('fetchGmailMessages error:', error);
    throw error;
  }
};

// Fetch individual message details with headers parsed
export const fetchGmailMessageDetail = async (
  accessToken: string,
  messageId: string
): Promise<GmailMessage> => {
  const url = `https://gmail.googleapis.com/gmail/v1/users/me/messages/${messageId}?format=full`;
  const response = await fetch(url, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch message detail ${messageId}`);
  }

  const data = await response.json();
  const headers = data.payload?.headers || [];

  const getHeader = (name: string) => {
    const found = headers.find((h: any) => h.name.toLowerCase() === name.toLowerCase());
    return found ? found.value : '';
  };

  const subject = getHeader('Subject');
  const from = getHeader('From');
  const to = getHeader('To');
  const date = getHeader('Date');
  const snippet = data.snippet || '';

  // Parse body content if available
  let body = '';
  if (data.payload) {
    body = parseMessageBody(data.payload);
  }

  // Determine if sent by self
  const labelIds = data.labelIds || [];
  const isSent = labelIds.includes('SENT');

  return {
    id: data.id,
    threadId: data.threadId,
    subject,
    from,
    to,
    date,
    snippet,
    body: body || snippet,
    isSent,
  };
};

// Helper to recursively parse MIME parts for HTML or plain text bodies
const parseMessageBody = (payload: any): string => {
  if (!payload) return '';
  
  // Case 1: Body is directly in the payload
  if (payload.body && payload.body.data) {
    return decodeBase64(payload.body.data);
  }

  // Case 2: Body is in parts
  if (payload.parts) {
    // Try to find html part first
    const htmlPart = findPartByMimeType(payload.parts, 'text/html');
    if (htmlPart && htmlPart.body && htmlPart.body.data) {
      return decodeBase64(htmlPart.body.data);
    }

    // Fallback to plain text
    const textPart = findPartByMimeType(payload.parts, 'text/plain');
    if (textPart && textPart.body && textPart.body.data) {
      return decodeBase64(textPart.body.data);
    }
  }

  return '';
};

const findPartByMimeType = (parts: any[], mimeType: string): any => {
  for (const part of parts) {
    if (part.mimeType === mimeType) {
      return part;
    }
    if (part.parts) {
      const found = findPartByMimeType(part.parts, mimeType);
      if (found) return found;
    }
  }
  return null;
};

// Safe base64 decoding for URL-safe base64 strings
const decodeBase64 = (data: string): string => {
  try {
    const base64 = data.replace(/-/g, '+').replace(/_/g, '/');
    return decodeURIComponent(
      atob(base64)
        .split('')
        .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    );
  } catch (e) {
    try {
      return atob(data.replace(/-/g, '+').replace(/_/g, '/'));
    } catch (err) {
      return 'Body parsing failed...';
    }
  }
};

// Send an email using Gmail send API (MIME formatted)
export const sendGmailMessage = async (
  accessToken: string,
  to: string,
  subject: string,
  bodyHtml: string
): Promise<{ id: string; threadId: string }> => {
  try {
    const cleanTo = to.trim();
    const cleanSubject = subject.trim();

    const mimeMessage = [
      `To: ${cleanTo}`,
      'Content-Type: text/html; charset=utf-8',
      'MIME-Version: 1.0',
      `Subject: ${cleanSubject}`,
      '',
      bodyHtml,
    ].join('\r\n');

    // base64url encode RFC 4648
    const encodedMime = btoa(unescape(encodeURIComponent(mimeMessage)))
      .replace(/\+/g, '-')
      .replace(/\//g, '_')
      .replace(/=+$/, '');

    const response = await fetch('https://gmail.googleapis.com/gmail/v1/users/me/messages/send', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        raw: encodedMime,
      }),
    });

    if (!response.ok) {
      const errMsg = await response.text();
      throw new Error(`Gmail Send API failed: ${errMsg}`);
    }

    return await response.json();
  } catch (err) {
    console.error('sendGmailMessage error:', err);
    throw err;
  }
};
