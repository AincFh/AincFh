const bcrypt = require('bcryptjs');

// 生成强密码哈希
const password = 'Admin@123456'; // 默认密码，部署后请立即修改
const hash = bcrypt.hashSync(password, 10);

console.log('Password:', password);
console.log('Hash:', hash);
console.log('\n运行以下命令更新数据库：');
console.log(`npx wrangler d1 execute blog-database --remote --command="UPDATE users SET password_hash='${hash}' WHERE email='admin@example.com'"`);
