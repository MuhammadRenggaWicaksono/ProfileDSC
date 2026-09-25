import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  // Kita hanya mengunci request yang mengubah/menghapus data (POST, PUT, DELETE, dll)
  // Request GET (melihat data) tetap dibiarkan lewat karena profil memang untuk publik
  if (request.method !== 'GET') {
    const authHeader = request.headers.get('authorization');
    const secretKey = process.env.API_SECRET_KEY;

    if (authHeader !== `Bearer ${secretKey}`) {
      return NextResponse.json(
        { error: 'Unauthorized: Akses ditolak dari Middleware' },
        { status: 401 }
      );
    }
  }

  return NextResponse.next();
}

// Konfigurasi ini memastikan Middleware hanya menjaga rute API kita
export const config = {
  matcher: '/api/:path*',
};