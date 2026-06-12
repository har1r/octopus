// src/services/permohonan.service.ts
import { PermohonanRepository, PermohonanFilters } from '@/repositories/permohonan.repository';
import { AuditService } from '@/services/audit.service';
import { Result } from '@/types/result';
import { Permohonan, ApplicationStatus, ServiceType, Prisma } from '@prisma/client';
import { prisma } from '@/lib/prisma';
import { NotificationService } from '@/services/notification.service';
import { StorageClient } from '@/lib/storage';

export class PermohonanService {
  static async create(
    data: Omit<Prisma.PermohonanUncheckedCreateInput, 'nomorBerkas' | 'status' | 'createdById'>,
    user: { id: string; name: string; role: string }
  ): Promise<Result<Permohonan>> {
    try {
      // 1. Validate NOP format (18 digits)
      const cleanNop = data.nop.replace(/[^0-9]/g, '');
      if (cleanNop.length !== 18) {
        return { success: false, error: 'NOP wajib 18 digit angka.' };
      }

      // 2. Validate ServiceType specific rules
      if (data.serviceType === ServiceType.PENGAKTIFAN) {
        data.nomorPelayan = null; // bypass and clean
      } else {
        if (!data.nomorPelayan || data.nomorPelayan.trim() === '') {
          return { success: false, error: 'Nomor Pelayan wajib diisi untuk jenis layanan ini.' };
        }
      }

      // 3. Validate Mutasi Sebagian area sizes
      if (data.serviceType === ServiceType.MUTASI_SEBAGIAN) {
        const details = (data.details as any[]) || [];
        if (details.length === 0) {
          return { success: false, error: 'Mutasi sebagian wajib memiliki minimal 1 pecahan.' };
        }

        const oldLand = Number(data.oldLandArea) || 0;
        const oldBldg = Number(data.oldBuildingArea) || 0;

        let sumLand = 0;
        let sumBldg = 0;

        for (const detail of details) {
          sumLand += Number(detail.newLandArea) || 0;
          sumBldg += Number(detail.newBuildingArea) || 0;
        }

        if (sumLand > oldLand) {
          return { 
            success: false, 
            error: `Total luas tanah pecahan (${sumLand} m²) melebihi luas tanah asal (${oldLand} m²).` 
          };
        }
      }

      // 4. Generate Nomor Berkas and set status to SUBMITTED
      const nomorBerkas = await PermohonanRepository.generateNomorBerkas();
      const status = ApplicationStatus.SUBMITTED;

      // 5. Create Permohonan
      const created = await PermohonanRepository.create({
        ...data,
        nop: cleanNop,
        nomorBerkas,
        status,
        createdById: user.id,
      });

      // 6. Create Audit Log
      await AuditService.log({
        userId: user.id,
        userName: user.name,
        userRole: user.role,
        entityType: 'Permohonan',
        entityId: created.id,
        action: 'CREATE',
        newValue: created,
      });

      return { success: true, data: created };
    } catch (error: any) {
      console.error('Create Permohonan error:', error);
      return { success: false, error: error.message || 'Gagal membuat permohonan.' };
    }
  }

