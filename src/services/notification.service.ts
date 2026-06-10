// src/services/notification.service.ts
import { ApplicationStatus } from '@prisma/client';

export class NotificationService {
  /**
   * Sends a WhatsApp message via Fonnte API.
   * If FONNTE_TOKEN is missing or equal to 'mock', it will mock the send and succeed.
   */
  static async sendWhatsApp(target: string, message: string): Promise<{ success: boolean; data?: any; error?: string }> {
    const token = process.env.FONNTE_TOKEN;

    if (!target) {
      console.warn('[NotificationService] Target phone number is missing, skipping WhatsApp message.');
      return { success: false, error: 'Target phone number is missing.' };
    }

    // Sanitize phone number: remove non-digits
    const cleanPhone = target.replace(/\D/g, '');
    if (cleanPhone.length < 5) {
      console.warn(`[NotificationService] Target phone number "${target}" is invalid, skipping.`);
      return { success: false, error: 'Target phone number is invalid.' };
    }

    console.log(`[NotificationService] Sending WA to ${cleanPhone}: "${message}"`);

    if (!token || token === 'mock' || token.trim() === '') {
      console.log('[NotificationService] Fonnte token is mock/missing. Mocking success.');
      return { success: true, data: { status: 'mocked', target: cleanPhone } };
    }

    try {
      const response = await fetch('https://api.fonnte.com/send', {
        method: 'POST',
        headers: {
          'Authorization': token.trim(), // Fonnte requires the raw token
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          target: cleanPhone,
          message: message,
        }),
      });

      const resText = await response.text();
      let resJson: any = {};
      try {
        resJson = JSON.parse(resText);
      } catch (e) {
        resJson = { rawResponse: resText };
      }

      if (response.ok && (resJson.status === true || resJson.status === 'true' || resJson.status === 'success' || resJson.status === 'processing')) {
        console.log('[NotificationService] Fonnte API send successful:', resJson);
        return { success: true, data: resJson };
      } else {
        console.error('[NotificationService] Fonnte API send failed:', resJson);
        return { success: false, error: resJson.reason || resJson.message || 'Gagal mengirim pesan melalui Fonnte' };
      }
    } catch (error: any) {
      console.error('[NotificationService] Error sending via Fonnte API:', error);
      return { success: false, error: error.message || 'Terjadi kesalahan jaringan' };
    }
  }

  /**
   * Sends status change notification for a permohonan.
   */
  static async notifyPermohonanStatus(
    nomorBerkas: string,
    status: ApplicationStatus,
    applicantPhone: string | null
  ): Promise<{ success: boolean; error?: string }> {
    if (!applicantPhone) {
      return { success: false, error: 'Nomor HP pemohon tidak tersedia.' };
    }

    let message = '';
    switch (status) {
      case ApplicationStatus.REVISION:
        message = `Pemberitahuan Architax PBB:\n\nBerkas permohonan Anda dengan No. *${nomorBerkas}* memerlukan REVISI.\nSilakan masuk ke aplikasi atau hubungi petugas untuk merevisi dokumen Anda agar proses dapat dilanjutkan.\n\nTerima kasih.`;
        break;
      case ApplicationStatus.REJECTED:
        message = `Pemberitahuan Architax PBB:\n\nBerkas permohonan Anda dengan No. *${nomorBerkas}* telah DITOLAK.\nSilakan periksa kembali persyaratan dokumen Anda dan ajukan ulang berkas baru.\n\nTerima kasih.`;
        break;
      case ApplicationStatus.SENT_TO_CENTER:
        message = `Pemberitahuan Architax PBB:\n\nBerkas permohonan Anda dengan No. *${nomorBerkas}* telah dikirim ke KPP Pratama (Pusat) untuk proses lebih lanjut.\nKami akan mengabari Anda setelah proses selesai.\n\nTerima kasih.`;
        break;
      case ApplicationStatus.COMPLETED:
        message = `Pemberitahuan Architax PBB:\n\nSelamat! Berkas permohonan Anda dengan No. *${nomorBerkas}* telah SELESAI DIPROSES (COMPLETED) di sistem pusat.\nSilakan ambil dokumen hasil Anda di loket pelayanan.\n\nTerima kasih.`;
        break;
      default:
        // No notification rules for other statuses
        return { success: true };
    }

    return this.sendWhatsApp(applicantPhone, message);
  }
}
