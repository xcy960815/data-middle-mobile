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
import { isUnauthorizedDmsError } from './api-client';
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
  return error instanceof AuthConfigurationError || isUnauthorizedDmsError(error);
}

/**
 * 认证状态 Provider：挂载时拉取当前用户判定初始登录态，向子树提供 user、status 与
 * login/logout/refresh 操作。
 *
 * 各操作通过版本号做竞态防护，仅最新一次操作的结果会写入状态。refresh 在会话失效
 * （401）或认证配置缺失时把登录态置为 unauthenticated 并返回 null，其他错误原样抛出；
 * login 失败不改变现有登录态；logout 无论服务端登出是否成功都会清除本地登录态。
 *
 * @param {PropsWithChildren} props - 组件 props；children 为包裹在 Provider 内的子元素。
 */
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

/**
 * 读取全局认证状态与操作方法；必须在 AuthProvider 内使用，否则直接抛出 Error。
 *
 * @returns {AuthContextValue} 认证上下文：status（'loading' | 'authenticated' |
 *   'unauthenticated'）与 user 描述当前登录态；login/logout/refresh 的错误暴露规则见
 *   AuthProvider 说明。
 */
export function useAuth(): AuthContextValue {
  const value = use(AuthContext);
  if (!value) {
    throw new Error('useAuth 必须在 AuthProvider 内使用。');
  }
  return value;
}
