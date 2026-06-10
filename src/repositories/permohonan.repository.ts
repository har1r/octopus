// src/repositories/permohonan.repository.ts
import { prisma } from '@/lib/prisma';
import { Permohonan, Prisma, ApplicationStatus, ServiceType } from '@prisma/client';

export interface PermohonanFilters {
  status?: ApplicationStatus;
  serviceType?: ServiceType;
  nop?: string;
  createdById?: string;
  bundleId?: string | null;
  page?: number;
  limit?: number;
}

export class PermohonanRepository {
  static async create(data: Prisma.PermohonanCreateInput): Promise<Permohonan> {
    return prisma.permohonan.create({
      data,
    });
  }

  static async update(id: string, data: Prisma.PermohonanUpdateInput): Promise<Permohonan> {
    return prisma.permohonan.update({
      where: { id },
      data,
    });
  }

  static async delete(id: string): Promise<Permohonan> {
    return prisma.permohonan.delete({
      where: { id },
    });
  }

  static async findById(id: string): Promise<Permohonan | null> {
    return prisma.permohonan.findUnique({
      where: { id },
    });
  }

  static async findByNomorBerkas(nomorBerkas: string): Promise<Permohonan | null> {
    return prisma.permohonan.findUnique({
      where: { nomorBerkas },
    });
  }

  static async findManyByIds(ids: string[]): Promise<Permohonan[]> {
    return prisma.permohonan.findMany({
      where: { id: { in: ids } },
    });
  }

  static async countByBundleId(bundleId: string): Promise<number> {
    return prisma.permohonan.count({
      where: { bundleId },
    });
  }

  static async findFiltered(filters: PermohonanFilters): Promise<{ items: Permohonan[]; total: number }> {
    const page = filters.page || 1;
    const limit = filters.limit || 10;
    const skip = (page - 1) * limit;

    const where: Prisma.PermohonanWhereInput = {};

    if (filters.status) {
      where.status = filters.status;
    }
    if (filters.serviceType) {
      where.serviceType = filters.serviceType;
    }
    if (filters.nop) {
      // Remove dots and hyphens from search query for indexed search on clean NOP
      const cleanNop = filters.nop.replace(/[^0-9]/g, '');
      where.nop = { contains: cleanNop };
    }
    if (filters.createdById) {
      where.createdById = filters.createdById;
    }
    if (filters.bundleId !== undefined) {
      where.bundleId = filters.bundleId;
    }

    const [items, total] = await Promise.all([
      prisma.permohonan.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      prisma.permohonan.count({ where }),
    ]);

    return { items, total };
  }

  // Generates automatic consecutive berkas number for the year, e.g. ATX-2026-00001
  static async generateNomorBerkas(): Promise<string> {
    const currentYear = new Date().getFullYear();
    const prefix = `ATX-${currentYear}-`;

    const lastRecord = await prisma.permohonan.findFirst({
      where: {
        nomorBerkas: {
          startsWith: prefix,
        },
      },
      orderBy: {
        nomorBerkas: 'desc',
      },
      select: {
        nomorBerkas: true,
      },
    });

    let nextNum = 1;
    if (lastRecord?.nomorBerkas) {
      const parts = lastRecord.nomorBerkas.split('-');
      const numPart = parseInt(parts[2], 10);
      if (!isNaN(numPart)) {
        nextNum = numPart + 1;
      }
    }

    const paddedNum = String(nextNum).padStart(5, '0');
    return `${prefix}${paddedNum}`;
  }
}
