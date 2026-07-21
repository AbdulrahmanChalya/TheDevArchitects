import { ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import type { DecodedIdToken } from 'firebase-admin/auth';
import {
  FirebaseAuthGuard,
  type AuthenticatedRequest,
} from './firebase-auth.guard';
import type { FirebaseAuthService } from './firebase-auth.service';

jest.mock('./firebase-auth.service', () => ({
  FirebaseAuthService: class FirebaseAuthService {},
}));

describe('FirebaseAuthGuard', () => {
  const reflector = {
    getAllAndOverride: jest.fn(),
  } as unknown as Reflector;
  const verifyIdToken = jest.fn();
  const firebaseAuth = { verifyIdToken } as unknown as FirebaseAuthService;

  const createContext = (request: Partial<AuthenticatedRequest>) =>
    ({
      getHandler: () => () => undefined,
      getClass: () => class TestController {},
      switchToHttp: () => ({
        getRequest: () => request,
      }),
    }) as unknown as ExecutionContext;

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('allows routes marked public without a token', async () => {
    jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue(true);
    const guard = new FirebaseAuthGuard(reflector, firebaseAuth);

    await expect(
      guard.canActivate(createContext({ headers: {} })),
    ).resolves.toBe(true);
    expect(verifyIdToken).not.toHaveBeenCalled();
  });

  it('rejects protected routes without a bearer token', async () => {
    jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue(false);
    const guard = new FirebaseAuthGuard(reflector, firebaseAuth);

    await expect(
      guard.canActivate(createContext({ headers: {} })),
    ).rejects.toBeInstanceOf(UnauthorizedException);
  });

  it('verifies a bearer token and attaches the decoded user', async () => {
    jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue(false);
    const decodedUser = { uid: 'firebase-user-1' } as DecodedIdToken;
    verifyIdToken.mockResolvedValue(decodedUser);
    const request = {
      headers: { authorization: 'Bearer valid-token' },
    } as Partial<AuthenticatedRequest>;
    const guard = new FirebaseAuthGuard(reflector, firebaseAuth);

    await expect(guard.canActivate(createContext(request))).resolves.toBe(true);
    expect(verifyIdToken).toHaveBeenCalledWith('valid-token');
    expect(request.user).toBe(decodedUser);
  });

  it('rejects an invalid or expired token', async () => {
    jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue(false);
    verifyIdToken.mockRejectedValue(new Error('invalid token'));
    const guard = new FirebaseAuthGuard(reflector, firebaseAuth);

    await expect(
      guard.canActivate(
        createContext({ headers: { authorization: 'Bearer invalid-token' } }),
      ),
    ).rejects.toBeInstanceOf(UnauthorizedException);
  });
});
