// src/services/bundle.service.ts
import { BundleRepository, BundleFilters } from '@/repositories/bundle.repository';
import { PermohonanRepository } from '@/repositories/permohonan.repository';
import { AuditService } from '@/services/audit.service';
import { Result } from '@/types/result';
import { prisma } from '@/lib/prisma';
import { Bundle, BundleStatus, ServiceType, ApplicationStatus, Permohonan } from '@prisma/client';

export class BundleService {
  static async createBundle(
    permohonanIds: string[],
    user: { id: string; name: string; role: string }
  ): Promise<Result<Bundle>> {
    try {
      // BR-002: Validate bundle size limits
      if (permohonanIds.length === 0) {
        return { success: false, error: 'Pilih minimal 1 berkas permohonan untuk membuat bundle.' };
      }
      if (permohonanIds.length > 20) {
        return { success: false, error: 'Satu bundle maksimal berisi 20 berkas permohonan.' };
      }

      // Fetch all selected permohonan items
      const items = await PermohonanRepository.findManyByIds(permohonanIds);
      if (items.length !== permohonanIds.length) {
        return { success: false, error: 'Beberapa permohonan tidak ditemukan.' };
      }

      // Check that all selected items are not yet bundled and are in SUBMITTED state
      const invalidItem = items.find(item => item.bundleId || item.status !== ApplicationStatus.SUBMITTED);
      if (invalidItem) {
        return { 
          success: false, 
          error: `Berkas ${invalidItem.nomorBerkas} tidak valid untuk dimasukkan ke dalam bundle (sudah terikat bundle lain atau status bukan SUBMITTED).` 
        };
      }

      // BR-001: Validate that all selected items have the same service type
      const serviceType = items[0].serviceType;
      const hasDifferentType = items.some(item => item.serviceType !== serviceType);
      if (hasDifferentType) {
        return { success: false, error: 'BR-001: Semua permohonan dalam satu bundle wajib memiliki jenis pelayanan yang sama.' };
      }

      // Generate bundle number
      const bundleNumber = await BundleRepository.generateBundleNumber();
      const status = BundleStatus.DRAFT_BUNDLE;

      // Create bundle database record
      const bundle = await BundleRepository.create({
        bundleNumber,
        serviceType,
        status,
        itemCount: items.length,
        createdById: user.id,
      });

      // Update permohonan items to DRAFT_BUNDLE state and link to bundleId
      for (const item of items) {
        await PermohonanRepository.update(item.id, {
          bundleId: bundle.id,
          status: ApplicationStatus.DRAFT_BUNDLE,
        });
      }

      // Log the bundle creation action
      await AuditService.log({
        userId: user.id,
        userName: user.name,
        userRole: user.role,
        entityType: 'Bundle',
        entityId: bundle.id,
        action: 'CREATE_BUNDLE',
        newValue: { bundle, permohonanIds },
      });

      return { success: true, data: bundle };
    } catch (error: any) {
      console.error('Create Bundle error:', error);
      return { success: false, error: error.message || 'Gagal membuat bundle.' };
    }
  }

  static async addItemToBundle(
    bundleId: string,
    permohonanId: string,
    user: { id: string; name: string; role: string }
  ): Promise<Result<Bundle>> {
    try {
      const bundle = await BundleRepository.findById(bundleId);
      if (!bundle) {
        return { success: false, error: 'Bundle tidak ditemukan.' };
      }

      // BR-003: check bundle status flexibility
      if (bundle.status !== BundleStatus.DRAFT_BUNDLE && bundle.status !== BundleStatus.RE_EXAMINE) {
        return { success: false, error: 'Berkas hanya dapat ditambahkan pada bundle berstatus DRAFT_BUNDLE atau RE_EXAMINE.' };
      }

      // BR-002: max limit check
      if (bundle.itemCount >= 20) {
        return { success: false, error: 'Satu bundle maksimal berisi 20 berkas permohonan.' };
      }

      const permohonan = await PermohonanRepository.findById(permohonanId);
      if (!permohonan) {
        return { success: false, error: 'Permohonan tidak ditemukan.' };
      }

      if (permohonan.bundleId) {
        return { success: false, error: 'Permohonan sudah terikat dengan bundle lain.' };
      }

      // Permohonan must be in SUBMITTED state to be added
      if (permohonan.status !== ApplicationStatus.SUBMITTED) {
        return { success: false, error: 'Hanya permohonan dengan status SUBMITTED yang dapat dimasukkan ke dalam bundle.' };
      }

      // BR-001: service type alignment
      if (permohonan.serviceType !== bundle.serviceType) {
        return { success: false, error: 'Jenis pelayanan permohonan tidak cocok dengan jenis pelayanan bundle.' };
      }

      // Sync status
      const nextStatus = bundle.status === BundleStatus.DRAFT_BUNDLE 
        ? ApplicationStatus.DRAFT_BUNDLE 
        : ApplicationStatus.RE_EXAMINE;

      await PermohonanRepository.update(permohonanId, {
        bundleId,
        status: nextStatus,
      });

      const updatedBundle = await BundleRepository.update(bundleId, {
        itemCount: bundle.itemCount + 1,
        // BR-006: Auto cover letter url regeneration
        coverLetterUrl: `/api/bundles/${bundleId}/cover-letter.pdf?t=${Date.now()}`,
      });

      // Audit Log
      await AuditService.log({
        userId: user.id,
        userName: user.name,
        userRole: user.role,
        entityType: 'Bundle',
        entityId: bundleId,
        action: 'ADD_BUNDLE_ITEM',
        newValue: { permohonanId },
      });

      return { success: true, data: updatedBundle };
    } catch (error: any) {
      return { success: false, error: error.message || 'Gagal menambahkan berkas ke bundle.' };
    }
  }

