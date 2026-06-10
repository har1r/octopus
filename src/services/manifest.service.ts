// src/services/manifest.service.ts
import { ManifestRepository, ManifestFilters } from '@/repositories/manifest.repository';
import { BundleRepository } from '@/repositories/bundle.repository';
import { PermohonanRepository } from '@/repositories/permohonan.repository';
import { AuditService } from '@/services/audit.service';
import { Result } from '@/types/result';
import { Manifest, ManifestStatus, BundleStatus, ApplicationStatus, Prisma } from '@prisma/client';
import { prisma } from '@/lib/prisma';
import { StorageClient } from '@/lib/storage';
import { NotificationService } from '@/services/notification.service';

export class ManifestService {
  static async createManifest(
    bundleIds: string[],
    user: { id: string; name: string; role: string }
  ): Promise<Result<Manifest>> {
    try {
      const manifestNumber = await ManifestRepository.generateManifestNumber();

      const manifest = await ManifestRepository.create({
        manifestNumber,
        status: ManifestStatus.DRAFT,
        bundleIds,
      });

      // Update bundles to ensure status is synced (remains READY_TO_SHIP but now linked to a manifest conceptually)
      // We will handle this status transition during manifest approval.
      
      await AuditService.log({
        userId: user.id,
        userName: user.name,
        userRole: user.role,
        entityType: 'Manifest',
        entityId: manifest.id,
        action: 'CREATE_MANIFEST',
        newValue: { manifest, bundleIds },
      });

      return { success: true, data: manifest };
    } catch (error: any) {
      console.error('Create Manifest error:', error);
      return { success: false, error: error.message || 'Gagal membuat manifest.' };
    }
  }

  static async addBundleToManifest(
    manifestId: string,
    bundleId: string,
    user: { id: string; name: string; role: string }
  ): Promise<Result<Manifest>> {
    try {
      const manifest = await ManifestRepository.findById(manifestId);
      if (!manifest) {
        return { success: false, error: 'Manifest tidak ditemukan.' };
      }

      if (manifest.status === ManifestStatus.APPROVED) {
        return { success: false, error: 'Manifest yang telah disetujui tidak dapat diubah.' };
      }

      const bundle = await BundleRepository.findById(bundleId);
      if (!bundle) {
        return { success: false, error: 'Bundle tidak ditemukan.' };
      }

      if (bundle.status !== BundleStatus.READY_TO_SHIP) {
        return { success: false, error: 'Hanya bundle berstatus READY_TO_SHIP yang dapat dimasukkan ke manifest.' };
      }

      // Add bundleId to manifest
      const updatedBundleIds = [...manifest.bundleIds, bundleId];
      
      // If we add a bundle, old signed proof is invalidated (BR-014)
      const oldSignedProof = manifest.signedProofUrl;

      const updatedManifest = await ManifestRepository.update(manifestId, {
        bundleIds: updatedBundleIds,
        signedProofUrl: null, // Reset proof (BR-014)
        status: ManifestStatus.DRAFT, // Reset status to draft for resigning
      });

      if (oldSignedProof) {
        // Parse key from URL or delete from storage
        const storageKey = oldSignedProof.split('key=').pop() || '';
        if (storageKey) await StorageClient.deleteFile(storageKey);
      }

      await AuditService.log({
        userId: user.id,
        userName: user.name,
        userRole: user.role,
        entityType: 'Manifest',
        entityId: manifestId,
        action: 'ADD_MANIFEST_BUNDLE',
        newValue: { bundleId },
      });

      return { success: true, data: updatedManifest };
    } catch (error: any) {
      return { success: false, error: error.message || 'Gagal menambahkan bundle ke manifest.' };
    }
  }

  static async removeBundleFromManifest(
    manifestId: string,
    bundleId: string,
    user: { id: string; name: string; role: string }
  ): Promise<Result<Manifest>> {
    try {
      const manifest = await ManifestRepository.findById(manifestId);
      if (!manifest) {
        return { success: false, error: 'Manifest tidak ditemukan.' };
      }

      if (manifest.status === ManifestStatus.APPROVED) {
        return { success: false, error: 'Manifest yang telah disetujui tidak dapat diubah.' };
      }

      const bundle = await BundleRepository.findById(bundleId);
      if (!bundle) {
        return { success: false, error: 'Bundle tidak ditemukan.' };
      }

      // Check if bundle is indeed in this manifest
      if (!manifest.bundleIds.includes(bundleId)) {
        return { success: false, error: 'Bundle tidak ditemukan di manifest ini.' };
      }

      // Shipping Rollback (BR-014 & WORKFLOW.md)
      // 1. Remove bundleId from manifest
      const updatedBundleIds = manifest.bundleIds.filter(id => id !== bundleId);

      // 2. Delete old manifest proof
      const oldSignedProof = manifest.signedProofUrl;

      const updatedManifest = await ManifestRepository.update(manifestId, {
        bundleIds: updatedBundleIds,
        signedProofUrl: null, // require reupload (BR-014)
        status: ManifestStatus.DRAFT,
      });

      if (oldSignedProof) {
        const storageKey = oldSignedProof.split('key=').pop() || '';
        if (storageKey) await StorageClient.deleteFile(storageKey);
      }

      // 3. Demote bundle status back to RE_EXAMINE
      await BundleRepository.update(bundleId, {
        status: BundleStatus.RE_EXAMINE,
      });

      // 4. Demote all permohonan inside this bundle to RE_EXAMINE
      for (const item of bundle.items) {
        await PermohonanRepository.update(item.id, {
          status: ApplicationStatus.RE_EXAMINE,
        });
      }

      await AuditService.log({
        userId: user.id,
        userName: user.name,
        userRole: user.role,
        entityType: 'Manifest',
        entityId: manifestId,
        action: 'REMOVE_MANIFEST_BUNDLE_ROLLBACK',
        oldValue: { bundleId },
      });

      return { success: true, data: updatedManifest };
    } catch (error: any) {
      return { success: false, error: error.message || 'Gagal mengeluarkan bundle dari manifest.' };
    }
  }

