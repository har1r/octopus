// src/app/api/analytics/services/route.ts
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { auth } from '@/auth';

export async function GET() {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const groups = await prisma.permohonan.groupBy({
      by: ['serviceType'],
      _count: {
        id: true,
      },
    });

    const data = groups.map(g => ({
      serviceType: g.serviceType,
      name: g.serviceType.replace(/_/g, ' '),
      value: g._count.id
    }));

    return NextResponse.json({
      success: true,
      data
    });
  } catch (error: any) {
    console.error('Analytics services error:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
