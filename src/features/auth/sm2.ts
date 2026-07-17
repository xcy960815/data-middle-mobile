import { sm2 } from 'sm-crypto';

const CIPHER_MODE_C1C3C2 = 1;
const RAW_PUBLIC_KEY_LENGTH = 128;
const PREFIXED_PUBLIC_KEY_LENGTH = 130;
const HEX_PATTERN = /^[0-9a-fA-F]+$/;

function normalizeSm2PublicKey(publicKey: string): string {
  const normalizedPublicKey = publicKey.trim().replace(/\s+/g, '');
  const rawPublicKey =
    normalizedPublicKey.startsWith('04') &&
    normalizedPublicKey.length === PREFIXED_PUBLIC_KEY_LENGTH
      ? normalizedPublicKey.slice(2)
      : normalizedPublicKey;

  if (rawPublicKey.length !== RAW_PUBLIC_KEY_LENGTH || !HEX_PATTERN.test(rawPublicKey)) {
    throw new Error('DMS SM2 公钥格式不正确，请检查移动端环境配置。');
  }

  return `04${rawPublicKey}`;
}

export function encryptLoginPassword(publicKey: string, password: string): string {
  const cipherText = sm2.doEncrypt(password, normalizeSm2PublicKey(publicKey), CIPHER_MODE_C1C3C2);
  return `04${cipherText}`;
}
