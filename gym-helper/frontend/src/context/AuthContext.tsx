import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import { authApi } from '../api/authApi';
import type { AuthUser } from '../store/types';

type LoginPayload = {
  email: string;
  password: string;
};

type RegisterPayload = {
  name: string;
  email: string;
  password: string;
};

type AuthContextValue = {
  user: AuthUser | null;
  isLoading: boolean;
  login: (payload: LoginPayload) => Promise<void>;
  register: (payload: RegisterPayload) => Promise<void>;
  logout: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;

    const loadSession = async () => {
      try {
        const nextUser = await authApi.getCurrentUser();
        if (isMounted) {
          setUser(nextUser);
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    void loadSession();

    return () => {
      isMounted = false;
    };
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      isLoading,
      login: async (payload) => {
        const nextUser = await authApi.login(payload);
        setUser(nextUser);
      },
      register: async (payload) => {
        const nextUser = await authApi.register(payload);
        setUser(nextUser);
      },
      logout: async () => {
        await authApi.logout();
        setUser(null);
      },
    }),
    [isLoading, user]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error('useAuth нужно использовать внутри AuthProvider.');
  }

  return context;
}
