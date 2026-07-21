import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import type { DecodedIdToken } from 'firebase-admin/auth';
import type { Request } from 'express';
import { FirebaseAuthService } from './firebase-auth.service';
import { IS_PUBLIC_ROUTE } from './public.decorator';

export type AuthenticatedRequest = Request & {
  user?: DecodedIdToken;
};

/** Requires a valid Firebase bearer token unless a route is marked `@Public()`. */
@Injectable()
export class FirebaseAuthGuard implements CanActivate {
  constructor(
    private readonly reflector: Reflector,
    private readonly firebaseAuth: FirebaseAuthService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const isPublic = this.reflector.getAllAndOverride<boolean>(
      IS_PUBLIC_ROUTE,
      [context.getHandler(), context.getClass()],
    );
    if (isPublic) return true;

    const request = context.switchToHttp().getRequest<AuthenticatedRequest>();
    const authorization = request.headers.authorization;
    const match = authorization?.match(/^Bearer\s+(.+)$/i);

    if (!match?.[1]) {
      throw new UnauthorizedException('A Firebase ID token is required.');
    }

    try {
      // Store verified claims for downstream authorization and per-user throttling.
      request.user = await this.firebaseAuth.verifyIdToken(match[1]);
      return true;
    } catch {
      throw new UnauthorizedException(
        'The Firebase ID token is invalid or expired.',
      );
    }
  }
}
