// src/repositories/bundle.repository.ts
import { prisma } from '@/lib/prisma';
import { Bundle, Prisma, BundleStatus, ServiceType } from '@prisma/client';

export interface BundleFilters {
  status?: BundleStatus;
  statuses?: BundleStatus[];
  serviceType?: ServiceType;
  page?: number;
  limit?: number;
}

export class BundleRepository {
  static async create(data: Prisma.BundleCreateInput): Promise<Bundle> {
    return prisma.bundle.create({
      data,
    });
  }

  static async update(id: string, data: Prisma.BundleUpdateInput): Promise<Bundle> {
    return prisma.bundle.update({
      where: { id },
      data,
    });
  }

  static async delete(id: string): Promise<Bundle> {
    return prisma.bundle.delete({
      where: { id },
    });
  }

  static async findById(id: string) {
    const bundle = await prisma.bundle.findUnique({
      where: { id },
    });
    if (!bundle) return null;

    // Fetch related permohonan items manually since it's a manual ref
    const items = await prisma.permohonan.findMany({
      where: { bundleId: id },
      orderBy: { createdAt: 'desc' },
    });

    return { ...bundle, items };
  }

  static async findByBundleNumber(bundleNumber: string) {
    const bundle = await prisma.bundle.findUnique({
      where: { bundleNumber },
    });
    if (!bundle) return null;

    const items = await prisma.permohonan.findMany({
      where: { bundleId: bundle.id },
      orderBy: { createdAt: 'desc' },
    });

    return { ...bundle, items };
  }

  static async findFiltered(filters: BundleFilters): Promise<{ items: Bundle[]; total: number }> {
    const page = filters.page || 1;
    const limit = filters.limit || 10;
    const skip = (page - 1) * limit;

    const where: Prisma.BundleWhereInput = {};

    if (filters.status) {
      where.status = filters.status;
    } else if (filters.statuses) {
      where.status = { in: filters.statuses };
    }
    if (filters.serviceType) {
      where.serviceType = filters.serviceType;
    }

    const [items, total] = await Promise.all([
      prisma.bundle.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      prisma.bundle.count({ where }),
    ]);

    return { items, total };
  }

  static async generateBundleNumber(): Promise<string> {
    const currentYear = new Date().getFullYear();
    const prefix = `BND-${currentYear}-`;

    const lastRecord = await prisma.bundle.findFirst({
      where: {
        bundleNumber: {
          startsWith: prefix,
        },
      },
      orderBy: {
        bundleNumber: 'desc',
      },
      select: {
        bundleNumber: true,
      },
    });

    let nextNum = 1;
    if (lastRecord?.bundleNumber) {
      const parts = lastRecord.bundleNumber.split('-');
      const numPart = parseInt(parts[2], 10);
      if (!isNaN(numPart)) {
        nextNum = numPart + 1;
      }
    }

    const paddedNum = String(nextNum).padStart(5, '0');
    return `${prefix}${paddedNum}`;
  }

  static async findManyByIds(ids: string[]): Promise<Bundle[]> {
    return prisma.bundle.findMany({
      where: {
        id: { in: ids },
      },
      orderBy: { createdAt: 'desc' },
    });
  }
}