  static async update(
    id: string,
    data: Prisma.PermohonanUncheckedUpdateInput,
    user: { id: string; name: string; role: string }
  ): Promise<Result<Permohonan>> {
    try {
      const existing = await PermohonanRepository.findById(id);
      if (!existing) {
        return { success: false, error: 'Permohonan tidak ditemukan.' };
      }

      // BR-020: COMPLETED status is immutable
      if (existing.status === ApplicationStatus.COMPLETED) {
        return { success: false, error: 'Data dengan status COMPLETED bersifat permanen dan tidak dapat diubah.' };
      }

      // Validate NOP if changing
      if (data.nop && typeof data.nop === 'string') {
        const cleanNop = data.nop.replace(/[^0-9]/g, '');
        if (cleanNop.length !== 18) {
          return { success: false, error: 'NOP wajib 18 digit angka.' };
        }
        data.nop = cleanNop;
      }

      // Validate ServiceType / Nomor Pelayan rules if updating them
      const nextServiceType = (data.serviceType as ServiceType) || existing.serviceType;
      if (nextServiceType === ServiceType.PENGAKTIFAN) {
        data.nomorPelayan = null;
      } else if (data.nomorPelayan !== undefined) {
        const nextNomorPelayan = data.nomorPelayan as string | null;
        if (!nextNomorPelayan || nextNomorPelayan.trim() === '') {
          return { success: false, error: 'Nomor Pelayan wajib diisi untuk jenis layanan ini.' };
        }
      }

      // Validate Area limits for Mutasi Sebagian
      if (nextServiceType === ServiceType.MUTASI_SEBAGIAN) {
        const oldLand = Number(data.oldLandArea !== undefined ? data.oldLandArea : existing.oldLandArea) || 0;
        const oldBldg = Number(data.oldBuildingArea !== undefined ? data.oldBuildingArea : existing.oldBuildingArea) || 0;
        const details = (data.details as any[]) || existing.details || [];

        let sumLand = 0;
        let sumBldg = 0;

        for (const detail of details) {
          sumLand += Number(detail.newLandArea) || 0;
          sumBldg += Number(detail.newBuildingArea) || 0;
        }

        if (sumLand > oldLand) {
          return { 
            success: false, 
            error: `Total luas tanah pecahan (${sumLand} m²) melebihi luas tanah asal (${oldLand} m²).` 
          };
        }
      }

      const updatePayload: Prisma.PermohonanUncheckedUpdateInput = {
        ...data,
      };

      const isResubmission = existing.status === ApplicationStatus.REVISION;
      if (isResubmission) {
        updatePayload.status = ApplicationStatus.SUBMITTED;
      }

      const updated = await PermohonanRepository.update(id, updatePayload);

      // Log the update/resubmit
      await AuditService.log({
        userId: user.id,
        userName: user.name,
        userRole: user.role,
        entityType: 'Permohonan',
        entityId: id,
        action: isResubmission ? 'RESUBMIT' : 'UPDATE',
        oldValue: existing,
        newValue: updated,
      });

      return { success: true, data: updated };
    } catch (error: any) {
      console.error('Update Permohonan error:', error);
      return { success: false, error: error.message || 'Gagal mengubah permohonan.' };
    }
  }

  static async delete(
    id: string,
    user: { id: string; name: string; role: string }
  ): Promise<Result<Permohonan>> {
    try {
      const existing = await PermohonanRepository.findById(id);
      if (!existing) {
        return { success: false, error: 'Permohonan tidak ditemukan.' };
      }

      // Only delete draft/submitted/revision statuses
      if (existing.status !== ApplicationStatus.SUBMITTED && existing.status !== ApplicationStatus.REVISION) {
        return { success: false, error: 'Hanya permohonan dengan status SUBMITTED atau REVISION yang dapat dihapus.' };
      }

      // Check if it's already bundled
      if (existing.bundleId) {
        return { success: false, error: 'Permohonan tidak dapat dihapus karena sudah terikat dengan bundle.' };
      }

      const deleted = await PermohonanRepository.delete(id);

      // Log the delete
      await AuditService.log({
        userId: user.id,
        userName: user.name,
        userRole: user.role,
        entityType: 'Permohonan',
        entityId: id,
        action: 'DELETE',
        oldValue: existing,
      });

      return { success: true, data: deleted };
    } catch (error: any) {
      console.error('Delete Permohonan error:', error);
      return { success: false, error: error.message || 'Gagal menghapus permohonan.' };
    }
  }

  static async findById(id: string): Promise<Result<Permohonan>> {
    try {
      const permohonan = await PermohonanRepository.findById(id);
      if (!permohonan) {
        return { success: false, error: 'Permohonan tidak ditemukan.' };
      }
      return { success: true, data: permohonan };
    } catch (error: any) {
      return { success: false, error: error.message || 'Gagal mengambil detail permohonan.' };
    }
  }

  static async findFiltered(filters: PermohonanFilters): Promise<Result<{ items: Permohonan[]; total: number }>> {
    try {
      const result = await PermohonanRepository.findFiltered(filters);
      return { success: true, data: result };
    } catch (error: any) {
      return { success: false, error: error.message || 'Gagal mengambil daftar permohonan.' };
    }
  }

