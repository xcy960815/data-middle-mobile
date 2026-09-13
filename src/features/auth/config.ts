/**
 * 认证模块环境配置缺失或非法时抛出的错误类型，供调用方与请求类错误区分处理
 * （如 AuthProvider 将其视为未登录信号）。
 */
export class AuthConfigurationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'AuthConfigurationError';
  }
}

/**
 * 读取公开环境变量 EXPO_PUBLIC_DMS_API_URL 并规范化：去除首尾空白与结尾斜杠。
 *
 * @returns {string} 规范化后的 DMS API 基础地址。
 * @throws {AuthConfigurationError} 未配置或地址不以 http:// / https:// 开头时抛出。
 */
export function getDmsApiUrl(): string {
  const apiUrl = String(process.env.EXPO_PUBLIC_DMS_API_URL || '')
    .trim()
    .replace(/\/+$/, '');

  if (!apiUrl) {
    throw new AuthConfigurationError('未配置 DMS API 地址，请检查 EXPO_PUBLIC_DMS_API_URL。');
  }

  if (!/^https?:\/\//i.test(apiUrl)) {
    throw new AuthConfigurationError('DMS API 地址必须以 http:// 或 https:// 开头。');
  }

  return apiUrl;
}

/**
 * 读取公开环境变量 EXPO_PUBLIC_DMS_SM2_PUBLIC_KEY，并去除其中的全部空白字符。
 *
 * @returns {string} 去除空白后的 SM2 公钥字符串，格式校验由 sm2 加密函数负责。
 * @throws {AuthConfigurationError} 未配置时抛出。
 */
export function getDmsSm2PublicKey(): string {
  const sm2PublicKey = String(process.env.EXPO_PUBLIC_DMS_SM2_PUBLIC_KEY || '')
    .trim()
    .replace(/\s+/g, '');

  if (!sm2PublicKey) {
    throw new AuthConfigurationError(
      '未配置 DMS SM2 公钥，请检查 EXPO_PUBLIC_DMS_SM2_PUBLIC_KEY。',
    );
  }

  return sm2PublicKey;
}
