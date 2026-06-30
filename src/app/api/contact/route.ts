import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { name, email, message, subject } = body;

    if (!name || !email || !message) {
      return NextResponse.json(
        { success: false, message: 'Nama, email, dan pesan wajib diisi.' },
        { status: 400 }
      );
    }

    // Input bounds validation
    if (name.length > 100 || email.length > 150 || message.length > 2000) {
      return NextResponse.json(
        { success: false, message: 'Ukuran input melebihi batas maksimal yang diizinkan.' },
        { status: 400 }
      );
    }

    const accessKey = process.env.WEB3FORMS_ACCESS_KEY || process.env.NEXT_PUBLIC_WEB3FORMS_KEY;
    if (!accessKey) {
      return NextResponse.json(
        { success: false, message: 'Konfigurasi Web3Forms API Key belum diatur di server.' },
        { status: 500 }
      );
    }

    const response = await fetch('https://api.web3forms.com/submit', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        access_key: accessKey,
        name,
        email,
        message,
        subject: subject || 'Pesan Baru dari Form Kontak Mecca Swim',
        from_name: 'Mecca Swim Contact Form',
      }),
    });

    const data = await response.json();
    if (data.success) {
      return NextResponse.json({ success: true, message: 'Pesan berhasil terkirim!' });
    } else {
      return NextResponse.json(
        { success: false, message: data.message || 'Gagal mengirim pesan ke Web3Forms.' },
        { status: 400 }
      );
    }
  } catch (error) {
    console.error('Error in POST /api/contact:', error);
    return NextResponse.json(
      { success: false, message: 'Terjadi kesalahan internal pada server.' },
      { status: 500 }
    );
  }
}