  static async requestRevision(
    id: string,
    revisionNote: string | null | undefined,
    user: { id: string; name: string; role: string }
  ): Promise<Result<Permohonan>> {
    try {
      const existing = await PermohonanRepository.findById(id);
      if (!existing) {
        return { success: false, error: 'Permohonan tidak ditemukan.' };
      }

      // Rollback B: If bundled, cannot revision directly
      if (existing.bundleId) {
        return { success: false, error: 'Permohonan masih terikat bundle. Keluarkan dari bundle terlebih dahulu.' };
      }

      if (existing.status !== ApplicationStatus.SUBMITTED) {
        return { success: false, error: 'Hanya permohonan dengan status SUBMITTED yang dapat diajukan revisi.' };
      }

      const updated = await PermohonanRepository.update(id, {
        status: ApplicationStatus.REVISION,
        revisionNote: revisionNote || null,
      });

      // Audit Log
      await AuditService.log({
        userId: user.id,
        userName: user.name,
        userRole: user.role,
        entityType: 'Permohonan',
        entityId: id,
        action: 'REVISION',
        oldValue: existing,
        newValue: updated,
      });

      // Send Notification (Fonnte)
      if (existing.applicantPhone) {
        await NotificationService.notifyPermohonanStatus(
          existing.nomorBerkas,
          ApplicationStatus.REVISION,
          existing.applicantPhone,
          revisionNote || undefined
        );
      }

      return { success: true, data: updated };
    } catch (error: any) {
      return { success: false, error: error.message || 'Gagal merubah status ke REVISION.' };
    }
  }

  static async rejectPermohonan(
    id: string,
    user: { id: string; name: string; role: string }
  ): Promise<Result<Permohonan>> {
    try {
      const existing = await PermohonanRepository.findById(id);
      if (!existing) {
        return { success: false, error: 'Permohonan tidak ditemukan.' };
      }

      // Rollback B: If bundled, cannot reject directly
      if (existing.bundleId) {
        return { success: false, error: 'Permohonan masih terikat bundle. Keluarkan dari bundle terlebih dahulu.' };
      }

      if (existing.status !== ApplicationStatus.SUBMITTED) {
        return { success: false, error: 'Hanya permohonan dengan status SUBMITTED yang dapat direject.' };
      }

      const updated = await PermohonanRepository.update(id, {
        status: ApplicationStatus.REJECTED,
      });

      // Audit Log
      await AuditService.log({
        userId: user.id,
        userName: user.name,
        userRole: user.role,
        entityType: 'Permohonan',
        entityId: id,
        action: 'REJECT',
        oldValue: existing,
        newValue: updated,
      });

      // Send Notification (Fonnte)
      if (existing.applicantPhone) {
        await NotificationService.notifyPermohonanStatus(
          existing.nomorBerkas,
          ApplicationStatus.REJECTED,
          existing.applicantPhone
        );
      }

      return { success: true, data: updated };
    } catch (error: any) {
      return { success: false, error: error.message || 'Gagal merubah status ke REJECTED.' };
    }
  }

  static async resubmitPermohonan(
    id: string,
    user: { id: string; name: string; role: string }
  ): Promise<Result<Permohonan>> {
    try {
      const existing = await PermohonanRepository.findById(id);
      if (!existing) {
        return { success: false, error: 'Permohonan tidak ditemukan.' };
      }

      if (existing.status !== ApplicationStatus.REVISION) {
        return { success: false, error: 'Hanya permohonan dengan status REVISION yang dapat di-resubmit.' };
      }

      const updated = await PermohonanRepository.update(id, {
        status: ApplicationStatus.SUBMITTED,
      });

      // Audit Log
      await AuditService.log({
        userId: user.id,
        userName: user.name,
        userRole: user.role,
        entityType: 'Permohonan',
        entityId: id,
        action: 'RESUBMIT',
        oldValue: existing,
        newValue: updated,
      });

      return { success: true, data: updated };
    } catch (error: any) {
      return { success: false, error: error.message || 'Gagal mengajukan kembali permohonan.' };
    }
  }

