import { useState, useEffect, createContext, useContext } from 'react';
import { onAuthStateChanged, User, signInWithPopup, signOut } from 'firebase/auth';
import { auth, googleProvider } from '../config/firebase';
import { syncUserWithBackend } from '../services/api';

interface AuthContextType {
  user: User | null;
  dbUser: any;
  loading: boolean;
  login: () => Promise<any>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<any>;
  updateDbUser: (patch: Record<string, unknown>) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [dbUser, setDbUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const waitForCurrentUser = async (maxAttempts = 10, delayMs = 150): Promise<User | null> => {
    for (let i = 0; i < maxAttempts; i += 1) {
      if (auth.currentUser) {
        return auth.currentUser;
      }
      await new Promise((resolve) => setTimeout(resolve, delayMs));
    }
    return auth.currentUser;
  };

  const refreshUser = async () => {
    const currentUser = await waitForCurrentUser();
    if (!currentUser) {
      return null;
    }

    try {
      await currentUser.getIdToken(true);
      const syncedUser = await syncUserWithBackend();
      setDbUser(syncedUser);
      return syncedUser;
    } catch (error) {
      console.error('Failed to refresh user', error);
      throw error;
    }
  };

  const updateDbUser = (patch: Record<string, unknown>) => {
    setDbUser((previousUser: any) => {
      if (!previousUser) {
        return previousUser;
      }
      return { ...previousUser, ...patch };
    });
  };

  useEffect(() => {
    const startTime = Date.now();
    const MIN_LOADING_TIME = 2000; // 2 secondes de délai minimum

    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      try {
        setUser(firebaseUser);
        if (firebaseUser) {
          await refreshUser();
        } else {
          setDbUser(null);
        }
      } catch (error) {
        console.error('Auth state sync failed:', error);
        setDbUser(null);
      } finally {
        const elapsedTime = Date.now() - startTime;
        const remainingTime = Math.max(0, MIN_LOADING_TIME - elapsedTime);
        setTimeout(() => setLoading(false), remainingTime);
      }
    });

    return unsubscribe;
  }, []);

  const login = async () => {
    await signInWithPopup(auth, googleProvider);
    return refreshUser();
  };

  const logout = async () => {
    await signOut(auth);
  };

  return (
    <AuthContext.Provider value={{ user, dbUser, loading, login, logout, refreshUser, updateDbUser }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
