import { SupabaseClient, User } from '@supabase/supabase-js';
import { Profile, ServiceResult } from '@/lib/types';

export async function signIn(
  supabase: SupabaseClient,
  email: string,
  password: string
): Promise<ServiceResult<{ user: User; profile: Profile | null }>> {
  try {
    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (authError) return { data: null, error: authError.message };

    // Fetch the profile
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', authData.user.id)
      .single();

    if (profileError) {
      return { data: { user: authData.user, profile: null }, error: 'Gagal memuat profil guru' };
    }

    return { data: { user: authData.user, profile }, error: null };
  } catch {
    return { data: null, error: 'Terjadi kesalahan yang tidak terduga saat masuk' };
  }
}

export async function signUp(
  supabase: SupabaseClient,
  email: string,
  password: string,
  nama: string
): Promise<ServiceResult<{ user: User | null; profile: Profile | null }>> {
  try {
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          nama,
        },
      },
    });

    if (authError) return { data: null, error: authError.message };
    if (!authData.user) return { data: null, error: 'Gagal membuat akun baru' };

    // Since a trigger handles profiles insertion, let's fetch the profile to confirm it exists
    const { data: profile } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', authData.user.id)
      .single();

    return { data: { user: authData.user, profile }, error: null };
  } catch {
    return { data: null, error: 'Terjadi kesalahan yang tidak terduga saat mendaftar' };
  }
}

export async function signOut(supabase: SupabaseClient): Promise<void> {
  await supabase.auth.signOut();
}

export async function getProfile(supabase: SupabaseClient, userId?: string): Promise<ServiceResult<Profile>> {
  try {
    let profileUserId = userId;
    if (!profileUserId) {
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      if (userError || !user) return { data: null, error: 'Sesi tidak valid' };
      profileUserId = user.id;
    }

    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', profileUserId)
      .single();

    if (profileError) return { data: null, error: 'Profil tidak ditemukan' };
    return { data: profile, error: null };
  } catch {
    return { data: null, error: 'Gagal memuat profil' };
  }
}

export async function updateProfile(
  supabase: SupabaseClient,
  data: { nama: string }
): Promise<ServiceResult<Profile>> {
  try {
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (userError || !user) return { data: null, error: 'Sesi tidak valid' };

    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .update({ nama: data.nama })
      .eq('id', user.id)
      .select()
      .single();

    if (profileError) return { data: null, error: profileError.message };
    return { data: profile, error: null };
  } catch {
    return { data: null, error: 'Gagal memperbarui profil' };
  }
}