  static async uploadSignedProof(
    manifestId: string,
    signedProofUrl: string,
    user: { id: string; name: string; role: string }
  ): Promise<Result<Manifest>> {
    try {
      const manifest = await ManifestRepository.findById(manifestId);
      if (!manifest) {
        return { success: false, error: 'Manifest tidak ditemukan.' };
      }

      if (manifest.status === ManifestStatus.APPROVED) {
        return { success: false, error: 'Manifest yang telah disetujui tidak dapat diubah.' };
      }

      const updated = await ManifestRepository.update(manifestId, {
        signedProofUrl,
        status: ManifestStatus.WAITING_SIGNATURE, // Move to waiting signature verification
      });

      await AuditService.log({
        userId: user.id,
        userName: user.name,
        userRole: user.role,
        entityType: 'Manifest',
        entityId: manifestId,
        action: 'UPLOAD_MANIFEST_PROOF',
        newValue: { signedProofUrl },
      });

      return { success: true, data: updated };
    } catch (error: any) {
      return { success: false, error: error.message || 'Gagal mengunggah bukti manifest.' };
    }
  }

  static async approveManifest(
    manifestId: string,
    user: { id: string; name: string; role: string }
  ): Promise<Result<Manifest>> {
    try {
      const manifest = await ManifestRepository.findById(manifestId);
      if (!manifest) {
        return { success: false, error: 'Manifest tidak ditemukan.' };
      }

      // BR-013 Check: signedManifestUploaded = true
      if (!manifest.signedProofUrl) {
        return { success: false, error: 'BR-013: Bukti manifest bertanda tangan wajib diunggah sebelum persetujuan.' };
      }

      if (manifest.bundleIds.length === 0) {
        return { success: false, error: 'Manifest kosong tidak dapat disetujui.' };
      }

      // Approve: move to APPROVED
      const updatedManifest = await ManifestRepository.update(manifestId, {
        status: ManifestStatus.APPROVED,
        approvedAt: new Date(),
        approvedById: user.id,
      });

      // Update all bundles in manifest to SENT_TO_CENTER
      for (const bundleId of manifest.bundleIds) {
        await BundleRepository.update(bundleId, {
          status: BundleStatus.SENT_TO_CENTER,
        });

        // Update all permohonan inside those bundles to SENT_TO_CENTER
        const permohonans = await prisma.permohonan.findMany({ where: { bundleId } });
        for (const item of permohonans) {
          await PermohonanRepository.update(item.id, {
            status: ApplicationStatus.SENT_TO_CENTER,
          });

          // WhatsApp notifications logic for SENT_TO_CENTER
          if (item.applicantPhone) {
            await NotificationService.notifyPermohonanStatus(
              item.nomorBerkas,
              ApplicationStatus.SENT_TO_CENTER,
              item.applicantPhone
            );
          }
        }
      }

      await AuditService.log({
        userId: user.id,
        userName: user.name,
        userRole: user.role,
        entityType: 'Manifest',
        entityId: manifestId,
        action: 'APPROVE_SHIPPING_MANIFEST',
        oldValue: manifest,
        newValue: updatedManifest,
      });

      return { success: true, data: updatedManifest };
    } catch (error: any) {
      return { success: false, error: error.message || 'Gagal menyetujui manifest.' };
    }
  }

  static async findById(id: string) {
    try {
      const manifest = await ManifestRepository.findById(id);
      if (!manifest) {
        return { success: false, error: 'Manifest tidak ditemukan.' };
      }
      return { success: true, data: manifest };
    } catch (error: any) {
      return { success: false, error: error.message || 'Gagal mengambil data manifest.' };
    }
  }

  static async findFiltered(filters: ManifestFilters): Promise<Result<{ items: Manifest[]; total: number }>> {
    try {
      const result = await ManifestRepository.findFiltered(filters);
      return { success: true, data: result };
    } catch (error: any) {
      return { success: false, error: error.message || 'Gagal mengambil daftar manifest.' };
    }
  }
}
