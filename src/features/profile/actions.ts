'use server';

import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';
import { z } from 'zod';

// Esquemas de validación
const profileSchema = z.object({
  username: z
    .string()
    .min(3, 'Mínimo 3 caracteres')
    .max(20, 'Máximo 20 caracteres')
    .regex(
      /^[a-zA-Z0-9_]+$/,
      'Solo letras, números y guiones bajos'
    ),
  bio: z.string().max(160, 'Máximo 160 caracteres').optional(),
  location_text: z.string().max(100).optional(),
});

export type ProfileData = {
  id: string;
  username: string | null;
  avatar_url: string | null;
  bio: string | null;
  location_text: string | null;
};

/**
 * Obtiene el perfil del usuario actual
 */
export async function getProfile() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) return null;

  const { data, error } = await supabase
    .from('profiles')
    .select('id, username, avatar_url, bio, location_text')
    .eq('id', user.id)
    .single();

  if (error) {
    console.error('Error fetching profile:', error);
    return null;
  }

  return data as ProfileData;
}

/**
 * Actualiza la ubicación (texto simple por ahora)
 */
export async function updateLocation(data: {
  city: string;
  state: string;
  neighborhood?: string;
}) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) throw new Error('No autenticado');

  // Formato simple: "Barrio, Ciudad, Estado"
  const locationParts = [
    data.neighborhood,
    data.city,
    data.state
  ].filter(Boolean);

  const locationText = locationParts.join(', ');

  const { error } = await supabase
    .from('profiles')
    .update({ location_text: locationText })
    .eq('id', user.id);

  if (error) throw new Error('Error al actualizar ubicación');

  revalidatePath('/app/profile/location');
  return { success: true };
}

/**
 * Actualiza el nombre de usuario
 */
export async function updateUsername(username: string) {
  const result = profileSchema.pick({ username: true }).safeParse({ username });

  if (!result.success) {
    return { error: result.error.issues[0].message };
  }

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) return { error: 'No autenticado' };

  // Verificar si ya existe
  const { data: existing } = await supabase
    .from('profiles')
    .select('id')
    .eq('username', username)
    .neq('id', user.id)
    .single();

  if (existing) {
    return { error: 'El nombre de usuario ya está en uso' };
  }

  const { error } = await supabase
    .from('profiles')
    .update({ username })
    .eq('id', user.id);

  if (error) {
    console.error('Update username error:', error);
    return { error: 'Error al actualizar nombre de usuario' };
  }

  // Sync with Auth Session
  const { error: authError } = await supabase.auth.updateUser({
    data: { username }
  });

  if (authError) {
    console.error('Error syncing auth metadata:', authError);
    // Don't fail the request if just metadata sync fails, but log it
  }

  revalidatePath('/app/profile/account');
  return { success: true };
}

/**
 * Sube un nuevo avatar y actualiza el perfil
 */
export async function uploadAvatar(formData: FormData) {
  const file = formData.get('file') as File;

  if (!file) {
    return { error: 'No se recibió ningún archivo' };
  }

  if (file.size > 2 * 1024 * 1024) {
    return { error: 'El archivo debe ser menor a 2MB' };
  }

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) return { error: 'No autenticado' };

  // 1. Subir al bucket 'avatars'
  const fileExt = file.name.split('.').pop();
  const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;
  const filePath = `${user.id}/${fileName}`;

  const { error: uploadError } = await supabase.storage
    .from('avatars')
    .upload(filePath, file);

  if (uploadError) {
    console.error('Avatar upload error:', uploadError);
    return { error: 'Error al subir la imagen' };
  }

  // 2. Obtener URL pública
  const { data: { publicUrl } } = supabase.storage
    .from('avatars')
    .getPublicUrl(filePath);

  // 3. Actualizar perfil
  const { error: updateError } = await supabase
    .from('profiles')
    .update({ avatar_url: publicUrl })
    .eq('id', user.id);

  if (updateError) {
    return { error: 'Error al actualizar perfil' };
  }

  // Sync with Auth Session
  await supabase.auth.updateUser({
    data: { avatar_url: publicUrl }
  });

  revalidatePath('/app/profile/account');
  return { success: true, url: publicUrl };
}

/**
 * Elimina el avatar actual
 */
export async function deleteAvatar() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) return { error: 'No autenticado' };

  // Nota: Idealmente deberíamos borrar el archivo del bucket también,
  // pero necesitamos saber el nombre del archivo. 
  // Por ahora solo limpiamos la URL en el perfil.

  const { error } = await supabase
    .from('profiles')
    .update({ avatar_url: null })
    .eq('id', user.id);

  if (error) {
    return { error: 'Error al eliminar avatar' };
  }

  revalidatePath('/app/profile/account');
  return { success: true };
}
