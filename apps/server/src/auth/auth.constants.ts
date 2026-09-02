export const JWT_SECRET =
  process.env.JWT_SECRET ?? "k-dream-dev-secret-change-in-production";
export const JWT_EXPIRES_IN = "7d";

/** httpOnly 쿠키 이름. admin 앱의 proxy.ts 에서도 같은 이름을 본다. */
export const AUTH_COOKIE = "admin_token";
export const AUTH_COOKIE_MAX_AGE = 7 * 24 * 60 * 60 * 1000;

export const BCRYPT_ROUNDS = 10;
