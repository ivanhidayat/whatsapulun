import { Schedule, Customer, MessageTemplate } from '../types';
import { openWhatsApp, formatDateTime } from '../utils/storage';

interface ScheduleListProps {
  schedules: Schedule[];
  customers: Customer[];
  templates: MessageTemplate[];
  onAdd: () => void;
  onUpdateStatus: (id: string, status: Schedule['status']) => void;
  onDelete: (id: string) => void;
}

export default function ScheduleList({
  schedules,
  customers,
  templates,
  onAdd,
  onUpdateStatus,
  onDelete,
}: ScheduleListProps) {
  const pendingSchedules = schedules
    .filter(s => s.status === 'pending')
    .sort((a, b) => {
      const dateA = new Date(`${a.scheduledDate}T${a.scheduledTime}`);
      const dateB = new Date(`${b.scheduledDate}T${b.scheduledTime}`);
      return dateA.getTime() - dateB.getTime();
    });

  const sentSchedules = schedules
    .filter(s => s.status === 'sent')
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  const cancelledSchedules = schedules
    .filter(s => s.status === 'cancelled')
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  const handleSendNow = (schedule: Schedule) => {
    const customer = customers.find(c => c.id === schedule.customerId);
    const template = templates.find(t => t.id === schedule.templateId);
    
    if (!customer) return;

    let message = schedule.customMessage || template?.content || '';
    message = message
      .replace(/{nama}/g, customer.name)
      .replace(/{perusahaan}/g, customer.company)
      .replace(/{waktu}/g, new Date().getHours() < 12 ? 'pagi' : new Date().getHours() < 18 ? 'siang' : 'malam')
      .replace(/{produk}/g, 'Produk Kami');

    openWhatsApp(customer.phone, message);
    onUpdateStatus(schedule.id, 'sent');
  };

  const getStatusBadge = (status: Schedule['status']) => {
    switch (status) {
      case 'pending':
        return <span className="px-2 py-1 bg-yellow-100 text-yellow-700 text-xs rounded-full">⏳ Pending</span>;
      case 'sent':
        return <span className="px-2 py-1 bg-green-100 text-green-700 text-xs rounded-full">✅ Terkirim</span>;
      case 'cancelled':
        return <span className="px-2 py-1 bg-red-100 text-red-700 text-xs rounded-full">❌ Dibatalkan</span>;
    }
  };

  const renderScheduleCard = (schedule: Schedule) => {
    const customer = customers.find(c => c.id === schedule.customerId);
    const template = templates.find(t => t.id === schedule.templateId);
    const scheduleDate = new Date(`${schedule.scheduledDate}T${schedule.scheduledTime}`);
    const isOverdue = schedule.status === 'pending' && scheduleDate < new Date();

    return (
      <div
        key={schedule.id}
        className={`p-4 rounded-xl border transition-shadow hover:shadow-md ${
          isOverdue ? 'border-red-200 bg-red-50' : 'border-gray-100 bg-white'
        }`}
      >
        <div className="flex flex-col sm:flex-row sm:items-center gap-3">
          <div className="flex items-center gap-3 flex-1 min-w-0">
            <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${
              schedule.status === 'sent' ? 'bg-green-100' :
              schedule.status === 'cancelled' ? 'bg-red-100' :
              isOverdue ? 'bg-red-100' : 'bg-blue-100'
            }`}>
              <span className="text-lg">
                {schedule.status === 'sent' ? '✅' : schedule.status === 'cancelled' ? '❌' : '📱'}
              </span>
            </div>
            <div className="min-w-0">
              <p className="font-medium text-gray-800 truncate">
                {customer?.name || 'Pelanggan tidak ditemukan'}
              </p>
              <p className="text-sm text-gray-500 truncate">
                {template?.name || 'Custom Message'} • {customer?.phone || ''}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3 flex-shrink-0">
            <div className="text-right">
              <p className={`text-sm font-medium ${isOverdue ? 'text-red-600' : 'text-gray-700'}`}>
                {formatDateTime(schedule.scheduledDate, schedule.scheduledTime)}
              </p>
              {isOverdue && <p className="text-xs text-red-500">Terlewat!</p>}
            </div>
            {getStatusBadge(schedule.status)}
          </div>
        </div>

        {/* Message Preview */}
        <div className="mt-3 bg-gray-50 rounded-lg p-3">
          <p className="text-xs text-gray-500 whitespace-pre-line line-clamp-2">
            {schedule.customMessage || template?.content || 'Pesan kosong'}
          </p>
        </div>

        {/* Actions */}
        {schedule.status === 'pending' && (
          <div className="mt-3 flex items-center gap-2">
            <button
              onClick={() => handleSendNow(schedule)}
              className="px-3 py-1.5 bg-green-600 text-white rounded-lg text-xs font-medium hover:bg-green-700 transition-colors"
            >
              📱 Kirim Sekarang
            </button>
            <button
              onClick={() => onUpdateStatus(schedule.id, 'cancelled')}
              className="px-3 py-1.5 bg-red-100 text-red-700 rounded-lg text-xs font-medium hover:bg-red-200 transition-colors"
            >
              Batalkan
            </button>
            <div className="flex-1" />
            <button
              onClick={() => {
                if (confirm('Hapus jadwal ini?')) onDelete(schedule.id);
              }}
              className="px-3 py-1.5 text-red-600 hover:bg-red-50 rounded-lg text-xs font-medium transition-colors"
            >
              🗑️ Hapus
            </button>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row gap-3 justify-between items-start sm:items-center">
        <div>
          <h2 className="text-xl font-bold text-gray-800">Jadwal WhatsApp</h2>
          <p className="text-sm text-gray-500">{pendingSchedules.length} jadwal aktif</p>
        </div>
        <button
          onClick={onAdd}
          className="px-4 py-2 bg-green-600 text-white rounded-lg text-sm font-medium hover:bg-green-700 transition-colors flex items-center gap-2"
        >
          <span>+</span> Buat Jadwal
        </button>
      </div>

      {/* Info Banner */}
      <div className="bg-gradient-to-r from-green-50 to-blue-50 rounded-xl border border-green-200 p-4">
        <div className="flex items-start gap-3">
          <span className="text-2xl">💡</span>
          <div>
            <h3 className="font-medium text-green-800 text-sm">Cara Kerja Jadwal WhatsApp</h3>
            <p className="text-xs text-green-700 mt-1">
              Jadwalkan pengiriman pesan WhatsApp untuk follow-up pelanggan. Saat waktu tiba, 
              Anda akan diingatkan dan bisa langsung mengirim pesan melalui WhatsApp. 
              Klik "Kirim Sekarang" untuk membuka WhatsApp dengan pesan yang sudah disiapkan.
            </p>
          </div>
        </div>
      </div>

      {/* Pending Schedules */}
      <div>
        <h3 className="font-semibold text-gray-700 mb-3 flex items-center gap-2">
          <span>⏳</span> Jadwal Aktif ({pendingSchedules.length})
        </h3>
        {pendingSchedules.length === 0 ? (
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 text-center">
            <span className="text-3xl">📅</span>
            <p className="text-gray-500 mt-2 text-sm">Belum ada jadwal aktif</p>
            <button
              onClick={onAdd}
              className="mt-2 text-sm text-green-600 hover:underline"
            >
              Buat jadwal baru
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            {pendingSchedules.map(renderScheduleCard)}
          </div>
        )}
      </div>

      {/* Sent Schedules */}
      {sentSchedules.length > 0 && (
        <div>
          <h3 className="font-semibold text-gray-700 mb-3 flex items-center gap-2">
            <span>✅</span> Terkirim ({sentSchedules.length})
          </h3>
          <div className="space-y-3">
            {sentSchedules.slice(0, 5).map(renderScheduleCard)}
          </div>
        </div>
      )}

      {/* Cancelled Schedules */}
      {cancelledSchedules.length > 0 && (
        <div>
          <h3 className="font-semibold text-gray-700 mb-3 flex items-center gap-2">
            <span>❌</span> Dibatalkan ({cancelledSchedules.length})
          </h3>
          <div className="space-y-3">
            {cancelledSchedules.slice(0, 3).map(renderScheduleCard)}
          </div>
        </div>
      )}
    </div>
  );
}
