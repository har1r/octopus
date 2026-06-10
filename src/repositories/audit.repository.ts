// src/repositories/audit.repository.ts
import { prisma } from '@/lib/prisma';
import { AuditLog, Prisma } from '@prisma/client';

export class AuditRepository {
  static async create(data: Prisma.AuditLogCreateInput): Promise<AuditLog> {
    return prisma.auditLog.create({
      data,
    });
  }

  static async findByEntity(entityId: string): Promise<AuditLog[]> {
    return prisma.auditLog.findMany({
      where: { entityId },
      orderBy: { createdAt: 'desc' },
    });
  }

  static async findByUser(userId: string): Promise<AuditLog[]> {
    return prisma.auditLog.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    });
  }

  static async findAll(limit = 100): Promise<AuditLog[]> {
    return prisma.auditLog.findMany({
      orderBy: { createdAt: 'desc' },
      take: limit,
    });
  }
}
