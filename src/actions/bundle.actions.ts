// src/actions/bundle.actions.ts
'use server';

import { auth } from '@/auth';
import { BundleService } from '@/services/bundle.service';
import { revalidatePath } from 'next/cache';

export async function createBundleAction(permohonanIds: string[]) {
  const session = await auth();
  if (!session?.user) {
    return { success: false, error: 'Anda harus masuk terlebih dahulu.' };
  }

  if (session.user.role !== 'STAF_PENELITI') {
    return { success: false, error: 'Hanya Staf Peneliti yang berwenang membuat bundle.' };
  }

  const result = await BundleService.createBundle(permohonanIds, {
    id: session.user.id,
    name: session.user.name || session.user.username,
    role: session.user.role,
  });

  if (result.success) {
    revalidatePath('/permohonan/queue');
    revalidatePath('/bundle');
  }

  return result;
}

export async function addItemToBundleAction(bundleId: string, permohonanId: string) {
  const session = await auth();
  if (!session?.user) {
    return { success: false, error: 'Anda harus masuk terlebih dahulu.' };
  }

  if (session.user.role !== 'STAF_PENELITI') {
    return { success: false, error: 'Hanya Staf Peneliti yang berwenang mengelola isi bundle.' };
  }

  const result = await BundleService.addItemToBundle(bundleId, permohonanId, {
    id: session.user.id,
    name: session.user.name || session.user.username,
    role: session.user.role,
  });

  if (result.success) {
    revalidatePath(`/bundle/${bundleId}`);
    revalidatePath('/permohonan/queue');
  }

  return result;
}

export async function removeItemFromBundleAction(bundleId: string, permohonanId: string) {
  const session = await auth();
  if (!session?.user) {
    return { success: false, error: 'Anda harus masuk terlebih dahulu.' };
  }

  if (session.user.role !== 'STAF_PENELITI') {
    return { success: false, error: 'Hanya Staf Peneliti yang berwenang mengelola isi bundle.' };
  }

  const result = await BundleService.removeItemFromBundle(bundleId, permohonanId, {
    id: session.user.id,
    name: session.user.name || session.user.username,
    role: session.user.role,
  });

  if (result.success) {
    revalidatePath(`/bundle/${bundleId}`);
    revalidatePath('/permohonan/queue');
  }

  return result;
}

export async function finalizeBundleAction(bundleId: string) {
  const session = await auth();
  if (!session?.user) {
    return { success: false, error: 'Anda harus masuk terlebih dahulu.' };
  }

  if (session.user.role !== 'STAF_PENELITI') {
    return { success: false, error: 'Hanya Staf Peneliti yang berwenang memfinalisasi bundle.' };
  }

  const result = await BundleService.finalizeBundle(bundleId, {
    id: session.user.id,
    name: session.user.name || session.user.username,
    role: session.user.role,
  });

  if (result.success) {
    revalidatePath('/bundle');
    revalidatePath(`/bundle/${bundleId}`);
  }

  return result;
}

export async function reExamineBundleAction(bundleId: string) {
  const session = await auth();
  if (!session?.user) {
    return { success: false, error: 'Anda harus masuk terlebih dahulu.' };
  }

  const allowed = ['STAF_PENGARSIP', 'STAF_PENELITI'];
  if (!allowed.includes(session.user.role)) {
    return { success: false, error: 'Anda tidak memiliki hak akses untuk mengembalikan bundle.' };
  }

  const result = await BundleService.reExamineBundle(bundleId, {
    id: session.user.id,
    name: session.user.name || session.user.username,
    role: session.user.role,
  });

  if (result.success) {
    revalidatePath('/bundle');
    revalidatePath('/arsip');
    revalidatePath(`/bundle/${bundleId}`);
  }

  return result;
}

export async function approveBundleArchivingAction(bundleId: string) {
  const session = await auth();
  if (!session?.user) {
    return { success: false, error: 'Anda harus masuk terlebih dahulu.' };
  }

  if (session.user.role !== 'STAF_PENGARSIP') {
    return { success: false, error: 'Hanya Staf Pengarsip yang berwenang menyetujui pengarsipan.' };
  }

  const result = await BundleService.approveBundleArchiving(bundleId, {
    id: session.user.id,
    name: session.user.name || session.user.username,
    role: session.user.role,
  });

  if (result.success) {
    revalidatePath('/bundle');
    revalidatePath('/arsip');
    revalidatePath(`/bundle/${bundleId}`);
  }

  return result;
}

export async function completeBundleAction(bundleId: string) {
  const session = await auth();
  if (!session?.user) {
    return { success: false, error: 'Anda harus masuk terlebih dahulu.' };
  }

  if (session.user.role !== 'STAF_PEMANTAU') {
    return { success: false, error: 'Hanya Staf Pemantau yang berwenang menyelesaikan bundle.' };
  }

  const result = await BundleService.completeBundle(bundleId, {
    id: session.user.id,
    name: session.user.name || session.user.username,
    role: session.user.role,
  });

  if (result.success) {
    revalidatePath('/bundle');
    revalidatePath('/monitoring');
    revalidatePath(`/bundle/${bundleId}`);
  }

  return result;
}
