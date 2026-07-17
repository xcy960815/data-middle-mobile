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

export function getDeviceFingerprint(): Promise<string> {
  if (!fingerprintPromise) {
    fingerprintPromise = createDeviceFingerprint().catch((error) => {
      fingerprintPromise = null;
      throw error;
    });
  }

  return fingerprintPromise;
}
