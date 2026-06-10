// src/app/api/analytics/dashboard/route.ts
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { ApplicationStatus } from '@prisma/client';
import { auth } from '@/auth';

export async function GET() {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const total = await prisma.permohonan.count();
    const inProgress = await prisma.permohonan.count({
      where: {
        status: {
          notIn: [
            ApplicationStatus.COMPLETED,
            ApplicationStatus.REJECTED,
            ApplicationStatus.REJECTED_PERMANENT
          ]
        }
      }
    });

    const completed = await prisma.permohonan.count({
      where: { status: ApplicationStatus.COMPLETED }
    });

    // Count how many files have ever been sent to REVISION via audit logs
    const revisedCount = await prisma.auditLog.count({
      where: {
        action: 'REVISION',
        entityType: 'Permohonan'
      }
    });

    const revisionRatio = total > 0 ? (revisedCount / total) * 100 : 0;

    return NextResponse.json({
      success: true,
      data: {
        total,
        inProgress,
        completed,
        revisionRatio: parseFloat(revisionRatio.toFixed(1))
      }
    });
  } catch (error: any) {
    console.error('Analytics dashboard error:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
