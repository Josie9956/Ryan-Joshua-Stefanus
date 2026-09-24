import { initializeApp, getApps, getApp } from 'firebase/app';
import {
  getAuth,
  signInWithPopup,
  GoogleAuthProvider,
  onAuthStateChanged,
  User,
  signOut,
} from 'firebase/auth';
import firebaseConfig from '../../firebase-applet-config.json';
import { ReimbursementClaim } from '../types';
import { generateClaimsCSVContent } from './exportUtils';

// Initialize Firebase App safely without re-initializing
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();
export const auth = getAuth(app);

const SCOPES = ['https://www.googleapis.com/auth/drive.file'];

const provider = new GoogleAuthProvider();
provider.addScope('https://www.googleapis.com/auth/drive.file');

// In-memory access token cache (NEVER in localStorage/sessionStorage as required)
let cachedAccessToken: string | null = null;
let isSigningIn = false;

export const initAuth = (
  onAuthSuccess?: (user: User, token: string) => void,
  onAuthFailure?: () => void
) => {
  return onAuthStateChanged(auth, async (user: User | null) => {
    if (user && cachedAccessToken) {
      if (onAuthSuccess) onAuthSuccess(user, cachedAccessToken);
    } else {
      if (!isSigningIn) {
        cachedAccessToken = null;
        if (onAuthFailure) onAuthFailure();
      }
    }
  });
};

export const googleSignIn = async (): Promise<{ user: User; accessToken: string } | null> => {
  try {
    isSigningIn = true;
    const result = await signInWithPopup(auth, provider);
    const credential = GoogleAuthProvider.credentialFromResult(result);
    if (!credential?.accessToken) {
      throw new Error('Gagal memperoleh access token dari Google Provider');
    }
    cachedAccessToken = credential.accessToken;
    return { user: result.user, accessToken: cachedAccessToken };
  } catch (error) {
    console.error('Google Sign In Error:', error);
    throw error;
  } finally {
    isSigningIn = false;
  }
};

export const getAccessToken = async (): Promise<string | null> => {
  return cachedAccessToken;
};

export const logoutGoogle = async () => {
  await signOut(auth);
  cachedAccessToken = null;
};

export interface DriveUploadResult {
  fileId: string;
  name: string;
  webViewLink?: string;
}

/**
 * Uploads claims data report to Google Drive using multipart upload
 */
export const uploadClaimsToGoogleDrive = async (
  claims: ReimbursementClaim[],
  titleSuffix: string = 'Rekapitulasi'
): Promise<DriveUploadResult> => {
  const token = await getAccessToken();
  if (!token) {
    throw new Error('Belum terhubung ke Akun Google Drive. Silakan hubungkan akun Google terlebih dahulu.');
  }

  const dateStr = new Date().toISOString().slice(0, 10);
  const fileName = `ReimburseHub_${titleSuffix}_${dateStr}.csv`;
  const fileContent = generateClaimsCSVContent(claims);

  const metadata = {
    name: fileName,
    mimeType: 'text/csv',
    description: `Cadangan Rekapitulasi Data Reimbursement Kantor dibuat otomatis oleh ReimburseHub pada ${new Date().toLocaleString(
      'id-ID'
    )}`,
  };

  const boundary = '-------314159265358979323846';
  const delimiter = `\r\n--${boundary}\r\n`;
  const closeDelimiter = `\r\n--${boundary}--`;

  const multipartRequestBody =
    delimiter +
    'Content-Type: application/json; charset=UTF-8\r\n\r\n' +
    JSON.stringify(metadata) +
    delimiter +
    'Content-Type: text/csv; charset=UTF-8\r\n\r\n' +
    fileContent +
    closeDelimiter;

  const response = await fetch(
    'https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart&fields=id,name,webViewLink',
    {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': `multipart/related; boundary=${boundary}`,
      },
      body: multipartRequestBody,
    }
  );

  if (!response.ok) {
    const errorDetails = await response.text();
    console.error('Google Drive Upload Failed:', errorDetails);
    throw new Error(`Gagal mengunggah file ke Google Drive (${response.status})`);
  }

  const data = await response.json();
  return {
    fileId: data.id,
    name: data.name,
    webViewLink: data.webViewLink,
  };
};
