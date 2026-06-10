// src/actions/permohonan.actions.ts
'use server';

import { auth } from '@/auth';
import { PermohonanService } from '@/services/permohonan.service';
import { permohonanSchema } from '@/validators/permohonan.validator';
import { revalidatePath } from 'next/cache';

export async function createPermohonanAction(values: unknown) {
  const session = await auth();
  if (!session?.user) {
    return { success: false, error: 'Anda harus masuk terlebih dahulu.' };
  }

  // Enforce STAF_PENGINPUT or STAF_PENELITI role
  const allowedRoles = ['STAF_PENGINPUT', 'STAF_PENELITI'];
  if (!allowedRoles.includes(session.user.role)) {
    return { success: false, error: 'Anda tidak memiliki hak akses untuk membuat permohonan.' };
  }

  const parsed = permohonanSchema.safeParse(values);
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0].message };
  }

  const result = await PermohonanService.create(parsed.data, {
    id: session.user.id,
    name: session.user.name || session.user.username,
    role: session.user.role,
  });

  if (result.success) {
    revalidatePath('/permohonan');
  }

  return result;
}

export async function updatePermohonanAction(id: string, values: unknown) {
  const session = await auth();
  if (!session?.user) {
    return { success: false, error: 'Anda harus masuk terlebih dahulu.' };
  }

  const parsed = permohonanSchema.safeParse(values);
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0].message };
  }

  const result = await PermohonanService.update(id, parsed.data, {
    id: session.user.id,
    name: session.user.name || session.user.username,
    role: session.user.role,
  });

  if (result.success) {
    revalidatePath('/permohonan');
    revalidatePath(`/permohonan/${id}`);
  }

  return result;
}

export async function deletePermohonanAction(id: string) {
  const session = await auth();
  if (!session?.user) {
    return { success: false, error: 'Anda harus masuk terlebih dahulu.' };
  }

  const result = await PermohonanService.delete(id, {
    id: session.user.id,
    name: session.user.name || session.user.username,
    role: session.user.role,
  });

  if (result.success) {
    revalidatePath('/permohonan');
  }

  return result;
}

export async function requestRevisionAction(id: string) {
  const session = await auth();
  if (!session?.user) {
    return { success: false, error: 'Anda harus masuk terlebih dahulu.' };
  }

  if (session.user.role !== 'STAF_PENELITI') {
    return { success: false, error: 'Hanya Staf Peneliti yang berwenang mengajukan revisi.' };
  }

  const result = await PermohonanService.requestRevision(id, {
    id: session.user.id,
    name: session.user.name || session.user.username,
    role: session.user.role,
  });

  if (result.success) {
    revalidatePath('/permohonan');
    revalidatePath('/permohonan/queue');
    revalidatePath(`/permohonan/${id}`);
  }

  return result;
}

export async function rejectPermohonanAction(id: string) {
  const session = await auth();
  if (!session?.user) {
    return { success: false, error: 'Anda harus masuk terlebih dahulu.' };
  }

  if (session.user.role !== 'STAF_PENELITI') {
    return { success: false, error: 'Hanya Staf Peneliti yang berwenang menolak berkas.' };
  }

  const result = await PermohonanService.rejectPermohonan(id, {
    id: session.user.id,
    name: session.user.name || session.user.username,
    role: session.user.role,
  });

  if (result.success) {
    revalidatePath('/permohonan');
    revalidatePath('/permohonan/queue');
    revalidatePath(`/permohonan/${id}`);
  }

  return result;
}

export async function resubmitPermohonanAction(id: string) {
  const session = await auth();
  if (!session?.user) {
    return { success: false, error: 'Anda harus masuk terlebih dahulu.' };
  }

  if (session.user.role !== 'STAF_PENGINPUT') {
    return { success: false, error: 'Hanya Staf Penginput yang berwenang mengirim kembali berkas.' };
  }

  const result = await PermohonanService.resubmitPermohonan(id, {
    id: session.user.id,
    name: session.user.name || session.user.username,
    role: session.user.role,
  });

  if (result.success) {
    revalidatePath('/permohonan');
    revalidatePath('/permohonan/revisi');
    revalidatePath(`/permohonan/${id}`);
  }

  return result;
}

export async function uploadScanFileAction(
  permohonanId: string,
  fileData: { fileId: string; fileName: string; storageKey: string; mimeType: string; fileSize: number }
) {
  const session = await auth();
  if (!session?.user) {
    return { success: false, error: 'Anda harus masuk terlebih dahulu.' };
  }

  if (session.user.role !== 'STAF_PENGARSIP') {
    return { success: false, error: 'Hanya Staf Pengarsip yang berwenang mengunggah scan.' };
  }

  const result = await PermohonanService.uploadScanFile(permohonanId, fileData, {
    id: session.user.id,
    name: session.user.name || session.user.username,
    role: session.user.role,
  });

  if (result.success) {
    revalidatePath('/arsip');
    revalidatePath(`/permohonan/${permohonanId}`);
  }

  return result;
}

export async function deleteScanFileAction(permohonanId: string, fileId: string) {
  const session = await auth();
  if (!session?.user) {
    return { success: false, error: 'Anda harus masuk terlebih dahulu.' };
  }

  if (session.user.role !== 'STAF_PENGARSIP') {
    return { success: false, error: 'Hanya Staf Pengarsip yang berwenang menghapus scan.' };
  }

  const result = await PermohonanService.deleteScanFile(permohonanId, fileId, {
    id: session.user.id,
    name: session.user.name || session.user.username,
    role: session.user.role,
  });

  if (result.success) {
    revalidatePath('/arsip');
    revalidatePath(`/permohonan/${permohonanId}`);
  }

  return result;
}

export async function togglePermohonanCompletionAction(permohonanId: string) {
  const session = await auth();
  if (!session?.user) {
    return { success: false, error: 'Anda harus masuk terlebih dahulu.' };
  }

  if (session.user.role !== 'STAF_PEMANTAU') {
    return { success: false, error: 'Hanya Staf Pemantau yang berwenang menyelesaikan permohonan.' };
  }

  const result = await PermohonanService.togglePermohonanCompletion(permohonanId, {
    id: session.user.id,
    name: session.user.name || session.user.username,
    role: session.user.role,
  });

  if (result.success) {
    revalidatePath('/monitoring');
    revalidatePath(`/permohonan/${permohonanId}`);
  }

  return result;
}
