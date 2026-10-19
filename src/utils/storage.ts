import { Customer, MessageTemplate, Schedule } from '../types';

const STORAGE_KEYS = {
  customers: 'crm_customers',
  templates: 'crm_templates',
  schedules: 'crm_schedules',
};

export function getCustomers(): Customer[] {
  const data = localStorage.getItem(STORAGE_KEYS.customers);
  return data ? JSON.parse(data) : [];
}

export function saveCustomers(customers: Customer[]) {
  localStorage.setItem(STORAGE_KEYS.customers, JSON.stringify(customers));
}

export function getTemplates(): MessageTemplate[] {
  const data = localStorage.getItem(STORAGE_KEYS.templates);
  return data ? JSON.parse(data) : [];
}

export function saveTemplates(templates: MessageTemplate[]) {
  localStorage.setItem(STORAGE_KEYS.templates, JSON.stringify(templates));
}

export function getSchedules(): Schedule[] {
  const data = localStorage.getItem(STORAGE_KEYS.schedules);
  return data ? JSON.parse(data) : [];
}

export function saveSchedules(schedules: Schedule[]) {
  localStorage.setItem(STORAGE_KEYS.schedules, JSON.stringify(schedules));
}

export function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).substr(2);
}

export function openWhatsApp(phone: string, message: string) {
  const cleanPhone = phone.replace(/[^0-9]/g, '');
  const encodedMessage = encodeURIComponent(message);
  const url = `https://wa.me/${cleanPhone}?text=${encodedMessage}`;
  window.open(url, '_blank');
}

export function formatDate(dateStr: string): string {
  if (!dateStr) return '-';
  const date = new Date(dateStr);
  return date.toLocaleDateString('id-ID', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
}

export function formatDateTime(dateStr: string, timeStr: string): string {
  const date = new Date(`${dateStr}T${timeStr}`);
  return date.toLocaleDateString('id-ID', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export function getDefaultTemplates(): MessageTemplate[] {
  return [
    {
      id: 'tpl_1',
      name: 'Salam Pembuka',
      content: 'Halo {nama}, selamat {waktu}! 👋\n\nPerkenalkan saya dari {perusahaan}. Ada yang bisa kami bantu hari ini?',
      category: 'greeting',
      createdAt: new Date().toISOString(),
    },
    {
      id: 'tpl_2',
      name: 'Follow Up Pelanggan',
      content: 'Halo {nama}! 👋\n\nTerima kasih sudah menghubungi kami sebelumnya. Apakah ada pertanyaan atau kebutuhan yang bisa kami bantu?\n\nSalam,\n{perusahaan}',
      category: 'followup',
      createdAt: new Date().toISOString(),
    },
    {
      id: 'tpl_3',
      name: 'Promosi Spesial',
      content: '🎉 Halo {nama}!\n\nKami punya penawaran spesial untuk Anda! Dapatkan diskon hingga 30% untuk produk pilihan.\n\nBerlaku hingga akhir bulan ini. Tertarik? Hubungi kami sekarang!\n\nSalam,\n{perusahaan}',
      category: 'promotion',
      createdAt: new Date().toISOString(),
    },
    {
      id: 'tpl_4',
      name: 'Pengingat Jadwal',
      content: '📅 Halo {nama}!\n\nIni adalah pengingat untuk jadwal Anda bersama kami. Mohon konfirmasi kehadiran Anda.\n\nTerima kasih!\n{perusahaan}',
      category: 'reminder',
      createdAt: new Date().toISOString(),
    },
  ];
}
