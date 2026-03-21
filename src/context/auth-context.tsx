"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
} from "react";
import {
  User,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  getAuth,
} from "firebase/auth";
import { initializeApp } from "firebase/app";

interface AuthContextType {
  user: User | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  logOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [auth, setAuth] = useState<ReturnType<typeof getAuth> | null>(null);

  useEffect(() => {
    // Only initialize auth on client side
    const initAuth = async () => {
      if (typeof window !== "undefined") {
        const firebaseConfig = {
          apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
          authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
          projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
          storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
          messagingSenderId:
            process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
          appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
        };

        try {
          const { getAuth: _getAuth } = await import("firebase/auth");
          const app = initializeApp(firebaseConfig);
          const authInstance = _getAuth(app);
          setAuth(authInstance);

          const unsubscribe = onAuthStateChanged(authInstance, (user) => {
            setUser(user);
            setLoading(false);
          });

          return () => unsubscribe();
        } catch (error) {
          console.error("Error initializing auth:", error);
          setLoading(false);
        }
      } else {
        setLoading(false);
      }
    };

    const unsubscribePromise = initAuth();
  }, []);

  const signIn = async (email: string, password: string) => {
    if (!auth) throw new Error("Auth not initialized");
    await signInWithEmailAndPassword(auth, email, password);
  };

  const logOut = async () => {
    if (!auth) throw new Error("Auth not initialized");
    await signOut(auth);
  };

  return (
    <AuthContext.Provider value={{ user, loading, signIn, logOut }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
