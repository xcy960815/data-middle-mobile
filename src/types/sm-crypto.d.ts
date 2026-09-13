declare module 'sm-crypto' {
  /** SM2 国密非对称加解密工具集；本声明仅覆盖项目实际用到的加密入口。 */
  export const sm2: {
    /**
     * 用 SM2 公钥把明文加密为密文十六进制串。
     *
     * @param {string} message - 待加密明文（如密码或 JSON 序列化后的请求载荷）。
     * @param {string} publicKey - SM2 公钥十六进制串，项目传入带 04 前缀的非压缩公钥。
     * @param {number} [cipherMode=1] - 密文排列模式：1 为 C1C3C2（缺省）、0 为 C1C2C3，
     *   项目固定按 C1C3C2（1）使用。
     * @returns {string} 密文十六进制串；不含非压缩点的 04 前缀，由调用方自行拼接。
     */
    doEncrypt(message: string, publicKey: string, cipherMode?: number): string;
  };
}