  static async uploadScanFile(
    permohonanId: string,
    fileData: { fileId: string; fileName: string; storageKey: string; mimeType: string; fileSize: number },
    user: { id: string; name: string; role: string }
  ): Promise<Result<Permohonan>> {
    try {
      const existing = await PermohonanRepository.findById(permohonanId);
      if (!existing) {
        return { success: false, error: 'Permohonan tidak ditemukan.' };
      }

      if (user.role !== 'STAF_PENGARSIP') {
        return { success: false, error: 'Hanya Staf Pengarsip yang berwenang mengunggah scan.' };
      }

      // Add to scanFiles array using prisma native push for MongoDB
      const updated = await prisma.permohonan.update({
        where: { id: permohonanId },
        data: {
          scanFiles: {
            push: {
              fileId: fileData.fileId,
              fileName: fileData.fileName,
              storageKey: fileData.storageKey,
              mimeType: fileData.mimeType,
              fileSize: fileData.fileSize,
              uploadedById: user.id,
              uploadedAt: new Date(),
            },
          },
        },
      });

      // Audit Log
      await AuditService.log({
        userId: user.id,
        userName: user.name,
        userRole: user.role,
        entityType: 'Permohonan',
        entityId: permohonanId,
        action: 'UPLOAD_SCAN',
        newValue: fileData,
      });

      return { success: true, data: updated };
    } catch (error: any) {
      console.error('Upload scan error:', error);
      return { success: false, error: error.message || 'Gagal menyimpan data scan.' };
    }
  }

  static async deleteScanFile(
    permohonanId: string,
    fileId: string,
    user: { id: string; name: string; role: string }
  ): Promise<Result<Permohonan>> {
    try {
      const existing = await PermohonanRepository.findById(permohonanId);
      if (!existing) {
        return { success: false, error: 'Permohonan tidak ditemukan.' };
      }

      if (user.role !== 'STAF_PENGARSIP') {
        return { success: false, error: 'Hanya Staf Pengarsip yang berwenang menghapus scan.' };
      }

      const fileToDelete = existing.scanFiles.find(f => f.fileId === fileId);
      if (!fileToDelete) {
        return { success: false, error: 'File scan tidak ditemukan.' };
      }

      // Filter scanFiles list
      const updatedScanFiles = existing.scanFiles.filter(f => f.fileId !== fileId);

      const updated = await prisma.permohonan.update({
        where: { id: permohonanId },
        data: {
          scanFiles: {
            set: updatedScanFiles,
          },
        },
      });

      // Delete physical file securely
      await StorageClient.deleteFile(fileToDelete.storageKey);

      // Audit Log
      await AuditService.log({
        userId: user.id,
        userName: user.name,
        userRole: user.role,
        entityType: 'Permohonan',
        entityId: permohonanId,
        action: 'DELETE_SCAN',
        oldValue: fileToDelete,
      });

      return { success: true, data: updated };
    } catch (error: any) {
      console.error('Delete scan error:', error);
      return { success: false, error: error.message || 'Gagal menghapus data scan.' };
    }
  }

  static async togglePermohonanCompletion(
    permohonanId: string,
    user: { id: string; name: string; role: string }
  ): Promise<Result<Permohonan>> {
    try {
      const existing = await PermohonanRepository.findById(permohonanId);
      if (!existing) {
        return { success: false, error: 'Permohonan tidak ditemukan.' };
      }

      if (user.role !== 'STAF_PEMANTAU') {
        return { success: false, error: 'Hanya Staf Pemantau yang berwenang memperbarui progress permohonan.' };
      }

      if (existing.status !== ApplicationStatus.SENT_TO_CENTER) {
        return { success: false, error: 'Hanya permohonan dengan status SENT_TO_CENTER yang dapat diselesaikan.' };
      }

      const updated = await PermohonanRepository.update(permohonanId, {
        status: ApplicationStatus.COMPLETED,
      });

      // Audit Log
      await AuditService.log({
        userId: user.id,
        userName: user.name,
        userRole: user.role,
        entityType: 'Permohonan',
        entityId: permohonanId,
        action: 'COMPLETE_PERMOHONAN',
        oldValue: existing,
        newValue: updated,
      });

      // Send Notification (Fonnte)
      if (existing.applicantPhone) {
        await NotificationService.notifyPermohonanStatus(
          existing.nomorBerkas,
          ApplicationStatus.COMPLETED,
          existing.applicantPhone
        );
      }

      return { success: true, data: updated };
    } catch (error: any) {
      console.error('Toggle completion error:', error);
      return { success: false, error: error.message || 'Gagal menyelesaikan permohonan.' };
    }
  }
}
