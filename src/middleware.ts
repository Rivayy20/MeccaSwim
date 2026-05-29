import { type NextRequest } from 'next/server';
import { updateSession } from '@/lib/supabase/middleware';

/**
 * Next.js Middleware — thin controller layer.
 * Delegates all logic to updateSession (SRP).
 */
export async function middleware(request: NextRequest) {
  return await updateSession(request);
}

export const config = {
  // Public QR and parent pages do not need an auth round trip.
  matcher: ['/dashboard/:path*', '/login'],
};
