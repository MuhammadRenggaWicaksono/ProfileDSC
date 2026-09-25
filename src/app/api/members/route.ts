import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

// GET: Dipanggil Frontend untuk mengambil daftar semua anggota
export async function GET() {
  const { data, error } = await supabase.from('members').select('*');

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(data);
}

// POST: Dipanggil Frontend untuk menambahkan anggota baru
export async function POST(request: Request) {
  const body = await request.json();
  const { data, error } = await supabase.from('members').insert([body]).select();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }

  return NextResponse.json(data, { status: 201 });
}