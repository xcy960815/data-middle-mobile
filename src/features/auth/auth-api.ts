import { getDmsSm2PublicKey } from './config';
import { dmsRequest, DmsApiError } from './api-client';
import { encryptLoginPassword } from './sm2';
import type {
  AuthUser,
  LoginCredentials,
  LoginResponse,
  RegisterCredentials,
  RegisterResponse,
} from './types';

export async function getCurrentUser(): Promise<AuthUser> {
  return dmsRequest<AuthUser>('/api/auth/user-info');
}

export async function loginWithDms(credentials: LoginCredentials): Promise<AuthUser> {
  const sm2PublicKey = getDmsSm2PublicKey();

  await dmsRequest<LoginResponse>('/api/auth/login', {
    method: 'POST',
    body: JSON.stringify({
      userName: credentials.userName.trim(),
      password: encryptLoginPassword(sm2PublicKey, credentials.password),
    }),
  });

  try {
    return await getCurrentUser();
  } catch (error) {
    if (error instanceof DmsApiError && (error.status === 401 || error.code === 401)) {
      await logoutFromDms().catch(() => undefined);
      throw new DmsApiError(
        '账号验证成功，但 Expo Go 未能保持 DMS 会话 Cookie。请确认 API 使用 HTTPS，或调整 DMS 移动端认证方式。',
        error.status,
        error.code,
      );
    }
    throw error;
  }
}

export async function logoutFromDms(): Promise<void> {
  await dmsRequest<null>('/api/auth/logout', { method: 'POST' });
}

/** 注册成功不建立会话，由用户自行登录。 */
export async function registerWithDms(credentials: RegisterCredentials): Promise<void> {
  const sm2PublicKey = getDmsSm2PublicKey();
  await dmsRequest<RegisterResponse>('/api/auth/register', {
    method: 'POST',
    body: JSON.stringify({
      userName: credentials.userName,
      displayName: credentials.displayName,
      password: encryptLoginPassword(sm2PublicKey, credentials.password),
      confirmPassword: encryptLoginPassword(sm2PublicKey, credentials.confirmPassword),
      ...(credentials.email ? { email: credentials.email } : {}),
      ...(credentials.mobile ? { mobile: credentials.mobile } : {}),
    }),
  });
}
