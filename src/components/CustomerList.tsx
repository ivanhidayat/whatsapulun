import { useState } from 'react';
import { Customer } from '../types';
import { openWhatsApp, formatDate } from '../utils/storage';

import { sendWhatsAppMessage, isAutoSendAvailable } from '../services/messageSender';

interface CustomerListProps {
  customers: Customer[];
  onAdd: () => void;
  onEdit: (customer: Customer) => void;
  onDelete: (id: string) => void;
  waConnected?: boolean;
}

export default function CustomerList({ customers, onAdd, onEdit, onDelete, waConnected }: CustomerListProps) {
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [quickMessage, setQuickMessage] = useState('');

  const filteredCustomers = customers.filter(c => {
    const matchSearch = c.name.toLowerCase().includes(search.toLowerCase()) ||
      c.phone.includes(search) ||
      c.company.toLowerCase().includes(search.toLowerCase());
    const matchStatus = filterStatus === 'all' || c.status === filterStatus;
    return matchSearch && matchStatus;
  });

  const handleSendWhatsApp = async (customer: Customer) => {
    const message = quickMessage || `Halo ${customer.name}, ada yang bisa kami bantu?`;
    if (waConnected) {
      const result = await sendWhatsAppMessage(customer, message);
      if (result.method === 'openwa') {
        alert('✅ ' + result.message);
      }
    } else {
      openWhatsApp(customer.phone, message);
    }
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row gap-3 justify-between items-start sm:items-center">
        <div>
          <h2 className="text-xl font-bold text-gray-800">Daftar Pelanggan</h2>
          <p className="text-sm text-gray-500">{customers.length} pelanggan terdaftar</p>
        </div>
        <button
          onClick={onAdd}
          className="px-4 py-2 bg-green-600 text-white rounded-lg text-sm font-medium hover:bg-green-700 transition-colors flex items-center gap-2"
        >
          <span>+</span> Tambah Pelanggan
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="flex-1">
            <input
              type="text"
              placeholder="Cari nama, nomor, atau perusahaan..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full px-4 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-green-500 focus:border-transparent"
            />
          </div>
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="px-4 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-green-500 focus:border-transparent"
          >
            <option value="all">Semua Status</option>
            <option value="active">Aktif</option>
            <option value="prospect">Prospek</option>
            <option value="inactive">Tidak Aktif</option>
          </select>
        </div>
      </div>

      {/* Quick Message Input */}
      {selectedCustomer && (
        <div className="bg-green-50 rounded-xl border border-green-200 p-4">
          <div className="flex items-center gap-2 mb-3">
            <span className="text-lg">💬</span>
            <h3 className="font-medium text-green-800">
              Kirim WhatsApp ke {selectedCustomer.name}
            </h3>
          </div>
          <div className="flex flex-col sm:flex-row gap-3">
            <textarea
              value={quickMessage}
              onChange={(e) => setQuickMessage(e.target.value)}
              placeholder="Tulis pesan cepat atau kosongkan untuk pesan default..."
              className="flex-1 px-4 py-2 border border-green-200 rounded-lg text-sm focus:ring-2 focus:ring-green-500 focus:border-transparent resize-none"
              rows={2}
            />
            <div className="flex gap-2">
              <button
                onClick={() => handleSendWhatsApp(selectedCustomer)}
                className="px-4 py-2 bg-green-600 text-white rounded-lg text-sm font-medium hover:bg-green-700 transition-colors whitespace-nowrap"
              >
                📱 Kirim via WhatsApp
              </button>
              <button
                onClick={() => setSelectedCustomer(null)}
                className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-300 transition-colors"
              >
                ✕
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Customer List */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        {filteredCustomers.length === 0 ? (
          <div className="p-8 text-center">
            <span className="text-4xl">👥</span>
            <p className="text-gray-500 mt-2">Belum ada pelanggan</p>
            <button
              onClick={onAdd}
              className="mt-3 text-sm text-green-600 hover:underline"
            >
              Tambah pelanggan pertama
            </button>
          </div>
        ) : (
          <div className="divide-y divide-gray-100">
            {filteredCustomers.map(customer => (
              <div key={customer.id} className="p-4 hover:bg-gray-50 transition-colors">
                <div className="flex flex-col sm:flex-row sm:items-center gap-3">
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    <div className="w-10 h-10 bg-gradient-to-br from-green-400 to-green-600 rounded-full flex items-center justify-center flex-shrink-0">
                      <span className="text-white font-bold text-sm">
                        {customer.name.charAt(0).toUpperCase()}
                      </span>
                    </div>
                    <div className="min-w-0">
                      <p className="font-medium text-gray-800 truncate">{customer.name}</p>
                      <p className="text-sm text-gray-500 truncate">{customer.phone} • {customer.company}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <span className={`px-2 py-1 text-xs rounded-full ${
                      customer.status === 'active' ? 'bg-green-100 text-green-700' :
                      customer.status === 'prospect' ? 'bg-yellow-100 text-yellow-700' :
                      'bg-gray-100 text-gray-700'
                    }`}>
                      {customer.status === 'active' ? 'Aktif' : customer.status === 'prospect' ? 'Prospek' : 'Tidak Aktif'}
                    </span>
                    <span className="text-xs text-gray-400 hidden sm:block">
                      {formatDate(customer.lastContact)}
                    </span>
                  </div>
                  <div className="flex items-center gap-1 flex-shrink-0">
                    <button
                      onClick={() => setSelectedCustomer(customer)}
                      className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                      title="Kirim WhatsApp"
                    >
                      📱
                    </button>
                    <button
                      onClick={() => onEdit(customer)}
                      className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                      title="Edit"
                    >
                      ✏️
                    </button>
                    <button
                      onClick={() => {
                        if (confirm('Hapus pelanggan ini?')) onDelete(customer.id);
                      }}
                      className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                      title="Hapus"
                    >
                      🗑️
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
