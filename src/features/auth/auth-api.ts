import { getDmsSm2PublicKey } from './config';
import { dmsRequest, DmsApiError, isUnauthorizedDmsError } from './api-client';
import { encryptLoginPassword } from './sm2';
import type {
  AuthUser,
  LoginCredentials,
  LoginResponse,
  RegisterCredentials,
  RegisterResponse,
} from './types';

/**
 * 拉取当前登录用户信息（GET /api/auth/user-info），依赖 HttpOnly Cookie 会话。
 *
 * @returns {Promise<AuthUser>} 当前登录用户。
 * @throws {DmsApiError} 未登录或会话失效（401）以及其他请求失败时抛出。
 */
export async function getCurrentUser(): Promise<AuthUser> {
  return dmsRequest<AuthUser>('/api/auth/user-info');
}

/**
 * 使用 SM2 加密密码登录 DMS 并建立 Cookie 会话，成功后立即拉取当前用户信息返回。
 *
 * 登录成功但拉取用户信息时若会话未保持（典型于 Expo Go 访问 HTTP 接口时 Cookie 无法
 * 写入），会先调用登出清理服务端会话，再抛出带环境提示的 DmsApiError。
 *
 * @param {LoginCredentials} credentials - 登录凭据；userName 提交前去除首尾空白，password 经 SM2 加密。
 * @returns {Promise<AuthUser>} 登录成功后的当前用户信息。
 * @throws {DmsApiError} 登录接口失败、登录后拉取用户信息失败或会话 Cookie 未保持时抛出。
 */
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
    if (isUnauthorizedDmsError(error)) {
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

/**
 * 请求 DMS 登出接口（POST /api/auth/logout）销毁服务端会话。
 *
 * @returns {Promise<void>} 登出完成后 resolve。
 * @throws {DmsApiError} 登出接口请求失败时抛出。
 */
export async function logoutFromDms(): Promise<void> {
  await dmsRequest<null>('/api/auth/logout', { method: 'POST' });
}

/**
 * 注册成功不建立会话，由用户自行登录。
 *
 * password 与 confirmPassword 分别经 SM2 加密后提交；email 与 mobile 仅在非空时携带。
 *
 * @param {RegisterCredentials} credentials - 注册凭据。
 * @returns {Promise<void>} 注册成功后 resolve，不返回数据或会话。
 * @throws {DmsApiError} 注册接口返回非 200 业务码或请求失败时抛出。
 */
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
