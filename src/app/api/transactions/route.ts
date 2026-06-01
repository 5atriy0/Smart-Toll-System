import { supabase } from "@/services/supabaseClient";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  const body = await req.json();

  const { uid, gate_in, type } = body;

  if (type === "IN") {
    const { data, error } = await supabase.rpc("tap_in", {
      p_uid: uid,
      p_gate_id: gate_in,
    });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    return NextResponse.json({
      success: true,
      message: "Tap IN berhasil",
      transaction_id: data,
    });
  }

  if (type === "OUT") {
    const { error } = await supabase.rpc("tap_out", {
      p_uid: uid,
      p_gate_out: gate_in,
    });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    return NextResponse.json({
      success: true,
      message: "Tap OUT berhasil",
    });
  }

  return NextResponse.json({ error: "Invalid type" }, { status: 400 });
}