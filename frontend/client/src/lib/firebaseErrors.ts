import { FirebaseError } from "firebase/app";

const ERROR_MESSAGES: Record<string, string> = {
  "auth/invalid-email": "Please enter a valid email address.",
  "auth/user-disabled": "This account has been disabled.",
  "auth/user-not-found": "No account found with this email.",
  "auth/wrong-password": "Incorrect password. Please try again.",
  "auth/invalid-credential": "Invalid email or password. Please try again.",
  "auth/email-already-in-use": "An account with this email already exists.",
  "auth/weak-password": "Password must be at least 6 characters.",
  "auth/too-many-requests": "Too many attempts. Please try again later.",
  "auth/popup-closed-by-user": "Sign-in was cancelled.",
  "auth/account-exists-with-different-credential":
    "An account already exists with this email using a different sign-in method.",
  "auth/operation-not-allowed": "This sign-in method is not enabled.",
  "auth/network-request-failed": "Network error. Check your connection and try again.",
};

export function getFirebaseErrorMessage(error: unknown, fallback: string): string {
  if (error instanceof FirebaseError && ERROR_MESSAGES[error.code]) {
    return ERROR_MESSAGES[error.code];
  }
  if (error instanceof Error && error.message) {
    return error.message;
  }
  return fallback;
}
