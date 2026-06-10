// src/repositories/manifest.repository.ts
import { prisma } from '@/lib/prisma';
import { Manifest, Prisma, ManifestStatus } from '@prisma/client';

export interface ManifestFilters {
  status?: ManifestStatus;
  page?: number;
  limit?: number;
}

export class ManifestRepository {
  static async create(data: Prisma.ManifestCreateInput): Promise<Manifest> {
    return prisma.manifest.create({
      data,
    });
  }

  static async update(id: string, data: Prisma.ManifestUpdateInput): Promise<Manifest> {
    return prisma.manifest.update({
      where: { id },
      data,
    });
  }

  static async delete(id: string): Promise<Manifest> {
    return prisma.manifest.delete({
      where: { id },
    });
  }

  static async findById(id: string): Promise<Manifest | null> {
    return prisma.manifest.findUnique({
      where: { id },
    });
  }

  static async findByManifestNumber(manifestNumber: string): Promise<Manifest | null> {
    return prisma.manifest.findUnique({
      where: { manifestNumber },
    });
  }

  static async findFiltered(filters: ManifestFilters): Promise<{ items: Manifest[]; total: number }> {
    const page = filters.page || 1;
    const limit = filters.limit || 10;
    const skip = (page - 1) * limit;

    const where: Prisma.ManifestWhereInput = {};

    if (filters.status) {
      where.status = filters.status;
    }

    const [items, total] = await Promise.all([
      prisma.manifest.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      prisma.manifest.count({ where }),
    ]);

    return { items, total };
  }

  static async generateManifestNumber(): Promise<string> {
    const currentYear = new Date().getFullYear();
    const prefix = `MNF-${currentYear}-`;

    const lastRecord = await prisma.manifest.findFirst({
      where: {
        manifestNumber: {
          startsWith: prefix,
        },
      },
      orderBy: {
        manifestNumber: 'desc',
      },
      select: {
        manifestNumber: true,
      },
    });

    let nextNum = 1;
    if (lastRecord?.manifestNumber) {
      const parts = lastRecord.manifestNumber.split('-');
      const numPart = parseInt(parts[2], 10);
      if (!isNaN(numPart)) {
        nextNum = numPart + 1;
      }
    }

    const paddedNum = String(nextNum).padStart(5, '0');
    return `${prefix}${paddedNum}`;
  }
}
