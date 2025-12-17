/**
 * 用户名验证
 * @param username 用户名
 * @returns 是否有效
 */
export function validateUsername(username: string): boolean {
  if (!username) return false;
  // 用户名长度应在3-20个字符之间
  if (username.length < 3 || username.length > 20) return false;
  // 用户名只能包含字母、数字、下划线和中文
  return /^[a-zA-Z0-9_\u4e00-\u9fa5]+$/.test(username);
}

/**
 * 邮箱验证
 * @param email 邮箱地址
 * @returns 是否有效
 */
export function validateEmail(email: string): boolean {
  if (!email) return false;
  // 简单的邮箱格式验证
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

/**
 * 密码验证
 * @param password 密码
 * @returns 是否有效
 */
export function validatePassword(password: string): boolean {
  if (!password) return false;
  // 密码长度应在8-20个字符之间，且包含字母和数字
  if (password.length < 8 || password.length > 20) return false;
  return /(?=.*[a-zA-Z])(?=.*\d)/.test(password);
}

/**
 * 确认密码验证
 * @param password 密码
 * @param confirmPassword 确认密码
 * @returns 是否有效
 */
export function validateConfirmPassword(password: string, confirmPassword: string): boolean {
  if (!password || !confirmPassword) return false;
  return password === confirmPassword;
}