import { supabase } from "@/services/supabaseClient";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  const body = await req.json();

  const { uid, gate_in, type } = body;

  //Tap Masuk
  if (type === "IN") {
    // cek user
    const { data: user, error: userError } = await supabase
      .from("users")
      .select("*")
      .eq("uid", uid)
      .single();

    if (userError || !user) {
      return NextResponse.json(
        { error: "User tidak ditemukan" },
        { status: 404 }
      );
    }

    // cek transaksi aktif
    const { data: existing } = await supabase
      .from("transactions")
      .select("*")
      .eq("uid", uid)
      .is("tap_out_time", null);

    if (existing && existing.length > 0) {
      return NextResponse.json(
        { error: "Masih ada transaksi aktif" },
        { status: 400 }
      );
    }

    // insert transaksi
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

    return NextResponse.json({
      success: true,
      message: "Tap IN berhasil",
      balance: user.balance,
    });
  }

  //Tap Keluar
  if (type === "OUT") {
    // cari transaksi aktif
    const { data: trx, error: trxError } = await supabase
      .from("transactions")
      .select("*")
      .eq("uid", uid)
      .is("tap_out_time", null)
      .single();

    if (trxError || !trx) {
      return NextResponse.json(
        { error: "Tidak ada transaksi aktif" },
        { status: 400 }
      );
    }

    // ambil user
    const { data: user, error: userError } = await supabase
      .from("users")
      .select("*")
      .eq("uid", uid)
      .single();

    if (userError || !user) {
      return NextResponse.json(
        { error: "User tidak ditemukan" },
        { status: 404 }
      );
    }

    const tarif = 5000;

    // cek saldo
    if (user.balance < tarif) {
      return NextResponse.json(
        { error: "Saldo tidak cukup" },
        { status: 400 }
      );
    }

    const newBalance = user.balance - tarif;

    // update saldo
    const { error: updateError } = await supabase
      .from("users")
      .update({ balance: newBalance })
      .eq("uid", uid);

    if (updateError) {
      return NextResponse.json({ error: updateError }, { status: 500 });
    }

    // update transaksi
    const { error: trxUpdateError } = await supabase
      .from("transactions")
      .update({
        gate_out: gate_in,
        tap_out_time: new Date(),
        status: "DONE",
      })
      .eq("id", trx.id);

    if (trxUpdateError) {
      return NextResponse.json({ error: trxUpdateError }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      message: "Tap OUT berhasil",
      balance: newBalance,
      tarif,
    });
  }

 //Invalid
  return NextResponse.json(
    { error: "Invalid type" },
    { status: 400 }
  );
}