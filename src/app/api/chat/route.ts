import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    const { message } = await req.json();
    const apiKey = process.env.GEMINI_API_KEY;

    if (!apiKey) {
      return NextResponse.json(
        { error: 'API Key Gemini belum disetting di .env.local' },
        { status: 500 }
      );
    }

    const systemInstruction = `Kamu adalah MeccaBot, asisten virtual ramah dan santai dari Mecca Swim. 
Gunakan gaya bahasa santai, ramah, kekinian namun tetap profesional (sapa pengguna dengan "Kak" atau "Bunda/Ayah"). 
Gunakan emoji secukupnya agar chat terasa hangat.
Jawab pertanyaan dengan singkat, padat, dan jelas.

Konteks Produk:
Mecca Swim adalah aplikasi pencatatan presensi kelas renang modern (SaaS). 
Fitur Utama:
1. Sesi Presensi QR: Murid bisa presensi instan menggunakan scan QR code.
2. Pengaturan WhatsApp: Orang tua akan mendapat pesan WA otomatis begitu anak berhasil presensi.
3. Dashboard Guru: Pantau kehadiran murid secara real-time.
4. Manajemen Kelas: Kelola grup, jadwal, dan profil murid tanpa ribet.
5. Export Laporan: Download data presensi jadi file Excel (XLSX).
6. Portal Orang Tua: Link khusus untuk orang tua melacak histori presensi anaknya.

Jika ada pertanyaan seputar pendaftaran, persilakan untuk klik tombol "Mulai Gratis" di website.`;

    const modelName = 'gemini-2.5-flash';
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${modelName}:generateContent?key=${apiKey}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          system_instruction: {
            parts: { text: systemInstruction }
          },
          contents: [
            {
              role: 'user',
              parts: [{ text: message }]
            }
          ]
        })
      }
    );

    const data = await response.json();
    
    console.log("Gemini Model:", modelName);
    console.log("Gemini Status:", response.status);

    if (!response.ok) {
      console.error('Gemini API Integration Error:', data.error || 'Unknown error');
      return NextResponse.json(
        { error: 'AI Assistant sedang sibuk saat ini. Silakan coba kembali beberapa saat lagi.' },
        { status: response.status }
      );
    }

    const reply = data.candidates?.[0]?.content?.parts?.[0]?.text || 'Maaf, aku lagi bingung nih 😅. Bisa ulangi pertanyaannya?';
    
    return NextResponse.json({ reply });

  } catch (error) {
    console.error('API Error:', error);
    return NextResponse.json(
      { error: 'Terjadi kesalahan pada server' },
      { status: 500 }
    );
  }
}