  static async removeItemFromBundle(
    bundleId: string,
    permohonanId: string,
    user: { id: string; name: string; role: string }
  ): Promise<Result<Bundle>> {
    try {
      const bundle = await BundleRepository.findById(bundleId);
      if (!bundle) {
        return { success: false, error: 'Bundle tidak ditemukan.' };
      }

      // BR-003: check bundle status flexibility
      if (bundle.status !== BundleStatus.DRAFT_BUNDLE && bundle.status !== BundleStatus.RE_EXAMINE) {
        return { success: false, error: 'Berkas hanya dapat dikeluarkan pada bundle berstatus DRAFT_BUNDLE atau RE_EXAMINE.' };
      }

      const permohonan = await PermohonanRepository.findById(permohonanId);
      if (!permohonan || permohonan.bundleId !== bundleId) {
        return { success: false, error: 'Permohonan tidak ditemukan di dalam bundle ini.' };
      }

      // Reset permohonan state back to SUBMITTED and clear bundle link
      await PermohonanRepository.update(permohonanId, {
        bundleId: null,
        status: ApplicationStatus.SUBMITTED,
      });

      const updatedBundle = await BundleRepository.update(bundleId, {
        itemCount: Math.max(0, bundle.itemCount - 1),
        // BR-006: Auto cover letter url regeneration
        coverLetterUrl: `/api/bundles/${bundleId}/cover-letter.pdf?t=${Date.now()}`,
      });

      // Audit Log
      await AuditService.log({
        userId: user.id,
        userName: user.name,
        userRole: user.role,
        entityType: 'Bundle',
        entityId: bundleId,
        action: 'REMOVE_BUNDLE_ITEM',
        oldValue: { permohonanId },
      });

      return { success: true, data: updatedBundle };
    } catch (error: any) {
      return { success: false, error: error.message || 'Gagal mengeluarkan berkas dari bundle.' };
    }
  }

  static async finalizeBundle(
    bundleId: string,
    user: { id: string; name: string; role: string }
  ): Promise<Result<Bundle>> {
    try {
      const bundle = await BundleRepository.findById(bundleId);
      if (!bundle) {
        return { success: false, error: 'Bundle tidak ditemukan.' };
      }

      if (bundle.status !== BundleStatus.DRAFT_BUNDLE && bundle.status !== BundleStatus.RE_EXAMINE) {
        return { success: false, error: 'Hanya bundle berstatus DRAFT_BUNDLE atau RE_EXAMINE yang dapat difinalisasi.' };
      }

      if (bundle.itemCount === 0) {
        return { success: false, error: 'Bundle kosong tidak dapat difinalisasi.' };
      }

      // Finalize: move status to READY_TO_ARCHIVE
      const updatedBundle = await BundleRepository.update(bundleId, {
        status: BundleStatus.READY_TO_ARCHIVE,
        coverLetterUrl: `/api/bundles/${bundleId}/cover-letter.pdf`,
      });

      // Update all items in this bundle to READY_TO_ARCHIVE
      const items = await prisma.permohonan.findMany({ where: { bundleId } });
      for (const item of items) {
        await PermohonanRepository.update(item.id, {
          status: ApplicationStatus.READY_TO_ARCHIVE,
        });
      }

      // Audit Log
      await AuditService.log({
        userId: user.id,
        userName: user.name,
        userRole: user.role,
        entityType: 'Bundle',
        entityId: bundleId,
        action: 'FINALIZE_BUNDLE',
        oldValue: bundle,
        newValue: updatedBundle,
      });

      return { success: true, data: updatedBundle };
    } catch (error: any) {
      return { success: false, error: error.message || 'Gagal memfinalisasi bundle.' };
    }
  }

  static async reExamineBundle(
    bundleId: string,
    user: { id: string; name: string; role: string }
  ): Promise<Result<Bundle>> {
    try {
      const bundle = await BundleRepository.findById(bundleId);
      if (!bundle) {
        return { success: false, error: 'Bundle tidak ditemukan.' };
      }

      if (bundle.status !== BundleStatus.READY_TO_ARCHIVE) {
        return { success: false, error: 'Hanya bundle berstatus READY_TO_ARCHIVE yang dapat dikembalikan ke penelitian.' };
      }

      // Re-examine: move status to RE_EXAMINE
      const updatedBundle = await BundleRepository.update(bundleId, {
        status: BundleStatus.RE_EXAMINE,
      });

      // Update all items in this bundle to RE_EXAMINE
      const items = await prisma.permohonan.findMany({ where: { bundleId } });
      for (const item of items) {
        await PermohonanRepository.update(item.id, {
          status: ApplicationStatus.RE_EXAMINE,
        });
      }

      // Audit Log
      await AuditService.log({
        userId: user.id,
        userName: user.name,
        userRole: user.role,
        entityType: 'Bundle',
        entityId: bundleId,
        action: 'RE_EXAMINE_BUNDLE',
        oldValue: bundle,
        newValue: updatedBundle,
      });

      return { success: true, data: updatedBundle };
    } catch (error: any) {
      return { success: false, error: error.message || 'Gagal mengembalikan bundle ke penelitian.' };
    }
  }

