import { initializeApp, getApps, cert } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';
import firebaseConfig from '../../firebase-applet-config.json';

if (!getApps().length) {
  const serviceAccountJson = process.env.FIREBASE_SERVICE_ACCOUNT_KEY;

  if (serviceAccountJson) {
    // Vercel / non-Google environments: use a service account key stored in an env var
    initializeApp({
      credential: cert(JSON.parse(serviceAccountJson)),
      projectId: firebaseConfig.projectId,
    });
  } else {
    // Google Cloud environments (e.g. Cloud Run): Application Default Credentials
    initializeApp({
      projectId: firebaseConfig.projectId,
    });
  }
}

export const adminAuth = getAuth();
