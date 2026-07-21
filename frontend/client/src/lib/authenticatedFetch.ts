import { auth } from '@/lib/firebase';

export class AuthenticationRequiredError extends Error {
  constructor() {
    super('Please sign in to use this feature.');
    this.name = 'AuthenticationRequiredError';
  }
}

/** Sends an API request with the current Firebase user's ID token. */
async function requestWithToken(
  input: RequestInfo | URL,
  init: RequestInit,
  forceRefresh: boolean,
) {
  const user = auth.currentUser;
  if (!user) throw new AuthenticationRequiredError();

  const token = await user.getIdToken(forceRefresh);
  const headers = new Headers(init.headers);
  headers.set('Authorization', `Bearer ${token}`);

  return fetch(input, { ...init, headers });
}

/**
 * Fetches a protected API route and retries once with a refreshed token when
 * the server reports that the cached token is no longer valid.
 */
export async function authenticatedFetch(
  input: RequestInfo | URL,
  init: RequestInit = {},
) {
  let response = await requestWithToken(input, init, false);

  if (response.status === 401) {
    response = await requestWithToken(input, init, true);
  }

  return response;
}
