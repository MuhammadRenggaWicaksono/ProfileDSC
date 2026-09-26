import { supabase, supabaseAdmin } from '@/lib/supabase';
import { response, errorResponse } from '../../../utils/response'

export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    const { data, error } = await supabaseAdmin
        .from('members')
        .select('*')
        .eq("id", id)
        .single()
    if (error) {
        return errorResponse(500, false, error.message)
    }
    return response(200, true, `Detail data member DSC: ${data.name}`, data)
}


export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
    const body = await req.json();
    const { id } = await params;
    const { data, error } = await supabaseAdmin
        .from('members')
        .update({
            name: body.name,
            role: body.role,
            photo_url: body.photo_url,
            social_links: body.social_links,
            point: body.point
        })
        .eq("id", id)
        .select()
        .single()

    if (error) {
        return errorResponse(500, false, error.message)
    }

    return response(200, true, "Berhasil mengubah data anggota", data)
}


export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    const { data, error } = await supabaseAdmin
        .from('members')
        .delete()
        .eq("id", id)
        .select()
        .single()

    if (error) {
        return errorResponse(500, false, error.message)
    }
    return response(200, true, "Berhasil menghapus data", data)
}