// src/app/api/files/presign/route.ts
import { NextResponse } from 'next/server';
import { auth } from '@/auth';
import { randomUUID } from 'crypto';

const ALLOWED_MIME_TYPES = [
  'application/pdf',
  'image/jpeg',
  'image/png',
  'image/jpg'
];

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5 MB

export async function POST(req: Request) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const { fileName, mimeType, fileSize } = body;

    if (!fileName || !mimeType || !fileSize) {
      return NextResponse.json({ error: 'Missing parameters' }, { status: 400 });
    }

    // BR-022: File format security check
    if (!ALLOWED_MIME_TYPES.includes(mimeType)) {
      return NextResponse.json({ 
        error: 'Tipe file tidak didukung. Hanya file PDF, JPG, dan PNG yang diizinkan.' 
      }, { status: 400 });
    }

    // BR-023: File size limit check
    if (fileSize > MAX_FILE_SIZE) {
      return NextResponse.json({ 
        error: 'Ukuran file melebihi batas maksimum 5 MB.' 
      }, { status: 400 });
    }

    // Generate secure storage key and simulated presigned upload URL
    const fileExtension = fileName.split('.').pop() || '';
    const storageKey = `${randomUUID()}.${fileExtension}`;
    const uploadUrl = `${process.env.AUTH_URL || 'http://localhost:3000'}/api/files/upload?key=${storageKey}`;

    return NextResponse.json({
      uploadUrl,
      storageKey,
    });
  } catch (error: any) {
    console.error('Presign URL generation error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
