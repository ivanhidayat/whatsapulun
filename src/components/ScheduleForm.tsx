import { useState } from 'react';
import { Customer, MessageTemplate, Schedule } from '../types';

interface ScheduleFormProps {
  customers: Customer[];
  templates: MessageTemplate[];
  onSave: (schedule: Omit<Schedule, 'id' | 'createdAt' | 'status'>) => void;
  onClose: () => void;
}

export default function ScheduleForm({ customers, templates, onSave, onClose }: ScheduleFormProps) {
  const [selectedCustomerId, setSelectedCustomerId] = useState('');
  const [selectedTemplateId, setSelectedTemplateId] = useState('');
  const [customMessage, setCustomMessage] = useState('');
  const [scheduledDate, setScheduledDate] = useState('');
  const [scheduledTime, setScheduledTime] = useState('');
  const [useCustomMessage, setUseCustomMessage] = useState(false);

  const selectedCustomer = customers.find(c => c.id === selectedCustomerId);
  const selectedTemplate = templates.find(t => t.id === selectedTemplateId);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCustomerId) {
      alert('Pilih pelanggan terlebih dahulu!');
      return;
    }
    if (!scheduledDate || !scheduledTime) {
      alert('Tentukan tanggal dan waktu pengiriman!');
      return;
    }
    if (!useCustomMessage && !selectedTemplateId) {
      alert('Pilih template pesan atau gunakan pesan custom!');
      return;
    }

    onSave({
      customerId: selectedCustomerId,
      templateId: selectedTemplateId,
      customMessage: useCustomMessage ? customMessage : '',
      scheduledDate,
      scheduledTime,
    });
  };

  const getPreviewMessage = () => {
    if (useCustomMessage) {
      return customMessage
        .replace(/{nama}/g, selectedCustomer?.name || 'Pelanggan')
        .replace(/{perusahaan}/g, selectedCustomer?.company || 'Perusahaan')
        .replace(/{waktu}/g, 'pagi')
        .replace(/{produk}/g, 'Produk Kami');
    }
    if (selectedTemplate) {
      return selectedTemplate.content
        .replace(/{nama}/g, selectedCustomer?.name || 'Pelanggan')
        .replace(/{perusahaan}/g, selectedCustomer?.company || 'Perusahaan')
        .replace(/{waktu}/g, 'pagi')
        .replace(/{produk}/g, 'Produk Kami');
    }
    return '';
  };

  // Get today's date in YYYY-MM-DD format for min date
  const today = new Date().toISOString().split('T')[0];

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b border-gray-100">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-gray-800">📅 Buat Jadwal WhatsApp</h2>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              ✕
            </button>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* Customer Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Pelanggan *</label>
            <select
              value={selectedCustomerId}
              onChange={(e) => setSelectedCustomerId(e.target.value)}
              className="w-full px-4 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-green-500 focus:border-transparent"
              required
            >
              <option value="">-- Pilih Pelanggan --</option>
              {customers.map(c => (
                <option key={c.id} value={c.id}>
                  {c.name} ({c.phone})
                </option>
              ))}
            </select>
            {selectedCustomer && (
              <p className="text-xs text-gray-500 mt-1">
                📱 {selectedCustomer.phone} • {selectedCustomer.company}
              </p>
            )}
          </div>

          {/* Date & Time */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Tanggal *</label>
              <input
                type="date"
                value={scheduledDate}
                min={today}
                onChange={(e) => setScheduledDate(e.target.value)}
                className="w-full px-4 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-green-500 focus:border-transparent"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Waktu *</label>
              <input
                type="time"
                value={scheduledTime}
                onChange={(e) => setScheduledTime(e.target.value)}
                className="w-full px-4 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-green-500 focus:border-transparent"
                required
              />
            </div>
          </div>

          {/* Message Type Toggle */}
          <div className="bg-gray-50 rounded-lg p-3">
            <div className="flex items-center gap-4">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  checked={!useCustomMessage}
                  onChange={() => setUseCustomMessage(false)}
                  className="text-green-600 focus:ring-green-500"
                />
                <span className="text-sm text-gray-700">Gunakan Template</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  checked={useCustomMessage}
                  onChange={() => setUseCustomMessage(true)}
                  className="text-green-600 focus:ring-green-500"
                />
                <span className="text-sm text-gray-700">Pesan Custom</span>
              </label>
            </div>
          </div>

          {/* Template or Custom Message */}
          {!useCustomMessage ? (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Pilih Template *</label>
              <select
                value={selectedTemplateId}
                onChange={(e) => setSelectedTemplateId(e.target.value)}
                className="w-full px-4 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-green-500 focus:border-transparent"
              >
                <option value="">-- Pilih Template --</option>
                {templates.map(t => (
                  <option key={t.id} value={t.id}>
                    {t.name}
                  </option>
                ))}
              </select>
            </div>
          ) : (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Pesan Custom *</label>
              <textarea
                value={customMessage}
                onChange={(e) => setCustomMessage(e.target.value)}
                className="w-full px-4 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-green-500 focus:border-transparent resize-none"
                rows={4}
                placeholder="Tulis pesan Anda di sini..."
              />
              <div className="flex items-center gap-2 mt-2 flex-wrap">
                <span className="text-xs text-gray-500">Variabel:</span>
                <button type="button" onClick={() => setCustomMessage(customMessage + '{nama}')} className="px-2 py-0.5 bg-blue-100 text-blue-700 rounded text-xs hover:bg-blue-200">
                  {'{nama}'}
                </button>
                <button type="button" onClick={() => setCustomMessage(customMessage + '{perusahaan}')} className="px-2 py-0.5 bg-blue-100 text-blue-700 rounded text-xs hover:bg-blue-200">
                  {'{perusahaan}'}
                </button>
              </div>
            </div>
          )}

          {/* Preview */}
          {(selectedTemplate || (useCustomMessage && customMessage)) && selectedCustomer && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <h4 className="text-xs font-medium text-green-700 mb-2">📱 Preview Pesan:</h4>
              <div className="bg-white rounded-lg p-3 shadow-sm">
                <p className="text-sm text-gray-700 whitespace-pre-line">{getPreviewMessage()}</p>
              </div>
              <p className="text-xs text-green-600 mt-2">
                Akan dikirim ke: {selectedCustomer.name} ({selectedCustomer.phone})
              </p>
            </div>
          )}

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
              📅 Jadwalkan
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
