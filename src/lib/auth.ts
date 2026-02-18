import { cookies } from 'next/headers';
import bcrypt from 'bcryptjs';
import pool from './db';

export async function verifyAdmin(username: string, password: string): Promise<boolean> {
  const [rows] = await pool.execute(
    'SELECT password FROM admins WHERE username = ?',
    [username]
  ) as any;
  if (rows.length === 0) return false;
  return bcrypt.compare(password, rows[0].password);
}

export async function isAdminLoggedIn(): Promise<boolean> {
  const cookieStore = await cookies();
  return cookieStore.get('admin_session')?.value === process.env.NEXTAUTH_SECRET;
}
