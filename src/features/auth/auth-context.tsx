import {
  createContext,
  type PropsWithChildren,
  use,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';

import { AuthConfigurationError } from './config';
import { getCurrentUser, loginWithDms, logoutFromDms } from './auth-api';
import { DmsApiError } from './api-client';
import type { AuthUser, LoginCredentials } from './types';

type AuthStatus = 'loading' | 'authenticated' | 'unauthenticated';

type AuthContextValue = {
  status: AuthStatus;
  user: AuthUser | null;
  login: (credentials: LoginCredentials) => Promise<AuthUser>;
  logout: () => Promise<void>;
  refresh: () => Promise<AuthUser | null>;
};

const AuthContext = createContext<AuthContextValue | null>(null);

function isUnauthenticatedError(error: unknown): boolean {
  return (
    error instanceof AuthConfigurationError ||
    (error instanceof DmsApiError && (error.status === 401 || error.code === 401))
  );
}

export function AuthProvider({ children }: PropsWithChildren) {
  const [status, setStatus] = useState<AuthStatus>('loading');
  const [user, setUser] = useState<AuthUser | null>(null);
  const operationVersion = useRef(0);

  const refresh = useCallback(async (): Promise<AuthUser | null> => {
    const currentOperation = ++operationVersion.current;
    try {
      const currentUser = await getCurrentUser();
      if (currentOperation === operationVersion.current) {
        setUser(currentUser);
        setStatus('authenticated');
      }
      return currentUser;
    } catch (error) {
      if (currentOperation === operationVersion.current) {
        setUser(null);
        setStatus('unauthenticated');
      }
      if (isUnauthenticatedError(error)) {
        return null;
      }
      throw error;
    }
  }, []);

  useEffect(() => {
    const currentOperation = ++operationVersion.current;

    void getCurrentUser().then(
      (currentUser) => {
        if (currentOperation === operationVersion.current) {
          setUser(currentUser);
          setStatus('authenticated');
        }
      },
      () => {
        if (currentOperation === operationVersion.current) {
          setUser(null);
          setStatus('unauthenticated');
        }
      },
    );
  }, []);

  const login = useCallback(async (credentials: LoginCredentials): Promise<AuthUser> => {
    const currentOperation = ++operationVersion.current;
    const currentUser = await loginWithDms(credentials);
    if (currentOperation === operationVersion.current) {
      setUser(currentUser);
      setStatus('authenticated');
    }
    return currentUser;
  }, []);

  const logout = useCallback(async (): Promise<void> => {
    const currentOperation = ++operationVersion.current;
    try {
      await logoutFromDms();
    } finally {
      if (currentOperation === operationVersion.current) {
        setUser(null);
        setStatus('unauthenticated');
      }
    }
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({ status, user, login, logout, refresh }),
    [status, user, login, logout, refresh],
  );

  return <AuthContext value={value}>{children}</AuthContext>;
}

export function useAuth(): AuthContextValue {
  const value = use(AuthContext);
  if (!value) {
    throw new Error('useAuth 必须在 AuthProvider 内使用。');
  }
  return value;
}
