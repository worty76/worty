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
        try {
          // reuse the single shared Firebase app — a second initializeApp
          // with a diverging config throws duplicate-app
          const { firebaseApp } = await import("@/firebase/config");
          const authInstance = getAuth(firebaseApp);
          setAuth(authInstance);

          const unsubscribe = onAuthStateChanged(authInstance, (user) => {
            setUser(user);
            // tag your own visits in Analytics so they're filterable
            if (user?.uid) {
              import("@/firebase/analytics").then((m) => m.identifyAdmin(user.uid));
            }
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
