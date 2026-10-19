import { useState } from 'react';
import { MessageTemplate } from '../types';

interface TemplateFormProps {
  template: MessageTemplate | null;
  onSave: (template: any) => void;
  onClose: () => void;
}

export default function TemplateForm({ template, onSave, onClose }: TemplateFormProps) {
  const [form, setForm] = useState({
    name: template?.name || '',
    content: template?.content || '',
    category: template?.category || 'custom' as MessageTemplate['category'],
  });

  const [preview, setPreview] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name || !form.content) {
      alert('Nama dan konten template wajib diisi!');
      return;
    }
    if (template) {
      onSave({ ...template, ...form });
    } else {
      onSave(form);
    }
  };

  const getPreviewContent = () => {
    return form.content
      .replace(/{nama}/g, 'John Doe')
      .replace(/{perusahaan}/g, 'PT Contoh Perusahaan')
      .replace(/{waktu}/g, 'pagi')
      .replace(/{produk}/g, 'Produk Premium');
  };

  const insertVariable = (variable: string) => {
    setForm({ ...form, content: form.content + `{${variable}}` });
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b border-gray-100">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-gray-800">
              {template ? '✏️ Edit Template' : '➕ Buat Template Baru'}
            </h2>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              ✕
            </button>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Nama Template *</label>
            <input
              type="text"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              className="w-full px-4 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-green-500 focus:border-transparent"
              placeholder="Contoh: Follow Up Pelanggan Baru"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Kategori</label>
            <select
              value={form.category}
              onChange={(e) => setForm({ ...form, category: e.target.value as MessageTemplate['category'] })}
              className="w-full px-4 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-green-500 focus:border-transparent"
            >
              <option value="greeting">👋 Salam Pembuka</option>
              <option value="followup">🔄 Follow Up</option>
              <option value="promotion">🎉 Promosi</option>
              <option value="reminder">📅 Pengingat</option>
              <option value="custom">✏️ Custom</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Konten Pesan *</label>
            <textarea
              value={form.content}
              onChange={(e) => setForm({ ...form, content: e.target.value })}
              className="w-full px-4 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-green-500 focus:border-transparent resize-none font-mono"
              rows={6}
              placeholder="Tulis template pesan Anda di sini..."
              required
            />
            <div className="flex items-center gap-2 mt-2 flex-wrap">
              <span className="text-xs text-gray-500">Sisipkan variabel:</span>
              <button type="button" onClick={() => insertVariable('nama')} className="px-2 py-0.5 bg-blue-100 text-blue-700 rounded text-xs hover:bg-blue-200">
                {'{nama}'}
              </button>
              <button type="button" onClick={() => insertVariable('perusahaan')} className="px-2 py-0.5 bg-blue-100 text-blue-700 rounded text-xs hover:bg-blue-200">
                {'{perusahaan}'}
              </button>
              <button type="button" onClick={() => insertVariable('waktu')} className="px-2 py-0.5 bg-blue-100 text-blue-700 rounded text-xs hover:bg-blue-200">
                {'{waktu}'}
              </button>
              <button type="button" onClick={() => insertVariable('produk')} className="px-2 py-0.5 bg-blue-100 text-blue-700 rounded text-xs hover:bg-blue-200">
                {'{produk}'}
              </button>
            </div>
          </div>

          {/* Preview Toggle */}
          <div>
            <button
              type="button"
              onClick={() => setPreview(!preview)}
              className="text-sm text-green-600 hover:underline flex items-center gap-1"
            >
              {preview ? '🔽 Sembunyikan Preview' : '▶️ Lihat Preview'}
            </button>
            {preview && (
              <div className="mt-2 bg-green-50 border border-green-200 rounded-lg p-4">
                <div className="bg-white rounded-lg p-3 shadow-sm">
                  <p className="text-sm text-gray-700 whitespace-pre-line">{getPreviewContent()}</p>
                </div>
                <p className="text-xs text-green-600 mt-2">↑ Ini adalah preview pesan yang akan dikirim</p>
              </div>
            )}
          </div>

          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-200 transition-colors"
            >
              Batal
            </button>
            <button
              type="submit"
              className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg text-sm font-medium hover:bg-green-700 transition-colors"
            >
              {template ? 'Simpan Perubahan' : 'Buat Template'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