  static async approveBundleArchiving(
    bundleId: string,
    user: { id: string; name: string; role: string }
  ): Promise<Result<Bundle>> {
    try {
      const bundle = await BundleRepository.findById(bundleId);
      if (!bundle) {
        return { success: false, error: 'Bundle tidak ditemukan.' };
      }

      if (bundle.status !== BundleStatus.READY_TO_ARCHIVE) {
        return { success: false, error: 'Hanya bundle berstatus READY_TO_ARCHIVE yang dapat disetujui pengarsipannya.' };
      }

      if (user.role !== 'STAF_PENGARSIP') {
        return { success: false, error: 'Hanya Staf Pengarsip yang berwenang menyetujui pengarsipan.' };
      }

      // BR-012 check: 100% items in bundle must have at least one scan uploaded
      const items = await prisma.permohonan.findMany({ where: { bundleId } });
      const allUploaded = items.every(item => item.scanFiles.length > 0);

      if (!allUploaded) {
        return { 
          success: false, 
          error: 'BR-012: Seluruh berkas permohonan dalam bundle ini wajib memiliki dokumen scan terunggah.' 
        };
      }

      // Update bundle status to READY_TO_SHIP
      const updatedBundle = await BundleRepository.update(bundleId, {
        status: BundleStatus.READY_TO_SHIP,
      });

      // Update all items status to READY_TO_SHIP
      for (const item of items) {
        await PermohonanRepository.update(item.id, {
          status: ApplicationStatus.READY_TO_SHIP,
        });
      }

      // Audit Log
      await AuditService.log({
        userId: user.id,
        userName: user.name,
        userRole: user.role,
        entityType: 'Bundle',
        entityId: bundleId,
        action: 'APPROVE_ARCHIVE_BUNDLE',
        oldValue: bundle,
        newValue: updatedBundle,
      });

      return { success: true, data: updatedBundle };
    } catch (error: any) {
      return { success: false, error: error.message || 'Gagal menyetujui pengarsipan bundle.' };
    }
  }

  static async findById(id: string) {
    try {
      const bundle = await BundleRepository.findById(id);
      if (!bundle) {
        return { success: false, error: 'Bundle tidak ditemukan.' };
      }
      return { success: true, data: bundle };
    } catch (error: any) {
      return { success: false, error: error.message || 'Gagal mengambil data bundle.' };
    }
  }

  static async findFiltered(filters: BundleFilters): Promise<Result<{ items: Bundle[]; total: number }>> {
    try {
      const result = await BundleRepository.findFiltered(filters);
      return { success: true, data: result };
    } catch (error: any) {
      return { success: false, error: error.message || 'Gagal mengambil daftar bundle.' };
    }
  }

  static async completeBundle(
    bundleId: string,
    user: { id: string; name: string; role: string }
  ): Promise<Result<Bundle>> {
    try {
      const bundle = await BundleRepository.findById(bundleId);
      if (!bundle) {
        return { success: false, error: 'Bundle tidak ditemukan.' };
      }

      if (bundle.status !== BundleStatus.SENT_TO_CENTER) {
        return { success: false, error: 'Hanya bundle berstatus SENT_TO_CENTER yang dapat diselesaikan.' };
      }

      if (user.role !== 'STAF_PEMANTAU') {
        return { success: false, error: 'Hanya Staf Pemantau yang berwenang menyelesaikan bundle.' };
      }

      // BR-015 check: 100% permohonan completed
      const items = await prisma.permohonan.findMany({ where: { bundleId } });
      const allCompleted = items.every(item => item.status === ApplicationStatus.COMPLETED);

      if (!allCompleted) {
        return { 
          success: false, 
          error: 'BR-015: Seluruh permohonan di dalam bundle wajib berstatus COMPLETED sebelum bundle diselesaikan.' 
        };
      }

      // Update bundle status to COMPLETED
      const updatedBundle = await BundleRepository.update(bundleId, {
        status: BundleStatus.COMPLETED,
      });

      // Audit Log
      await AuditService.log({
        userId: user.id,
        userName: user.name,
        userRole: user.role,
        entityType: 'Bundle',
        entityId: bundleId,
        action: 'COMPLETE_BUNDLE',
        oldValue: bundle,
        newValue: updatedBundle,
      });

      return { success: true, data: updatedBundle };
    } catch (error: any) {
      console.error('Complete bundle error:', error);
      return { success: false, error: error.message || 'Gagal menyelesaikan bundle.' };
    }
  }
}
