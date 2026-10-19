import { useState, useEffect } from 'react';
import { getOpenWAConfig, saveOpenWAConfig, openWAService } from '../services/openwa';

interface OpenWASettingsProps {
  onClose: () => void;
  onConnectionChange: () => void;
}

export default function OpenWASettings({ onClose, onConnectionChange }: OpenWASettingsProps) {
  const [config, setConfig] = useState(getOpenWAConfig());
  const [testing, setTesting] = useState(false);
  const [testResult, setTestResult] = useState<{ success: boolean; message: string } | null>(null);
  const [saving, setSaving] = useState(false);

  const handleSave = () => {
    setSaving(true);
    const updated = saveOpenWAConfig({
      apiUrl: config.apiUrl,
      apiKey: config.apiKey,
      sessionId: config.sessionId,
    });
    setConfig(updated);
    setSaving(false);
    setTestResult({ success: true, message: 'Konfigurasi berhasil disimpan!' });
    onConnectionChange();
  };

  const handleTestConnection = async () => {
    setTesting(true);
    setTestResult(null);
    try {
      const status = await openWAService.getSessionStatus();
      if (status.connected) {
        setTestResult({ success: true, message: `✅ Terhubung! Status: ${status.status}` });
        saveOpenWAConfig({ connected: true, sessionStatus: 'connected' });
      } else {
        setTestResult({ success: false, message: `⚠️ Server terhubung tapi sesi belum aktif. Status: ${status.status}` });
        saveOpenWAConfig({ connected: false, sessionStatus: status.status as any });
      }
    } catch (error: any) {
      setTestResult({ success: false, message: `❌ Gagal: ${error.message}` });
    }
    setTesting(false);
    onConnectionChange();
  };

  const handleDisconnect = async () => {
    if (confirm('Putuskan koneksi OpenWA?')) {
      saveOpenWAConfig({ connected: false, sessionStatus: 'disconnected' });
      setConfig({ ...config, connected: false, sessionStatus: 'disconnected' });
      setTestResult({ success: true, message: 'Berhasil diputuskan.' });
      onConnectionChange();
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b border-gray-100">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-gray-800">⚙️ Pengaturan OpenWA</h2>
            <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg">✕</button>
          </div>
        </div>

        <div className="p-6 space-y-5">
          {/* Connection Status */}
          <div className={`p-4 rounded-xl border ${
            config.connected 
              ? 'bg-green-50 border-green-200' 
              : 'bg-red-50 border-red-200'
          }`}>
            <div className="flex items-center gap-3">
              <div className={`w-3 h-3 rounded-full ${config.connected ? 'bg-green-500 animate-pulse' : 'bg-red-500'}`} />
              <div>
                <p className={`font-medium text-sm ${config.connected ? 'text-green-800' : 'text-red-800'}`}>
                  {config.connected ? '🟢 WhatsApp Terhubung' : '🔴 WhatsApp Tidak Terhubung'}
                </p>
                <p className="text-xs text-gray-600 mt-0.5">
                  Status: {config.sessionStatus}
                </p>
              </div>
            </div>
          </div>

          {/* API URL */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              OpenWA API URL *
            </label>
            <input
              type="url"
              value={config.apiUrl}
              onChange={(e) => setConfig({ ...config, apiUrl: e.target.value })}
              className="w-full px-4 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-green-500 focus:border-transparent"
              placeholder="http://localhost:2785"
            />
            <p className="text-xs text-gray-400 mt-1">
              URL server OpenWA Anda (contoh: http://localhost:2785)
            </p>
          </div>

          {/* API Key */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              API Key *
            </label>
            <input
              type="password"
              value={config.apiKey}
              onChange={(e) => setConfig({ ...config, apiKey: e.target.value })}
              className="w-full px-4 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-green-500 focus:border-transparent font-mono"
              placeholder="Masukkan API Key OpenWA"
            />
            <p className="text-xs text-gray-400 mt-1">
              API Key dari OpenWA (ditemukan di data/.api-key)
            </p>
          </div>

          {/* Session ID */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Session ID
            </label>
            <input
              type="text"
              value={config.sessionId}
              onChange={(e) => setConfig({ ...config, sessionId: e.target.value })}
              className="w-full px-4 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-green-500 focus:border-transparent"
              placeholder="crm-session"
            />
            <p className="text-xs text-gray-400 mt-1">
              Nama sesi WhatsApp (default: crm-session)
            </p>
          </div>

          {/* Test Result */}
          {testResult && (
            <div className={`p-3 rounded-lg text-sm ${
              testResult.success ? 'bg-green-50 text-green-700' : 'bg-yellow-50 text-yellow-700'
            }`}>
              {testResult.message}
            </div>
          )}

          {/* Actions */}
          <div className="flex flex-wrap gap-2">
            <button
              onClick={handleSave}
              disabled={saving}
              className="px-4 py-2 bg-green-600 text-white rounded-lg text-sm font-medium hover:bg-green-700 transition-colors disabled:opacity-50"
            >
              {saving ? 'Menyimpan...' : '💾 Simpan'}
            </button>
            <button
              onClick={handleTestConnection}
              disabled={testing || !config.apiUrl || !config.apiKey}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors disabled:opacity-50"
            >
              {testing ? 'Mengecek...' : '🔌 Test Koneksi'}
            </button>
            {config.connected && (
              <button
                onClick={handleDisconnect}
                className="px-4 py-2 bg-red-100 text-red-700 rounded-lg text-sm font-medium hover:bg-red-200 transition-colors"
              >
                🔌 Putuskan
              </button>
            )}
          </div>

          {/* Info */}
          <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
            <h4 className="font-medium text-blue-800 text-sm mb-2">📖 Cara Setup OpenWA</h4>
            <ol className="text-xs text-blue-700 space-y-1 list-decimal list-inside">
              <li>Install OpenWA: <code className="bg-blue-100 px-1 rounded">git clone https://github.com/rmyndharis/OpenWA.git</code></li>
              <li>Jalankan: <code className="bg-blue-100 px-1 rounded">docker compose up -d</code></li>
              <li>Ambil API Key dari log atau <code className="bg-blue-100 px-1 rounded">data/.api-key</code></li>
              <li>Masukkan URL & API Key di form di atas</li>
              <li>Klik "Test Koneksi" untuk memastikan server berjalan</li>
              <li>Scan QR code di halaman Login untuk menghubungkan WhatsApp</li>
            </ol>
          </div>
        </div>
      </div>
    </div>
  );
}
