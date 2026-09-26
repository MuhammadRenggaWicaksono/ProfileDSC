// ─── TypeScript Interfaces (sesuai schema.sql) ───────────────────────────────

export interface Event {
  id: string;
  title: string;
  description: string | null;
  event_date: string; // TIMESTAMP WITH TIME ZONE
  location: string | null;
  is_active: boolean;
  created_at: string;
}

export type CreateEventInput = Omit<Event, 'id' | 'created_at'>;

// ─── Return type helper ────────────────────────────────────────────────────────

interface DALResult<T> {
  data: T | null;
  error: Error | null;
}

// ─── Mock Data (sementara, menggantikan Supabase) ─────────────────────────────
// Struktur kolom mengikuti schema.sql tabel `events`.

const mockEvents: Event[] = [
  {
    id: '11111111-0000-0000-0000-000000000001',
    title: 'Workshop Git & GitHub untuk Pemula',
    description: 'Belajar dasar-dasar version control menggunakan Git dan GitHub secara praktis bersama para mentor DSC.',
    event_date: '2026-10-05T09:00:00+08:00',
    location: 'Lab Komputer Gedung A Lt. 3',
    is_active: true,
    created_at: '2026-09-20T10:00:00+08:00',
  },
  {
    id: '11111111-0000-0000-0000-000000000002',
    title: 'Seminar AI & Machine Learning 2026',
    description: 'Seminar eksklusif membahas tren terbaru AI dan penerapannya di industri bersama pembicara dari Google.',
    event_date: '2026-10-18T13:00:00+08:00',
    location: 'Aula Utama Kampus',
    is_active: true,
    created_at: '2026-09-21T08:30:00+08:00',
  },
  {
    id: '11111111-0000-0000-0000-000000000003',
    title: 'Hackathon DSC 2026',
    description: 'Kompetisi coding 24 jam berhadiah total 10 juta rupiah. Daftarkan timmu sekarang!',
    event_date: '2026-11-02T08:00:00+08:00',
    location: 'Ruang Inovasi Kampus',
    is_active: true,
    created_at: '2026-09-22T07:00:00+08:00',
  },
  {
    id: '11111111-0000-0000-0000-000000000004',
    title: 'Study Jam: Web Development with Next.js',
    description: 'Sesi belajar bersama membangun project web full-stack menggunakan Next.js dan Supabase.',
    event_date: '2026-09-15T10:00:00+08:00',
    location: 'Online (Google Meet)',
    is_active: false,
    created_at: '2026-09-01T09:00:00+08:00',
  },
];

// ─── Data Access Layer ────────────────────────────────────────────────────────

/**
 * Mengambil semua events, diurutkan berdasarkan event_date terbaru (descending).
 */
export async function getAllEvents(): Promise<DALResult<Event[]>> {
  try {
    const sorted = [...mockEvents].sort(
      (a, b) => new Date(b.event_date).getTime() - new Date(a.event_date).getTime()
    );
    return { data: sorted, error: null };
  } catch (err) {
    const error = err instanceof Error ? err : new Error('Unknown error in getAllEvents');
    return { data: null, error };
  }
}

/**
 * Mengambil satu event berdasarkan UUID-nya.
 */
export async function getEventById(id: string): Promise<DALResult<Event>> {
  try {
    const event = mockEvents.find((e) => e.id === id) ?? null;
    if (!event) throw new Error(`Event dengan id "${id}" tidak ditemukan.`);
    return { data: event, error: null };
  } catch (err) {
    const error = err instanceof Error ? err : new Error('Unknown error in getEventById');
    return { data: null, error };
  }
}

/**
 * Menambah event baru ke mock store (in-memory, tidak persisten antar request di production).
 */
export async function createEvent(input: CreateEventInput): Promise<DALResult<Event>> {
  try {
    const newEvent: Event = {
      id: crypto.randomUUID(),
      title: input.title,
      description: input.description,
      event_date: input.event_date,
      location: input.location,
      is_active: input.is_active ?? true,
      created_at: new Date().toISOString(),
    };
    mockEvents.push(newEvent);
    return { data: newEvent, error: null };
  } catch (err) {
    const error = err instanceof Error ? err : new Error('Unknown error in createEvent');
    return { data: null, error };
  }
}
