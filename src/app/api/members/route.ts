import { NextResponse } from 'next/server';
import { supabase, supabaseAdmin } from '@/lib/supabase';

// GET: Publik (Otomatis lolos dari Middleware)
export async function GET() {
  const { data, error } = await supabase.from('members').select('*');
  
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}

// POST: Aman (Sudah dicegat Middleware di pintu depan)
export async function POST(request: Request) {
  const body = await request.json();
  const { data, error } = await supabaseAdmin.from('members').insert([body]).select();

  if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  return NextResponse.json(data, { status: 201 });
}