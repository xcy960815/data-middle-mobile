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

/**
 * 用 SM2 公钥加密明文密码（C1C3C2 模式），供登录与注册接口提交。
 *
 * @param {string} publicKey - DMS 下发的 SM2 公钥，支持带或不带 04 前缀。
 * @param {string} password - 明文密码。
 * @returns {string} 以 04 前缀开头的密文十六进制串。
 * @throws {Error} 公钥长度或十六进制格式非法时抛出。
 */
export function encryptLoginPassword(publicKey: string, password: string): string {
  const cipherText = sm2.doEncrypt(password, normalizeSm2PublicKey(publicKey), CIPHER_MODE_C1C3C2);
  return `04${cipherText}`;
}

/**
 * 将任意载荷 JSON 序列化后整体 SM2 加密（C1C3C2 模式），用于加密请求体：调用方把返回值
 * 作为 `encryptedPayload` 字段提交给 DMS 加密接口。
 *
 * @param {string} publicKey - DMS 下发的 SM2 公钥，支持带或不带 04 前缀。
 * @param {T} payload - 任意可 JSON 序列化的请求载荷。
 * @returns {string} 以 04 前缀开头的密文十六进制串。
 * @throws {Error} 公钥长度或十六进制格式非法时抛出。
 */
export function encryptSm2Payload<T>(publicKey: string, payload: T): string {
  const cipherText = sm2.doEncrypt(
    JSON.stringify(payload),
    normalizeSm2PublicKey(publicKey),
    CIPHER_MODE_C1C3C2,
  );
  return `04${cipherText}`;
}
