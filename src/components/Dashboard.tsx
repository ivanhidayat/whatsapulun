import { Customer, MessageTemplate, Schedule } from '../types';
import { Page } from '../App';

interface DashboardProps {
  customers: Customer[];
  templates: MessageTemplate[];
  schedules: Schedule[];
  onNavigate: (page: Page) => void;
}

export default function Dashboard({ customers, templates, schedules, onNavigate }: DashboardProps) {
  const activeCustomers = customers.filter(c => c.status === 'active').length;
  const prospectCustomers = customers.filter(c => c.status === 'prospect').length;
  const pendingSchedules = schedules.filter(s => s.status === 'pending').length;
  const todaySchedules = schedules.filter(s => {
    if (s.status !== 'pending') return false;
    const today = new Date().toISOString().split('T')[0];
    return s.scheduledDate === today;
  }).length;

  const upcomingSchedules = schedules
    .filter(s => s.status === 'pending')
    .sort((a, b) => {
      const dateA = new Date(`${a.scheduledDate}T${a.scheduledTime}`);
      const dateB = new Date(`${b.scheduledDate}T${b.scheduledTime}`);
      return dateA.getTime() - dateB.getTime();
    })
    .slice(0, 5);

  const recentCustomers = [...customers]
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 5);

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Total Pelanggan</p>
              <p className="text-2xl font-bold text-gray-800 mt-1">{customers.length}</p>
            </div>
            <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
              <span className="text-2xl">👥</span>
            </div>
          </div>
          <p className="text-xs text-green-600 mt-2">
            {activeCustomers} aktif • {prospectCustomers} prospek
          </p>
        </div>

        <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Template Pesan</p>
              <p className="text-2xl font-bold text-gray-800 mt-1">{templates.length}</p>
            </div>
            <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center">
              <span className="text-2xl">📝</span>
            </div>
          </div>
          <button
            onClick={() => onNavigate('templates')}
            className="text-xs text-purple-600 mt-2 hover:underline"
          >
            Kelola template →
          </button>
        </div>

        <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Jadwal Pending</p>
              <p className="text-2xl font-bold text-gray-800 mt-1">{pendingSchedules}</p>
            </div>
            <div className="w-12 h-12 bg-orange-100 rounded-xl flex items-center justify-center">
              <span className="text-2xl">📅</span>
            </div>
          </div>
          <p className="text-xs text-orange-600 mt-2">
            {todaySchedules} jadwal hari ini
          </p>
        </div>

        <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Pesan Terkirim</p>
              <p className="text-2xl font-bold text-gray-800 mt-1">
                {schedules.filter(s => s.status === 'sent').length}
              </p>
            </div>
            <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
              <span className="text-2xl">✅</span>
            </div>
          </div>
          <p className="text-xs text-green-600 mt-2">
            Total pesan terkirim
          </p>
        </div>
      </div>

      {/* Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Upcoming Schedules */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100">
          <div className="p-5 border-b border-gray-100 flex items-center justify-between">
            <h3 className="font-semibold text-gray-800">📅 Jadwal Mendatang</h3>
            <button
              onClick={() => onNavigate('schedules')}
              className="text-sm text-green-600 hover:underline"
            >
              Lihat semua
            </button>
          </div>
          <div className="p-5">
            {upcomingSchedules.length === 0 ? (
              <p className="text-gray-400 text-sm text-center py-4">Belum ada jadwal</p>
            ) : (
              <div className="space-y-3">
                {upcomingSchedules.map(schedule => {
                  const customer = customers.find(c => c.id === schedule.customerId);
                  return (
                    <div key={schedule.id} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                      <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                        <span className="text-lg">📱</span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-800 truncate">
                          {customer?.name || 'Unknown'}
                        </p>
                        <p className="text-xs text-gray-500">
                          {new Date(`${schedule.scheduledDate}T${schedule.scheduledTime}`).toLocaleDateString('id-ID', {
                            day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit'
                          })}
                        </p>
                      </div>
                      <span className="px-2 py-1 bg-yellow-100 text-yellow-700 text-xs rounded-full">
                        Pending
                      </span>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Recent Customers */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100">
          <div className="p-5 border-b border-gray-100 flex items-center justify-between">
            <h3 className="font-semibold text-gray-800">👥 Pelanggan Terbaru</h3>
            <button
              onClick={() => onNavigate('customers')}
              className="text-sm text-green-600 hover:underline"
            >
              Lihat semua
            </button>
          </div>
          <div className="p-5">
            {recentCustomers.length === 0 ? (
              <p className="text-gray-400 text-sm text-center py-4">Belum ada pelanggan</p>
            ) : (
              <div className="space-y-3">
                {recentCustomers.map(customer => (
                  <div key={customer.id} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                    <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                      <span className="text-sm font-bold text-blue-600">
                        {customer.name.charAt(0).toUpperCase()}
                      </span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-800 truncate">{customer.name}</p>
                      <p className="text-xs text-gray-500 truncate">{customer.phone}</p>
                    </div>
                    <span className={`px-2 py-1 text-xs rounded-full ${
                      customer.status === 'active' ? 'bg-green-100 text-green-700' :
                      customer.status === 'prospect' ? 'bg-yellow-100 text-yellow-700' :
                      'bg-gray-100 text-gray-700'
                    }`}>
                      {customer.status === 'active' ? 'Aktif' : customer.status === 'prospect' ? 'Prospek' : 'Tidak Aktif'}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-gradient-to-r from-green-600 to-green-700 rounded-xl p-6 text-white">
        <h3 className="font-bold text-lg mb-2">⚡ Aksi Cepat</h3>
        <p className="text-green-100 text-sm mb-4">Mulai kelola pelanggan dan jadwalkan pesan WhatsApp Anda</p>
        <div className="flex flex-wrap gap-3">
          <button
            onClick={() => onNavigate('customers')}
            className="px-4 py-2 bg-white text-green-700 rounded-lg text-sm font-medium hover:bg-green-50 transition-colors"
          >
            + Tambah Pelanggan
          </button>
          <button
            onClick={() => onNavigate('schedules')}
            className="px-4 py-2 bg-white/20 text-white rounded-lg text-sm font-medium hover:bg-white/30 transition-colors border border-white/30"
          >
            📅 Buat Jadwal
          </button>
          <button
            onClick={() => onNavigate('templates')}
            className="px-4 py-2 bg-white/20 text-white rounded-lg text-sm font-medium hover:bg-white/30 transition-colors border border-white/30"
          >
            📝 Kelola Template
          </button>
        </div>
      </div>
    </div>
  );
}
