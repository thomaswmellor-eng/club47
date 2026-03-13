import { SignJWT, jwtVerify } from 'jose';

const getSecret = () =>
  new TextEncoder().encode(process.env.ADMIN_JWT_SECRET!);

export async function signAdminToken(payload: { name: string; email: string }) {
  return new SignJWT(payload)
    .setProtectedHeader({ alg: 'HS256' })
    .setExpirationTime('7d')
    .sign(getSecret());
}

export async function verifyAdminToken(token: string): Promise<{ name: string; email: string }> {
  const { payload } = await jwtVerify(token, getSecret());
  return payload as { name: string; email: string };
}
