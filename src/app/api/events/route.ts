import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { getAllEvents, createEvent } from '@/server/events';

// ─── In-Memory IP-Based Rate Limiter (Sliding Window) ────────────────────────

interface RateLimitEntry {
  timestamps: number[];
}

const RATE_LIMIT_MAX = 10;
const RATE_LIMIT_WINDOW_MS = 60_000; // 1 menit

const ipRequestMap = new Map<string, RateLimitEntry>();

function getClientIp(request: NextRequest): string {
  const forwarded = request.headers.get('x-forwarded-for');
  if (forwarded) {
    return forwarded.split(',')[0].trim();
  }
  return request.headers.get('x-real-ip') ?? 'unknown';
}

function isRateLimited(ip: string): boolean {
  const now = Date.now();
  const entry = ipRequestMap.get(ip) ?? { timestamps: [] };

  entry.timestamps = entry.timestamps.filter((ts) => now - ts < RATE_LIMIT_WINDOW_MS);

  if (entry.timestamps.length >= RATE_LIMIT_MAX) {
    ipRequestMap.set(ip, entry);
    return true;
  }

  entry.timestamps.push(now);
  ipRequestMap.set(ip, entry);
  return false;
}

function rateLimitResponse(): NextResponse {
  return NextResponse.json(
    { error: 'Too many requests, please try again later.' },
    {
      status: 429,
      headers: {
        'Retry-After': String(Math.ceil(RATE_LIMIT_WINDOW_MS / 1000)),
      },
    }
  );
}

// ─── Route Handlers ───────────────────────────────────────────────────────────

/**
 * GET /api/events
 * Publik — mengembalikan semua events diurutkan event_date terbaru.
 */
export async function GET(request: NextRequest): Promise<NextResponse> {
  const ip = getClientIp(request);
  if (isRateLimited(ip)) return rateLimitResponse();

  const { data, error } = await getAllEvents();

  if (error) {
    return NextResponse.json(
      { error: 'Gagal mengambil data events.' },
      { status: 500 }
    );
  }

  return NextResponse.json({ data }, { status: 200 });
}

/**
 * POST /api/events
 * Terproteksi middleware (wajib Bearer token).
 * Membuat event baru — field wajib: title, event_date.
 * Field opsional: description, location, is_active.
 */
export async function POST(request: NextRequest): Promise<NextResponse> {
  const ip = getClientIp(request);
  if (isRateLimited(ip)) return rateLimitResponse();

  let body: Record<string, unknown>;

  try {
    body = (await request.json()) as Record<string, unknown>;
  } catch {
    return NextResponse.json(
      { error: 'Format JSON pada request body tidak valid.' },
      { status: 400 }
    );
  }

  // ── Validasi field wajib ────────────────────────────────────────────────────
  const requiredFields = ['title', 'event_date'] as const;
  const missingOrEmpty = requiredFields.filter(
    (field) => typeof body[field] !== 'string' || (body[field] as string).trim() === ''
  );

  if (missingOrEmpty.length > 0) {
    return NextResponse.json(
      { error: `Field wajib kosong atau tidak ada: ${missingOrEmpty.join(', ')}.` },
      { status: 400 }
    );
  }

  // ── Validasi format event_date (harus ISO 8601 yang valid) ─────────────────
  const eventDateStr = (body.event_date as string).trim();
  if (isNaN(Date.parse(eventDateStr))) {
    return NextResponse.json(
      { error: 'Format event_date tidak valid. Gunakan format ISO 8601 (contoh: 2026-10-05T09:00:00+08:00).' },
      { status: 400 }
    );
  }

  const { data, error } = await createEvent({
    title: (body.title as string).trim(),
    description: typeof body.description === 'string' ? body.description.trim() : null,
    event_date: eventDateStr,
    location: typeof body.location === 'string' ? body.location.trim() : null,
    is_active: typeof body.is_active === 'boolean' ? body.is_active : true,
  });

  if (error) {
    return NextResponse.json(
      { error: 'Gagal membuat event baru.' },
      { status: 500 }
    );
  }

  return NextResponse.json(
    { message: 'Event berhasil dibuat.', data },
    { status: 201 }
  );
}
