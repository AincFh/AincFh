// 生成密码哈希的ESM脚本
import { hashPassword } from './src/backend/utils/hash.js';

async function main() {
  try {
    const hash = await hashPassword('admin123');
    console.log('Generated password hash:', hash);
  } catch (error) {
    console.error('Error generating password hash:', error);
  }
}

main();
