import { Customer, MessageTemplate, Schedule } from '../types';

// OpenWA API Configuration
interface OpenWAConfig {
  apiUrl: string;
  apiKey: string;
  sessionId: string;
  connected: boolean;
  sessionStatus: 'disconnected' | 'qr_ready' | 'connecting' | 'connected' | 'error';
}

const DEFAULT_CONFIG: OpenWAConfig = {
  apiUrl: '',
  apiKey: '',
  sessionId: 'crm-session',
  connected: false,
  sessionStatus: 'disconnected',
};

// Get/OpenWA config from localStorage
export function getOpenWAConfig(): OpenWAConfig {
  const data = localStorage.getItem('openwa_config');
  return data ? { ...DEFAULT_CONFIG, ...JSON.parse(data) } : DEFAULT_CONFIG;
}

export function saveOpenWAConfig(config: Partial<OpenWAConfig>) {
  const current = getOpenWAConfig();
  const updated = { ...current, ...config };
  localStorage.setItem('openwa_config', JSON.stringify(updated));
  return updated;
}

// Check if OpenWA is configured and connected
export function isOpenWAConnected(): boolean {
  const config = getOpenWAConfig();
  return config.connected && config.sessionStatus === 'connected' && !!config.apiUrl && !!config.apiKey;
}

// OpenWA API Service
class OpenWAService {
  private getConfig(): OpenWAConfig {
    return getOpenWAConfig();
  }

  private async request(endpoint: string, options: RequestInit = {}) {
    const config = this.getConfig();
    if (!config.apiUrl || !config.apiKey) {
      throw new Error('OpenWA belum dikonfigurasi. Silakan atur di halaman Settings.');
    }

    const url = `${config.apiUrl.replace(/\/$/, '')}${endpoint}`;
    const response = await fetch(url, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        'X-API-Key': config.apiKey,
        ...options.headers,
      },
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`OpenWA API Error (${response.status}): ${error}`);
    }

    return response.json();
  }

  // Create a new session
  async createSession(name?: string) {
    const config = this.getConfig();
    return this.request('/api/sessions', {
      method: 'POST',
      body: JSON.stringify({ name: name || config.sessionId }),
    });
  }

  // Start session (triggers QR code generation)
  async startSession() {
    const config = this.getConfig();
    return this.request(`/api/sessions/${config.sessionId}/start`, {
      method: 'POST',
    });
  }

  // Get QR code for session
  async getQRCode(): Promise<{ qr: string } | null> {
    try {
      const config = this.getConfig();
      const result = await this.request(`/api/sessions/${config.sessionId}/qr`);
      return result;
    } catch {
      return null;
    }
  }

  // Get session status
  async getSessionStatus(): Promise<{ status: string; connected: boolean }> {
    try {
      const config = this.getConfig();
      const result = await this.request(`/api/sessions/${config.sessionId}`);
      return {
        status: result.status || result.state || 'unknown',
        connected: result.connected || result.status === 'connected' || result.state === 'connected',
      };
    } catch {
      return { status: 'disconnected', connected: false };
    }
  }

  // Send text message via OpenWA
  async sendTextMessage(chatId: string, text: string) {
    const config = this.getConfig();
    // Format chatId for WhatsApp (add @c.us if not present)
    const formattedChatId = chatId.includes('@') ? chatId : `${chatId}@c.us`;
    
    return this.request(`/api/sessions/${config.sessionId}/messages/send-text`, {
      method: 'POST',
      body: JSON.stringify({
        chatId: formattedChatId,
        text: text,
      }),
    });
  }

  // Stop session
  async stopSession() {
    const config = this.getConfig();
    return this.request(`/api/sessions/${config.sessionId}/stop`, {
      method: 'POST',
    });
  }

  // Delete session
  async deleteSession() {
    const config = this.getConfig();
    return this.request(`/api/sessions/${config.sessionId}`, {
      method: 'DELETE',
    });
  }

  // Send message with template variables replaced
  async sendMessageWithTemplate(customer: Customer, template: MessageTemplate | string) {
    const message = typeof template === 'string' 
      ? template 
      : template.content;
    
    const hour = new Date().getHours();
    const waktu = hour < 12 ? 'pagi' : hour < 18 ? 'siang' : 'malam';
    
    const finalMessage = message
      .replace(/{nama}/g, customer.name)
      .replace(/{perusahaan}/g, customer.company || 'Perusahaan Kami')
      .replace(/{waktu}/g, waktu)
      .replace(/{produk}/g, 'Produk Kami');

    return this.sendTextMessage(customer.phone, finalMessage);
  }
}

export const openWAService = new OpenWAService();
