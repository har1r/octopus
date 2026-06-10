// src/services/audit.service.ts
import { AuditRepository } from '@/repositories/audit.repository';
import { AuditLog } from '@prisma/client';
import { Result } from '@/types/result';

export class AuditService {
  static async log(params: {
    userId: string;
    userName: string;
    userRole: string;
    entityType: string;
    entityId: string;
    action: string;
    oldValue?: any;
    newValue?: any;
    ipAddress?: string | null;
    userAgent?: string | null;
  }): Promise<Result<AuditLog>> {
    try {
      const log = await AuditRepository.create({
        userId: params.userId,
        userName: params.userName,
        userRole: params.userRole,
        entityType: params.entityType,
        entityId: params.entityId,
        action: params.action,
        oldValue: params.oldValue ? JSON.parse(JSON.stringify(params.oldValue)) : undefined,
        newValue: params.newValue ? JSON.parse(JSON.stringify(params.newValue)) : undefined,
        ipAddress: params.ipAddress || null,
        userAgent: params.userAgent || null,
      });
      return { success: true, data: log };
    } catch (error: any) {
      console.error('Failed to write audit log:', error);
      return { success: false, error: error.message || 'Failed to create audit log' };
    }
  }

  static async getLogsForEntity(entityId: string): Promise<Result<AuditLog[]>> {
    try {
      const logs = await AuditRepository.findByEntity(entityId);
      return { success: true, data: logs };
    } catch (error: any) {
      return { success: false, error: error.message || 'Failed to fetch audit logs' };
    }
  }

  static async getLogsByUser(userId: string): Promise<Result<AuditLog[]>> {
    try {
      const logs = await AuditRepository.findByUser(userId);
      return { success: true, data: logs };
    } catch (error: any) {
      return { success: false, error: error.message || 'Failed to fetch audit logs' };
    }
  }

  static async getAllLogs(limit = 100): Promise<Result<AuditLog[]>> {
    try {
      const logs = await AuditRepository.findAll(limit);
      return { success: true, data: logs };
    } catch (error: any) {
      return { success: false, error: error.message || 'Failed to fetch audit logs' };
    }
  }
}
