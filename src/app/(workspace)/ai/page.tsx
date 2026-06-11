// src/app/ai/page.tsx
import { auth } from '@/auth';
import { redirect } from 'next/navigation';
import { Metadata } from 'next';
import { AiChatClient } from '@/components/ai-chat-client';

export const metadata: Metadata = {
  title: 'Architax AI - Asisten Cerdas',
  description: 'Tanyakan apa saja tentang alur kerja dokumen PBB kepada asisten AI Architax.',
};

interface AiPageProps {
  searchParams: Promise<{ q?: string }>;
}

export default async function AiPage({ searchParams }: AiPageProps) {
  const session = await auth();
  if (!session?.user) redirect('/login');

  const params = await searchParams;
  const initialQuery = params.q ? decodeURIComponent(params.q) : undefined;

  return (
    /*
     * h-full penting agar chat mengisi seluruh area konten yang tersedia
     * dari AppLayout (parent sudah set overflow-hidden + flex-col)
     */
    <div
      style={{
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      <AiChatClient
        initialQuery={initialQuery}
        userName={session.user.name ?? 'Pengguna'}
      />
    </div>
  );
}
