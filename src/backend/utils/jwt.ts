/**
 * JWT工具函数
 * 用于生成和验证JWT token
 */

export interface JWTPayload {
    userId: number;
    email: string;
    role: 'admin' | 'user';
    iat?: number;
    exp?: number;
}

const ALGORITHM = 'HS256';
const TOKEN_EXPIRY = 7 * 24 * 60 * 60; // 7天(秒)

/**
 * Base64 URL编码
 */
function base64UrlEncode(data: string): string {
    const base64 = btoa(data);
    return base64
        .replace(/\+/g, '-')
        .replace(/\//g, '_')
        .replace(/=/g, '');
}

/**
 * Base64 URL解码
 */
function base64UrlDecode(data: string): string {
    let base64 = data
        .replace(/-/g, '+')
        .replace(/_/g, '/');

    // 添加padding
    while (base64.length % 4) {
        base64 += '=';
    }

    return atob(base64);
}

/**
 * 使用HMAC SHA-256签名
 */
async function sign(data: string, secret: string): Promise<string> {
    const encoder = new TextEncoder();
    const keyData = encoder.encode(secret);
    const messageData = encoder.encode(data);

    const key = await crypto.subtle.importKey(
        'raw',
        keyData,
        { name: 'HMAC', hash: 'SHA-256' },
        false,
        ['sign']
    );

    const signature = await crypto.subtle.sign('HMAC', key, messageData);
    const signatureArray = new Uint8Array(signature);

    // 转换为base64url
    const base64 = btoa(String.fromCharCode(...signatureArray));
    return base64
        .replace(/\+/g, '-')
        .replace(/\//g, '_')
        .replace(/=/g, '');
}

/**
 * 生成JWT token
 */
export async function generateToken(
    payload: Omit<JWTPayload, 'iat' | 'exp'>,
    secret: string,
    expiresIn?: string | number
): Promise<string> {
    const now = Math.floor(Date.now() / 1000);

    // 解析过期时间
    let expirySeconds = TOKEN_EXPIRY;
    if (expiresIn) {
        if (typeof expiresIn === 'number') {
            expirySeconds = expiresIn;
        } else {
            // 解析字符串格式，如 '7d' 表示7天
            const match = expiresIn.match(/^(\d+)([smhd])$/);
            if (match) {
                const value = parseInt(match[1], 10);
                const unit = match[2];
                switch (unit) {
                    case 's':
                        expirySeconds = value;
                        break;
                    case 'm':
                        expirySeconds = value * 60;
                        break;
                    case 'h':
                        expirySeconds = value * 60 * 60;
                        break;
                    case 'd':
                        expirySeconds = value * 24 * 60 * 60;
                        break;
                    default:
                        expirySeconds = TOKEN_EXPIRY;
                }
            }
        }
    }

    const header = {
        alg: ALGORITHM,
        typ: 'JWT',
    };

    const fullPayload: JWTPayload = {
        ...payload,
        iat: now,
        exp: now + expirySeconds,
    };

    const headerEncoded = base64UrlEncode(JSON.stringify(header));
    const payloadEncoded = base64UrlEncode(JSON.stringify(fullPayload));
    const dataToSign = `${headerEncoded}.${payloadEncoded}`;

    const signature = await sign(dataToSign, secret);

    return `${dataToSign}.${signature}`;
}

/**
 * 验证并解析JWT token
 */
export async function verifyToken(
    token: string,
    secret: string
): Promise<JWTPayload | null> {
    try {
        const parts = token.split('.');
        if (parts.length !== 3) {
            return null;
        }

        const [headerEncoded, payloadEncoded, signature] = parts;
        const dataToVerify = `${headerEncoded}.${payloadEncoded}`;

        // 验证签名
        const expectedSignature = await sign(dataToVerify, secret);
        if (signature !== expectedSignature) {
            return null;
        }

        // 解析payload
        const payloadJson = base64UrlDecode(payloadEncoded);
        const payload: JWTPayload = JSON.parse(payloadJson);

        // 验证过期时间
        if (payload.exp && payload.exp < Math.floor(Date.now() / 1000)) {
            return null;
        }

        return payload;
    } catch (error) {
        console.error('Token verification error:', error);
        return null;
    }
}

/**
 * 从token中解析payload(不验证)
 * 仅用于调试,不应用于安全验证
 */
export function decodeToken(token: string): JWTPayload | null {
    try {
        const parts = token.split('.');
        if (parts.length !== 3) {
            return null;
        }

        const payloadJson = base64UrlDecode(parts[1]);
        return JSON.parse(payloadJson);
    } catch (error) {
        return null;
    }
}
