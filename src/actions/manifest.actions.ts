// src/actions/manifest.actions.ts
'use server';

import { auth } from '@/auth';
import { ManifestService } from '@/services/manifest.service';
import { revalidatePath } from 'next/cache';

export async function createManifestAction(bundleIds: string[]) {
  const session = await auth();
  if (!session?.user) {
    return { success: false, error: 'Anda harus masuk terlebih dahulu.' };
  }

  if (session.user.role !== 'STAF_PENGIRIM') {
    return { success: false, error: 'Hanya Staf Pengirim yang berwenang membuat manifest.' };
  }

  const result = await ManifestService.createManifest(bundleIds, {
    id: session.user.id,
    name: session.user.name || session.user.username,
    role: session.user.role,
  });

  if (result.success) {
    revalidatePath('/manifest');
    revalidatePath('/manifest/shipping');
  }

  return result;
}

export async function addBundleToManifestAction(manifestId: string, bundleId: string) {
  const session = await auth();
  if (!session?.user) {
    return { success: false, error: 'Anda harus masuk terlebih dahulu.' };
  }

  if (session.user.role !== 'STAF_PENGIRIM') {
    return { success: false, error: 'Hanya Staf Pengirim yang berwenang mengelola isi manifest.' };
  }

  const result = await ManifestService.addBundleToManifest(manifestId, bundleId, {
    id: session.user.id,
    name: session.user.name || session.user.username,
    role: session.user.role,
  });

  if (result.success) {
    revalidatePath(`/manifest/shipping?id=${manifestId}`);
    revalidatePath('/manifest');
  }

  return result;
}

export async function removeBundleFromManifestAction(manifestId: string, bundleId: string) {
  const session = await auth();
  if (!session?.user) {
    return { success: false, error: 'Anda harus masuk terlebih dahulu.' };
  }

  if (session.user.role !== 'STAF_PENGIRIM') {
    return { success: false, error: 'Hanya Staf Pengirim yang berwenang mengelola isi manifest.' };
  }

  const result = await ManifestService.removeBundleFromManifest(manifestId, bundleId, {
    id: session.user.id,
    name: session.user.name || session.user.username,
    role: session.user.role,
  });

  if (result.success) {
    revalidatePath(`/manifest/shipping?id=${manifestId}`);
    revalidatePath('/manifest');
  }

  return result;
}

export async function uploadSignedProofAction(manifestId: string, signedProofUrl: string) {
  const session = await auth();
  if (!session?.user) {
    return { success: false, error: 'Anda harus masuk terlebih dahulu.' };
  }

  if (session.user.role !== 'STAF_PENGIRIM') {
    return { success: false, error: 'Hanya Staf Pengirim yang berwenang mengunggah bukti manifest.' };
  }

  const result = await ManifestService.uploadSignedProof(manifestId, signedProofUrl, {
    id: session.user.id,
    name: session.user.name || session.user.username,
    role: session.user.role,
  });

  if (result.success) {
    revalidatePath(`/manifest/shipping?id=${manifestId}`);
    revalidatePath('/manifest');
  }

  return result;
}

export async function approveManifestAction(manifestId: string) {
  const session = await auth();
  if (!session?.user) {
    return { success: false, error: 'Anda harus masuk terlebih dahulu.' };
  }

  if (session.user.role !== 'STAF_PENGIRIM') {
    return { success: false, error: 'Hanya Staf Pengirim yang berwenang menyetujui pengiriman.' };
  }

  const result = await ManifestService.approveManifest(manifestId, {
    id: session.user.id,
    name: session.user.name || session.user.username,
    role: session.user.role,
  });

  if (result.success) {
    revalidatePath(`/manifest/shipping?id=${manifestId}`);
    revalidatePath('/manifest');
    revalidatePath('/monitoring');
  }

  return result;
}
