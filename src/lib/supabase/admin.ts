import { createClient } from '@supabase/supabase-js';

/**
 * Create Supabase client dengan hak akses admin (Service Role).
 * DIGUNAKAN HANYA DI SERVER (API Routes / Server Components) untuk validasi publik
 * seperti Portal Orang Tua atau Konfirmasi Scan QR tanpa membuka RLS publik di database.
 */
export function createAdminClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

  return createClient(url, serviceRoleKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  });
}
