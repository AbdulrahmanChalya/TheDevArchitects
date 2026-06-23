import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import {
  browserLocalPersistence,
  browserSessionPersistence,
  createUserWithEmailAndPassword,
  FacebookAuthProvider,
  GoogleAuthProvider,
  onAuthStateChanged,
  sendPasswordResetEmail,
  setPersistence,
  signInWithEmailAndPassword,
  signInWithPopup,
  signOut,
  updateProfile,
  type User,
} from "firebase/auth";
import { auth } from "@/lib/firebase";

interface AuthContextValue {
  user: User | null;
  loading: boolean;
  signInWithEmail: (email: string, password: string, rememberMe?: boolean) => Promise<void>;
  signUpWithEmail: (email: string, password: string, displayName: string) => Promise<void>;
  signInWithGoogle: () => Promise<void>;
  signInWithFacebook: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let settled = false;

    const finish = (currentUser: User | null) => {
      if (settled) return;
      settled = true;
      setUser(currentUser);
      setLoading(false);
    };

    const timeout = window.setTimeout(() => finish(null), 3000);

    const unsubscribe = onAuthStateChanged(
      auth,
      (currentUser) => {
        window.clearTimeout(timeout);
        finish(currentUser);
      },
      (error) => {
        console.error("Firebase auth state error:", error);
        window.clearTimeout(timeout);
        finish(null);
      },
    );

    return () => {
      settled = true;
      window.clearTimeout(timeout);
      unsubscribe();
    };
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      loading,

      async signInWithEmail(email, password, rememberMe = true) {
        await setPersistence(
          auth,
          rememberMe ? browserLocalPersistence : browserSessionPersistence,
        );
        await signInWithEmailAndPassword(auth, email, password);
      },

      async signUpWithEmail(email, password, displayName) {
        const credential = await createUserWithEmailAndPassword(auth, email, password);
        if (displayName.trim()) {
          await updateProfile(credential.user, { displayName: displayName.trim() });
        }
      },

      async signInWithGoogle() {
        await signInWithPopup(auth, new GoogleAuthProvider());
      },

      async signInWithFacebook() {
        await signInWithPopup(auth, new FacebookAuthProvider());
      },

      async resetPassword(email) {
        await sendPasswordResetEmail(auth, email);
      },

      async logout() {
        await signOut(auth);
      },
    }),
    [user],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
