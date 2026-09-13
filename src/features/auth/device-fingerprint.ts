import * as Crypto from 'expo-crypto';
import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';

const INSTALLATION_ID_KEY = 'dms-mobile-installation-id';
const FINGERPRINT_PREFIX = 'dms-mobile-installation';

let fingerprintPromise: Promise<string> | null = null;

async function readInstallationId(): Promise<string | null> {
  if (Platform.OS === 'web') {
    return typeof window === 'undefined' ? null : window.localStorage.getItem(INSTALLATION_ID_KEY);
  }

  return SecureStore.getItemAsync(INSTALLATION_ID_KEY);
}

async function writeInstallationId(installationId: string): Promise<void> {
  if (Platform.OS === 'web') {
    if (typeof window !== 'undefined') {
      window.localStorage.setItem(INSTALLATION_ID_KEY, installationId);
    }
    return;
  }

  await SecureStore.setItemAsync(INSTALLATION_ID_KEY, installationId);
}

async function getOrCreateInstallationId(): Promise<string> {
  const existingInstallationId = await readInstallationId();
  if (existingInstallationId) {
    return existingInstallationId;
  }

  const installationId = Crypto.randomUUID();
  await writeInstallationId(installationId);
  return installationId;
}

async function createDeviceFingerprint(): Promise<string> {
  const installationId = await getOrCreateInstallationId();
  const fingerprint = await Crypto.digestStringAsync(
    Crypto.CryptoDigestAlgorithm.SHA256,
    `${FINGERPRINT_PREFIX}:${installationId}`,
  );

  if (!/^[a-f0-9]{64}$/.test(fingerprint)) {
    throw new Error('移动端设备指纹生成失败。');
  }

  return fingerprint;
}

/**
 * 获取设备指纹：对安装级 UUID 计算 SHA-256，得到 64 位十六进制串，作为请求头绑定设备；
 * UUID 通过 SecureStore（原生）或 localStorage（Web）持久化，缺失时自动生成。
 *
 * 结果 Promise 在模块内缓存复用，并发调用共享同一次生成；生成失败时清空缓存，下次调用重试。
 *
 * @returns {Promise<string>} 64 位十六进制设备指纹；生成失败时以普通 Error 拒绝。
 */
export function getDeviceFingerprint(): Promise<string> {
  if (!fingerprintPromise) {
    fingerprintPromise = createDeviceFingerprint().catch((error) => {
      fingerprintPromise = null;
      throw error;
    });
  }

  return fingerprintPromise;
}
