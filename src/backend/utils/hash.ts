/**
 * 密码哈希工具
 * 使用Web Crypto API实现PBKDF2密码哈希
 */

const ITERATIONS = 100000;
const KEY_LENGTH = 32;
const SALT_LENGTH = 16;

/**
 * 生成随机盐
 */
function generateSalt(): Uint8Array {
    return crypto.getRandomValues(new Uint8Array(SALT_LENGTH));
}

/**
 * 将Uint8Array转换为十六进制字符串
 */
function toHex(buffer: Uint8Array): string {
    return Array.from(buffer)
        .map(b => b.toString(16).padStart(2, '0'))
        .join('');
}

/**
 * 将十六进制字符串转换为Uint8Array
 */
function fromHex(hex: string): Uint8Array {
    const bytes = new Uint8Array(hex.length / 2);
    for (let i = 0; i < hex.length; i += 2) {
        bytes[i / 2] = parseInt(hex.substring(i, i + 2), 16);
    }
    return bytes;
}

/**
 * 使用PBKDF2派生密钥
 */
async function deriveKey(
    password: string,
    salt: Uint8Array
): Promise<Uint8Array> {
    const encoder = new TextEncoder();
    const passwordBuffer = encoder.encode(password);

    const keyMaterial = await crypto.subtle.importKey(
        'raw',
        passwordBuffer,
        'PBKDF2',
        false,
        ['deriveBits']
    );

    const derivedBits = await crypto.subtle.deriveBits(
        {
            name: 'PBKDF2',
            salt: salt as any,
            iterations: ITERATIONS,
            hash: 'SHA-256',
        },
        keyMaterial,
        KEY_LENGTH * 8
    );

    return new Uint8Array(derivedBits);
}

/**
 * 哈希密码
 * 返回格式: salt$hash (都是十六进制字符串)
 */
export async function hashPassword(password: string): Promise<string> {
    const salt = generateSalt();
    const hash = await deriveKey(password, salt);
    return `${toHex(salt)}$${toHex(hash)}`;
}

/**
 * 验证密码
 */
export async function verifyPassword(
    password: string,
    hashedPassword: string
): Promise<boolean> {
    try {
        const [saltHex, hashHex] = hashedPassword.split('$');
        if (!saltHex || !hashHex) {
            return false;
        }

        const salt = fromHex(saltHex);
        const expectedHash = fromHex(hashHex);
        const actualHash = await deriveKey(password, salt);

        // 使用constant-time比较防止时序攻击
        if (expectedHash.length !== actualHash.length) {
            return false;
        }

        let result = 0;
        for (let i = 0; i < expectedHash.length; i++) {
            result |= expectedHash[i] ^ actualHash[i];
        }

        return result === 0;
    } catch (error) {
        console.error('Password verification error:', error);
        return false;
    }
}
