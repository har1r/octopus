// src/app/api/webhooks/fonnte/route.ts
import { NextResponse } from 'next/server';
import { AuditService } from '@/services/audit.service';

/**
 * Webhook handler for Fonnte delivery status callbacks.
 * Reference: API.md (POST /api/webhooks/fonnte)
 */
export async function POST(request: Request) {
  try {
    const text = await request.text();
    let body: any = {};
    
    // Attempt parsing URL-encoded or JSON body
    try {
      body = JSON.parse(text);
    } catch (e) {
      // Fallback: parse URLSearchParams
      const params = new URLSearchParams(text);
      body = Object.fromEntries(params.entries());
    }

    console.log('[Fonnte Webhook] Received status payload:', body);

    // Fields usually sent by Fonnte:
    // id: message id
    // device: device number
    // target: recipient number
    // message: sent message text
    // status: "sent", "delivered", "failed", "pending"
    // reason: reason if failed

    const messageId = body.id || 'unknown';
    const target = body.target || 'unknown';
    const status = body.status || 'unknown';
    const reason = body.reason || null;

    // Create an audit log entry tracking the delivery status
    await AuditService.log({
      userId: 'SYSTEM',
      userName: 'Fonnte Webhook',
      userRole: 'SYSTEM',
      entityType: 'Notification',
      entityId: messageId,
      action: `WA_DELIVERY_${status.toUpperCase()}`,
      oldValue: { target, status },
      newValue: body,
    });

    // Handle failure and retry tracking/logging
    if (status === 'failed' || status === 'rejected') {
      console.warn(`[Fonnte Webhook] WhatsApp delivery to ${target} failed. Reason: ${reason}`);
      // In a production app, we would queue a retry here if needed.
    }

    return NextResponse.json({ success: true, received: true });
  } catch (error: any) {
    console.error('[Fonnte Webhook] Error processing webhook:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Error processing webhook' },
      { status: 500 }
    );
  }
}
