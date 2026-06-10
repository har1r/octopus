// src/app/api/files/download/route.ts
import { NextResponse } from 'next/server';
import { auth } from '@/auth';
import { StorageClient } from '@/lib/storage';

export async function GET(req: Request) {
  try {
    const session = await auth();
    if (!session?.user) {
      return new Response('Unauthorized', { status: 401 });
    }

    const url = new URL(req.url);
    const key = url.searchParams.get('key');

    if (!key) {
      return new Response('Missing key', { status: 400 });
    }

    const buffer = await StorageClient.getFile(key);
    if (!buffer) {
      return new Response('File not found', { status: 404 });
    }

    // Determine basic mime type
    let contentType = 'application/octet-stream';
    const ext = key.split('.').pop()?.toLowerCase();
    if (ext === 'pdf') {
      contentType = 'application/pdf';
    } else if (ext === 'png') {
      contentType = 'image/png';
    } else if (ext === 'jpg' || ext === 'jpeg') {
      contentType = 'image/jpeg';
    }

    return new Response(new Uint8Array(buffer), {
      headers: {
        'Content-Type': contentType,
        'Content-Disposition': 'inline', // render in browser instead of direct force download
      },
    });
  } catch (error: any) {
    console.error('File download error:', error);
    return new Response('Internal Server Error', { status: 500 });
  }
}
