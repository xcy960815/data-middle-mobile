export class AuthConfigurationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'AuthConfigurationError';
  }
}

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
