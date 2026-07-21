import { Injectable } from '@nestjs/common';
import { applicationDefault, getApps, initializeApp } from 'firebase-admin/app';
import { getAuth, type DecodedIdToken } from 'firebase-admin/auth';

@Injectable()
export class FirebaseAuthService {
  async verifyIdToken(token: string): Promise<DecodedIdToken> {
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
