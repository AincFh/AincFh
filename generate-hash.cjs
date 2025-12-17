// 直接实现密码哈希算法，生成符合项目要求的密码哈希

const crypto = require('crypto');

const ITERATIONS = 100000;
const KEY_LENGTH = 32;
const SALT_LENGTH = 16;

/**
 * 生成随机盐
 */
function generateSalt() {
  return crypto.randomBytes(SALT_LENGTH);
}

/**
 * 将Buffer转换为十六进制字符串
 */
function toHex(buffer) {
  return buffer.toString('hex');
}

/**
 * 哈希密码
 * 返回格式: salt$hash (都是十六进制字符串)
 */
async function hashPassword(password) {
  const salt = generateSalt();

  // 使用crypto.pbkdf2Sync进行同步哈希
  const hash = crypto.pbkdf2Sync(
    password,
    salt,
    ITERATIONS,
    KEY_LENGTH,
    'sha256'
  );

  return `${toHex(salt)}$${toHex(hash)}`;
}

// 生成密码哈希
async function main() {
  try {
    const password = 'admin123';
    const hash = await hashPassword(password);
    console.log(`Password: ${password}`);
    console.log(`Generated hash: ${hash}`);
    console.log('Use this hash to update the users table in your database.');
  } catch (error) {
    console.error('Error generating password hash:', error);
  }
}

main();
