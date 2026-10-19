import { Customer, MessageTemplate } from '../types';
import { openWhatsApp } from '../utils/storage';
import { openWAService, isOpenWAConnected, getOpenWAConfig } from '../services/openwa';

export type SendResult = {
  success: boolean;
  method: 'openwa' | 'wa_link';
  message?: string;
};

/**
 * Send WhatsApp message - uses OpenWA API if connected, otherwise opens wa.me link
 */
export async function sendWhatsAppMessage(
  customer: Customer,
  messageOrTemplate: string | MessageTemplate,
  customMessage?: string
): Promise<SendResult> {
  // Prepare the message
  let message: string;
  
  if (customMessage) {
    message = customMessage;
  } else if (typeof messageOrTemplate === 'string') {
    message = messageOrTemplate;
  } else {
    message = messageOrTemplate.content;
  }

  // Replace template variables
  const hour = new Date().getHours();
  const waktu = hour < 12 ? 'pagi' : hour < 18 ? 'siang' : 'malam';
  
  const finalMessage = message
    .replace(/{nama}/g, customer.name)
    .replace(/{perusahaan}/g, customer.company || 'Perusahaan Kami')
    .replace(/{waktu}/g, waktu)
    .replace(/{produk}/g, 'Produk Kami');

  // Try OpenWA first if connected
  if (isOpenWAConnected()) {
    try {
      await openWAService.sendTextMessage(customer.phone, finalMessage);
      return {
        success: true,
        method: 'openwa',
        message: 'Pesan berhasil dikirim via OpenWA!',
      };
    } catch (error: any) {
      // If OpenWA fails, fall back to wa.me link
      console.warn('OpenWA send failed, falling back to wa.me link:', error.message);
      openWhatsApp(customer.phone, finalMessage);
      return {
        success: true,
        method: 'wa_link',
        message: 'OpenWA gagal, dibuka via WhatsApp link.',
      };
    }
  }

  // Fallback: open wa.me link
  openWhatsApp(customer.phone, finalMessage);
  return {
    success: true,
    method: 'wa_link',
    message: 'Pesan dibuka di WhatsApp. Silakan kirim manual.',
  };
}

/**
 * Check if auto-send is available (OpenWA connected)
 */
export function isAutoSendAvailable(): boolean {
  return isOpenWAConnected();
}

/**
 * Get connection info for display
 */
export function getConnectionInfo() {
  const config = getOpenWAConfig();
  return {
    isConnected: isOpenWAConnected(),
    isConfigured: !!config.apiUrl && !!config.apiKey,
    apiUrl: config.apiUrl,
    sessionId: config.sessionId,
    status: config.sessionStatus,
  };
}
