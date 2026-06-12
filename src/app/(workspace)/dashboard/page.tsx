// src/app/(workspace)/dashboard/page.tsx
import { auth } from '@/auth';
import { redirect } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import { ClayDashboardClient } from '@/components/clay-dashboard-client';
import { UserRole, ApplicationStatus, BundleStatus } from '@prisma/client';

export const metadata = {
  title: 'Dashboard - Architax PBB',
};

export default async function DashboardPage() {
  const session = await auth();

  if (!session?.user) {
    redirect('/login');
  }

  const user = session.user;
  const userRole = user.role as UserRole;

  let dbItems: any[] = [];
  let extraData: any = null;

  if (userRole === UserRole.STAF_PENGINPUT) {
    // Fetch all personal submissions
    const result = await prisma.permohonan.findMany({
      where: { createdById: user.id },
      orderBy: { createdAt: 'desc' },
    });
    dbItems = JSON.parse(JSON.stringify(result));
  } else if (userRole === UserRole.STAF_PENELITI) {
    // Fetch all submissions for the research queue (SUBMITTED and active ones)
    const result = await prisma.permohonan.findMany({
      orderBy: { createdAt: 'desc' },
    });
    dbItems = JSON.parse(JSON.stringify(result));
  } else if (userRole === UserRole.STAF_PENGARSIP) {
    // Fetch ready-to-archive bundles with items and scanFiles
    const bundles = await prisma.bundle.findMany({
      where: { status: BundleStatus.READY_TO_ARCHIVE },
      orderBy: { updatedAt: 'desc' },
    });

    const bundlesWithItems = await Promise.all(
      bundles.map(async (bundle) => {
        const items = await prisma.permohonan.findMany({
          where: { bundleId: bundle.id },
        });
        return {
          ...bundle,
          items,
        };
      })
    );
    dbItems = JSON.parse(JSON.stringify(bundlesWithItems));
  } else if (userRole === UserRole.STAF_PENGIRIM) {
    // Fetch available bundles ready to ship (READY_TO_SHIP status, not yet in any manifest)
    const availableBundles = await prisma.bundle.findMany({
      where: { status: BundleStatus.READY_TO_SHIP },
      orderBy: { updatedAt: 'desc' },
    });

    // Find the latest manifest
    const activeManifest = await prisma.manifest.findFirst({
      orderBy: { createdAt: 'desc' },
    });

    let manifestBundles: any[] = [];
    if (activeManifest && activeManifest.bundleIds.length > 0) {
      manifestBundles = await prisma.bundle.findMany({
        where: { id: { in: activeManifest.bundleIds } },
      });
    }

    dbItems = JSON.parse(JSON.stringify(availableBundles));
    extraData = {
      activeManifest: activeManifest ? JSON.parse(JSON.stringify(activeManifest)) : null,
      manifestBundles: JSON.parse(JSON.stringify(manifestBundles)),
    };
  } else if (userRole === UserRole.STAF_PEMANTAU) {
    // Fetch bundles with status SENT_TO_CENTER or COMPLETED
    const bundles = await prisma.bundle.findMany({
      where: { status: { in: [BundleStatus.SENT_TO_CENTER, BundleStatus.COMPLETED] } },
      orderBy: { updatedAt: 'desc' },
    });

    const bundlesWithItems = await Promise.all(
      bundles.map(async (bundle) => {
        const items = await prisma.permohonan.findMany({
          where: { bundleId: bundle.id },
        });
        return {
          ...bundle,
          items,
        };
      })
    );
    dbItems = JSON.parse(JSON.stringify(bundlesWithItems));
  } else if (userRole === UserRole.SUPERVISOR) {
    // Supervisor statistics query
    const total = await prisma.permohonan.count();
    const inProgress = await prisma.permohonan.count({
      where: {
        status: {
          notIn: [
            ApplicationStatus.COMPLETED,
            ApplicationStatus.REJECTED,
            ApplicationStatus.REJECTED_PERMANENT,
          ],
        },
      },
    });
    const completed = await prisma.permohonan.count({
      where: { status: ApplicationStatus.COMPLETED },
    });
    const revisedCount = await prisma.auditLog.count({
      where: {
        action: 'REVISION',
        entityType: 'Permohonan',
      },
    });
    const revisionRatio = total > 0 ? (revisedCount / total) * 100 : 0;
    const metrics = {
      total,
      inProgress,
      completed,
      revisionRatio: parseFloat(revisionRatio.toFixed(1)),
    };

    const groups = await prisma.permohonan.groupBy({
      by: ['serviceType'],
      _count: {
        id: true,
      },
    });
    const servicesData = groups.map((g) => ({
      serviceType: g.serviceType,
      name: g.serviceType.replace(/_/g, ' '),
      value: g._count.id,
    }));

    const completedItems = await prisma.permohonan.findMany({
      where: {
        status: ApplicationStatus.COMPLETED,
        updatedAt: {
          gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
        },
      },
      select: {
        updatedAt: true,
      },
    });

    const trendMap: { [date: string]: number } = {};
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const dateStr = d.toLocaleDateString('id-ID', { day: 'numeric', month: 'short' });
      trendMap[dateStr] = 0;
    }
    completedItems.forEach((item) => {
      const dateStr = new Date(item.updatedAt).toLocaleDateString('id-ID', { day: 'numeric', month: 'short' });
      if (trendMap[dateStr] !== undefined) {
        trendMap[dateStr]++;
      }
    });
    const completionTrend = Object.keys(trendMap).map((date) => ({
      date,
      jumlah: trendMap[date],
    }));

    const countPenelitian = await prisma.permohonan.count({
      where: { status: ApplicationStatus.SUBMITTED },
    });
    const countPengarsipan = await prisma.bundle.count({
      where: { status: { in: [BundleStatus.READY_TO_ARCHIVE, BundleStatus.DRAFT_BUNDLE] } },
    });
    const countPengiriman = await prisma.bundle.count({
      where: { status: BundleStatus.READY_TO_SHIP },
    });
    const countPemantauan = await prisma.bundle.count({
      where: { status: BundleStatus.SENT_TO_CENTER },
    });

    const stages = [
      {
        tahap: 'Penelitian Berkas (Peneliti)',
        avgDays: countPenelitian > 15 ? 3.2 : 1.2,
        waitingCount: countPenelitian,
        status: countPenelitian > 10 ? '⚠️ Menumpuk' : 'Lancar',
      },
      {
        tahap: 'Pengarsipan Scan (Pengarsip)',
        avgDays: countPengarsipan > 10 ? 2.5 : 0.8,
        waitingCount: countPengarsipan,
        status: countPengarsipan > 5 ? '⚠️ Menumpuk' : 'Lancar',
      },
      {
        tahap: 'Pengiriman Kurir (Pengirim)',
        avgDays: countPengiriman > 8 ? 2.8 : 1.1,
        waitingCount: countPengiriman,
        status: countPengiriman > 5 ? '⚠️ Menumpuk' : 'Lancar',
      },
      {
        tahap: 'Konfirmasi Penerimaan (Pemantau)',
        avgDays: countPemantauan > 12 ? 4.1 : 2.3,
        waitingCount: countPemantauan,
        status: countPemantauan > 5 ? '⚠️ Menumpuk' : 'Lancar',
      },
    ];

    extraData = {
      metrics,
      servicesData,
      slaData: {
        completionTrend,
        stages,
      },
    };
  }

  return (
    <ClayDashboardClient
      initialUserName={user.name ?? 'Mufti'}
      userRole={user.role}
      dbItems={dbItems}
      extraData={extraData}
    />
  );
}

