// src/app/api/files/upload/route.ts
import { NextResponse } from 'next/server';
import { StorageClient } from '@/lib/storage';

export async function PUT(req: Request) {
  try {
    const url = new URL(req.url);
    const key = url.searchParams.get('key');

    if (!key) {
      return NextResponse.json({ error: 'Missing key parameter' }, { status: 400 });
    }

    const arrayBuffer = await req.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // Save file locally to secure folder
    await StorageClient.saveFile(key, buffer);

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('File upload error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  return PUT(req);
}
