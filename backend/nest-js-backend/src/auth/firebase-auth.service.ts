import { Injectable } from '@nestjs/common';
import { applicationDefault, getApps, initializeApp } from 'firebase-admin/app';
import { getAuth, type DecodedIdToken } from 'firebase-admin/auth';

/** Verifies Firebase Authentication ID tokens using the Admin SDK. */
@Injectable()
export class FirebaseAuthService {
  /** Returns the verified Firebase claims or rejects invalid and expired tokens. */
  async verifyIdToken(token: string): Promise<DecodedIdToken> {
    // Application Default Credentials use the attached Cloud Run service identity
    // in production, so no downloadable service-account key is required.
    const app =
      getApps()[0] ??
      initializeApp({
        credential: applicationDefault(),
        projectId:
          process.env.GOOGLE_CLOUD_PROJECT ||
          process.env.GCLOUD_PROJECT ||
          process.env.VITE_PROJECT_ID ||
          'getaway-hub',
      });

    return getAuth(app).verifyIdToken(token);
  }
}
