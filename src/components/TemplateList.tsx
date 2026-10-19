import { MessageTemplate } from '../types';
import { openWhatsApp } from '../utils/storage';
import { sendWhatsAppMessage } from '../services/messageSender';
import { openWAService } from '../services/openwa';

interface TemplateListProps {
  templates: MessageTemplate[];
  onAdd: () => void;
  onEdit: (template: MessageTemplate) => void;
  onDelete: (id: string) => void;
  waConnected?: boolean;
}

const categoryLabels: Record<string, { label: string; color: string; icon: string }> = {
  greeting: { label: 'Salam', color: 'bg-blue-100 text-blue-700', icon: '👋' },
  followup: { label: 'Follow Up', color: 'bg-green-100 text-green-700', icon: '🔄' },
  promotion: { label: 'Promosi', color: 'bg-purple-100 text-purple-700', icon: '🎉' },
  reminder: { label: 'Pengingat', color: 'bg-orange-100 text-orange-700', icon: '📅' },
  custom: { label: 'Custom', color: 'bg-gray-100 text-gray-700', icon: '✏️' },
};

export default function TemplateList({ templates, onAdd, onEdit, onDelete, waConnected }: TemplateListProps) {
  const handlePreview = (template: MessageTemplate) => {
    const preview = template.content
      .replace(/{nama}/g, 'John Doe')
      .replace(/{perusahaan}/g, 'Perusahaan Anda')
      .replace(/{waktu}/g, 'pagi')
      .replace(/{produk}/g, 'Produk Kami');
    alert(`Preview Template:\n\n${preview}`);
  };

  const handleSendTemplate = async (template: MessageTemplate) => {
    const phone = prompt('Masukkan nomor WhatsApp (contoh: 628123456789):');
    if (phone) {
      const message = template.content
        .replace(/{nama}/g, 'Pelanggan')
        .replace(/{perusahaan}/g, 'Perusahaan Kami')
        .replace(/{waktu}/g, 'pagi')
        .replace(/{produk}/g, 'Produk Kami');
      
      if (waConnected) {
        try {
          await openWAService.sendTextMessage(phone, message);
          alert('✅ Pesan berhasil dikirim via OpenWA!');
        } catch (error: any) {
          alert('❌ Gagal kirim via OpenWA: ' + error.message + '\nMembuka WhatsApp link sebagai fallback...');
          openWhatsApp(phone, message);
        }
      } else {
        openWhatsApp(phone, message);
      }
    }
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row gap-3 justify-between items-start sm:items-center">
        <div>
          <h2 className="text-xl font-bold text-gray-800">Template Pesan WhatsApp</h2>
          <p className="text-sm text-gray-500">{templates.length} template tersedia</p>
        </div>
        <button
          onClick={onAdd}
          className="px-4 py-2 bg-green-600 text-white rounded-lg text-sm font-medium hover:bg-green-700 transition-colors flex items-center gap-2"
        >
          <span>+</span> Buat Template
        </button>
      </div>

      {/* Variable Info */}
      <div className="bg-blue-50 rounded-xl border border-blue-200 p-4">
        <h3 className="font-medium text-blue-800 text-sm mb-2">📌 Variabel yang tersedia:</h3>
        <div className="flex flex-wrap gap-2">
          <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded text-xs font-mono">{'{nama}'}</span>
          <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded text-xs font-mono">{'{perusahaan}'}</span>
          <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded text-xs font-mono">{'{waktu}'}</span>
          <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded text-xs font-mono">{'{produk}'}</span>
        </div>
        <p className="text-xs text-blue-600 mt-2">
          Variabel akan otomatis diganti saat pesan dikirim ke pelanggan.
        </p>
      </div>

      {/* Template Grid */}
      {templates.length === 0 ? (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-8 text-center">
          <span className="text-4xl">📝</span>
          <p className="text-gray-500 mt-2">Belum ada template</p>
          <button
            onClick={onAdd}
            className="mt-3 text-sm text-green-600 hover:underline"
          >
            Buat template pertama
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {templates.map(template => {
            const cat = categoryLabels[template.category] || categoryLabels.custom;
            return (
              <div key={template.id} className="bg-white rounded-xl shadow-sm border border-gray-100 p-5 hover:shadow-md transition-shadow">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <span className="text-xl">{cat.icon}</span>
                    <h3 className="font-semibold text-gray-800">{template.name}</h3>
                  </div>
                  <span className={`px-2 py-1 text-xs rounded-full ${cat.color}`}>
                    {cat.label}
                  </span>
                </div>
                <div className="bg-gray-50 rounded-lg p-3 mb-4">
                  <p className="text-sm text-gray-600 whitespace-pre-line line-clamp-4">
                    {template.content}
                  </p>
                </div>
                <div className="flex items-center gap-2 flex-wrap">
                  <button
                    onClick={() => handlePreview(template)}
                    className="px-3 py-1.5 bg-gray-100 text-gray-700 rounded-lg text-xs font-medium hover:bg-gray-200 transition-colors"
                  >
                    👁️ Preview
                  </button>
                  <button
                    onClick={() => handleSendTemplate(template)}
                    className="px-3 py-1.5 bg-green-100 text-green-700 rounded-lg text-xs font-medium hover:bg-green-200 transition-colors"
                  >
                    📱 Kirim Test
                  </button>
                  <div className="flex-1" />
                  <button
                    onClick={() => onEdit(template)}
                    className="px-3 py-1.5 text-blue-600 hover:bg-blue-50 rounded-lg text-xs font-medium transition-colors"
                  >
                    ✏️ Edit
                  </button>
                  <button
                    onClick={() => {
                      if (confirm('Hapus template ini?')) onDelete(template.id);
                    }}
                    className="px-3 py-1.5 text-red-600 hover:bg-red-50 rounded-lg text-xs font-medium transition-colors"
                  >
                    🗑️
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
