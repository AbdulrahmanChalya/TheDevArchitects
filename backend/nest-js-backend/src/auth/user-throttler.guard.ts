import { Injectable } from '@nestjs/common';
import { ThrottlerGuard } from '@nestjs/throttler';
import type { AuthenticatedRequest } from './firebase-auth.guard';

@Injectable()
export class UserThrottlerGuard extends ThrottlerGuard {
  protected getTracker(request: AuthenticatedRequest): Promise<string> {
    const tracker = request.user?.uid
      ? `user:${request.user.uid}`
      : `ip:${request.ip || request.socket.remoteAddress || 'unknown'}`;

    return Promise.resolve(tracker);
  }
}
