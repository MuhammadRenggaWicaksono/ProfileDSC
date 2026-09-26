import { NextResponse } from 'next/server';
import { supabase, supabaseAdmin } from '@/lib/supabase';
import { response, errorResponse } from '../../utils/response'

export async function GET() {
  const { data, error } = await supabaseAdmin
    .from("members")
    .select("*")

  if (error) {
    return errorResponse(500, false, error.message)
  }

  return response(200, true, "donebang", data)
}

export async function POST(req: Request) {
  const body = await req.json();
  const { data, error } = await supabaseAdmin
    .from('members')
    .insert({
      name: body.name,
      role: body.role,
      photo_url: body.photo_url,
      social_links: body.social_links,
      point: body.point
    })
    .select()
    .single();

  if (error) {
    return errorResponse(500, false, error.message)
  }

  return response(201, true, "Berhasil menambahkan data anggota", data)
}

