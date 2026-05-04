import { supabase } from "@/services/supabaseClient";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  const body = await req.json();

  const { uid, gate_in, type } = body;
  
  if (type === "IN") {
    const { error } = await supabase.from("transactions").insert([
      {
        uid,
        gate_in,
        tap_in_time: new Date(),
        status: "IN_PROGRESS",
      },
    ]);

    if (error) {
      return NextResponse.json({ error }, { status: 500 });
    }

    return NextResponse.json({ message: "Tap IN berhasil" });
  }

  // 🔥 TAP OUT
  if (type === "OUT") {
    const { error } = await supabase
      .from("transactions")
      .update({
        gate_out: gate_in,
        tap_out_time: new Date(),
        status: "DONE",
      })
      .eq("uid", uid)
      .is("tap_out_time", null); // cari yang belum keluar

    if (error) {
      return NextResponse.json({ error }, { status: 500 });
    }

    return NextResponse.json({ message: "Tap OUT berhasil" });
  }

  return NextResponse.json({ error: "Invalid type" }, { status: 400 });
}