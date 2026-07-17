declare module '*.css';

declare namespace NodeJS {
  interface ProcessEnv {
    EXPO_PUBLIC_DMS_API_URL?: string;
    EXPO_PUBLIC_DMS_SM2_PUBLIC_KEY?: string;
  }
}
