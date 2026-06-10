// src/app/api/cron/expire-revisions/route.ts
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { ApplicationStatus } from '@prisma/client';
import { AuditService } from '@/services/audit.service';

/**
 * Year-End Scheduler Execution (BR-016 & BR-017)
 * Endpoint: GET /api/cron/expire-revisions
 * Securing the endpoint using a secret query parameter or CRON_SECRET env.
 */
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const secret = searchParams.get('secret');
    const cronSecret = process.env.CRON_SECRET || 'dev_secret';

    if (secret !== cronSecret) {
      return NextResponse.json({ error: 'Unauthorized: Invalid secret' }, { status: 401 });
    }

    // Find all permohonan that are currently in REVISION status
    const lingeringRevisions = await prisma.permohonan.findMany({
      where: {
        status: ApplicationStatus.REVISION
      }
    });

    console.log(`[Scheduler] Found ${lingeringRevisions.length} lingering REVISION files to expire.`);

    const expiredIds: string[] = [];
    
    // Transition each permohonan to REJECTED_PERMANENT and write an immutable AuditLog
    for (const item of lingeringRevisions) {
      const updated = await prisma.permohonan.update({
        where: { id: item.id },
        data: { status: ApplicationStatus.REJECTED_PERMANENT }
      });

      await AuditService.log({
        userId: 'SYSTEM_SCHEDULER',
        userName: 'Year-End Cron Scheduler',
        userRole: 'SYSTEM',
        entityType: 'Permohonan',
        entityId: item.id,
        action: 'AUTO_EXPIRE_REVISION',
        oldValue: item,
        newValue: updated
      });

      expiredIds.push(item.id);
    }

    return NextResponse.json({
      success: true,
      message: `Successfully expired ${expiredIds.length} permohonan files.`,
      expiredCount: expiredIds.length,
      expiredIds
    });
  } catch (error: any) {
    console.error('[Scheduler] Error running revision expiry cron:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
