import { useState, useEffect } from 'react';
import { getOpenWAConfig, saveOpenWAConfig, openWAService } from '../services/openwa';

interface WhatsAppPageProps {
  onConnectionChange: () => void;
}

export default function WhatsAppPage({ onConnectionChange }: WhatsAppPageProps) {
  const [config, setConfig] = useState(getOpenWAConfig());
  const [qrData, setQrData] = useState<string | null>(null);
  const [sessionStatus, setSessionStatus] = useState<string>('disconnected');
  const [loading, setLoading] = useState(false);
  const [testing, setTesting] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error' | 'info'; text: string } | null>(null);
  const [showSettings, setShowSettings] = useState(false);
  const [tempUrl, setTempUrl] = useState(config.apiUrl);
  const [tempApiKey, setTempApiKey] = useState(config.apiKey);
  const [tempSessionId, setTempSessionId] = useState(config.sessionId);

  useEffect(() => {
    checkStatus();
  }, []);

  const checkStatus = async () => {
    if (!config.apiUrl || !config.apiKey) {
      setSessionStatus('not_configured');
      return;
    }
    
    try {
      const status = await openWAService.getSessionStatus();
      setSessionStatus(status.connected ? 'connected' : status.status);
      if (status.connected) {
        saveOpenWAConfig({ connected: true, sessionStatus: 'connected' });
      } else {
        saveOpenWAConfig({ connected: false, sessionStatus: status.status as any });
      }
      onConnectionChange();
    } catch {
      setSessionStatus('error');
    }
  };

  const handleSaveSettings = () => {
    const updated = saveOpenWAConfig({
      apiUrl: tempUrl,
      apiKey: tempApiKey,
      sessionId: tempSessionId,
    });
    setConfig(updated);
    setShowSettings(false);
    setMessage({ type: 'success', text: '✅ Pengaturan berhasil disimpan!' });
    checkStatus();
  };

  const handleStartSession = async () => {
    setLoading(true);
    setMessage(null);
    
    if (!config.apiUrl || !config.apiKey) {
      setMessage({ type: 'error', text: '❌ Harap isi pengaturan OpenWA terlebih dahulu!' });
      setShowSettings(true);
      setLoading(false);
      return;
    }

    try {
      await openWAService.startSession();
      setMessage({ type: 'info', text: '🔄 Memulai sesi... Silakan scan QR Code.' });
      
      // Poll for QR code
      const pollInterval = setInterval(async () => {
        try {
          const qrResult = await openWAService.getQRCode();
          if (qrResult?.qr) {
            setQrData(qrResult.qr);
            clearInterval(pollInterval);
          }
          
          // Check if connected
          const status = await openWAService.getSessionStatus();
          if (status.connected) {
            clearInterval(pollInterval);
            setQrData(null);
            setSessionStatus('connected');
            saveOpenWAConfig({ connected: true, sessionStatus: 'connected' });
            setMessage({ type: 'success', text: '✅ WhatsApp berhasil terhubung!' });
            onConnectionChange();
          }
        } catch {
          // Continue polling
        }
      }, 2000);

      // Stop polling after 60 seconds
      setTimeout(() => {
        clearInterval(pollInterval);
        if (!qrData) {
          setMessage({ type: 'error', text: '⏱️ Timeout. Coba lagi.' });
        }
      }, 60000);
    } catch (error: any) {
      setMessage({ type: 'error', text: `❌ Error: ${error.message}` });
    }
    setLoading(false);
  };

  const handleStopSession = async () => {
    setLoading(true);
    try {
      await openWAService.stopSession();
      setSessionStatus('disconnected');
      setQrData(null);
      saveOpenWAConfig({ connected: false, sessionStatus: 'disconnected' });
      setMessage({ type: 'info', text: '🔌 Sesi WhatsApp dihentikan.' });
      onConnectionChange();
    } catch (error: any) {
      setMessage({ type: 'error', text: `❌ Error: ${error.message}` });
    }
    setLoading(false);
  };

  const handleTestConnection = async () => {
    setTesting(true);
    setMessage(null);
    try {
      const status = await openWAService.getSessionStatus();
      if (status.connected) {
        setMessage({ type: 'success', text: `✅ Terhubung ke OpenWA! Status: ${status.status}` });
      } else {
        setMessage({ type: 'info', text: `⚠️ Server OpenWA berjalan, tapi sesi belum aktif. Status: ${status.status}` });
      }
    } catch (error: any) {
      setMessage({ type: 'error', text: `❌ Gagal koneksi: ${error.message}` });
    }
    setTesting(false);
  };

  const isConnected = sessionStatus === 'connected';
  const isNotConfigured = sessionStatus === 'not_configured';

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-gray-800">📱 WhatsApp</h2>
        <p className="text-gray-500">Kelola koneksi WhatsApp melalui OpenWA</p>
      </div>

      {/* Connection Status Card */}
      <div className={`rounded-2xl p-6 border-2 ${
        isConnected 
          ? 'bg-green-50 border-green-300' 
          : isNotConfigured
          ? 'bg-red-50 border-red-300'
          : 'bg-yellow-50 border-yellow-300'
      }`}>
        <div className="flex items-center gap-4">
          <div className={`w-16 h-16 rounded-full flex items-center justify-center ${
            isConnected ? 'bg-green-200' : isNotConfigured ? 'bg-red-200' : 'bg-yellow-200'
          }`}>
            <span className="text-3xl">
              {isConnected ? '✅' : isNotConfigured ? '⚠️' : '📱'}
            </span>
          </div>
          <div className="flex-1">
            <h3 className={`text-lg font-bold ${
              isConnected ? 'text-green-800' : isNotConfigured ? 'text-red-800' : 'text-yellow-800'
            }`}>
              {isConnected 
                ? 'WhatsApp Terhubung' 
                : isNotConfigured
                ? 'Belum Dikonfigurasi'
                : 'Belum Terhubung'}
            </h3>
            <p className={`text-sm ${
              isConnected ? 'text-green-700' : isNotConfigured ? 'text-red-700' : 'text-yellow-700'
            }`}>
              {isConnected 
                ? `Session: ${config.sessionId} • Siap mengirim pesan otomatis`
                : isNotConfigured
                ? 'Klik "Pengaturan" di bawah untuk setup OpenWA'
                : `Status: ${sessionStatus}`}
            </p>
          </div>
        </div>
      </div>

      {/* Message Alert */}
      {message && (
        <div className={`p-4 rounded-xl border ${
          message.type === 'success' ? 'bg-green-50 border-green-200 text-green-800' :
          message.type === 'error' ? 'bg-red-50 border-red-200 text-red-800' :
          'bg-blue-50 border-blue-200 text-blue-800'
        }`}>
          {message.text}
        </div>
      )}

      {/* QR Code Section */}
      {qrData && (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
          <h3 className="font-bold text-gray-800 mb-4 text-center">📷 Scan QR Code</h3>
          <div className="flex justify-center mb-4">
            <div className="bg-white p-4 rounded-xl border-2 border-green-300">
              <img src={qrData} alt="QR Code" className="w-64 h-64" />
            </div>
          </div>
          <div className="text-center space-y-2">
            <p className="text-sm text-gray-600">
              Buka WhatsApp → <strong>Menu</strong> → <strong>Perangkat Tertaut</strong> → <strong>Tautkan Perangkat</strong>
            </p>
            <p className="text-xs text-gray-500">QR Code akan refresh otomatis</p>
          </div>
        </div>
      )}

      {/* Action Buttons */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {!isConnected && !isNotConfigured && (
          <button
            onClick={handleStartSession}
            disabled={loading}
            className="px-6 py-3 bg-green-600 text-white rounded-xl font-medium hover:bg-green-700 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Memulai...
              </>
            ) : (
              <>📱 Mulai Sesi / Login</>
            )}
          </button>
        )}

        {isConnected && (
          <button
            onClick={handleStopSession}
            disabled={loading}
            className="px-6 py-3 bg-red-600 text-white rounded-xl font-medium hover:bg-red-700 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {loading ? 'Memproses...' : '🔌 Putuskan Koneksi'}
          </button>
        )}

        <button
          onClick={() => setShowSettings(!showSettings)}
          className="px-6 py-3 bg-blue-600 text-white rounded-xl font-medium hover:bg-blue-700 transition-colors flex items-center justify-center gap-2"
        >
          ⚙️ {showSettings ? 'Tutup' : 'Buka'} Pengaturan
        </button>

        {!isNotConfigured && (
          <button
            onClick={handleTestConnection}
            disabled={testing}
            className="px-6 py-3 bg-purple-600 text-white rounded-xl font-medium hover:bg-purple-700 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {testing ? 'Mengecek...' : '🔌 Test Koneksi'}
          </button>
        )}
      </div>

      {/* Settings Panel */}
      {showSettings && (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 space-y-4">
          <h3 className="font-bold text-gray-800 flex items-center gap-2">
            <span>⚙️</span> Pengaturan OpenWA
          </h3>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              URL Server OpenWA *
            </label>
            <input
              type="url"
              value={tempUrl}
              onChange={(e) => setTempUrl(e.target.value)}
              className="w-full px-4 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-green-500 focus:border-transparent"
              placeholder="http://localhost:2785"
            />
            <p className="text-xs text-gray-400 mt-1">
              Contoh: http://localhost:2785 (default port OpenWA)
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              API Key *
            </label>
            <input
              type="password"
              value={tempApiKey}
              onChange={(e) => setTempApiKey(e.target.value)}
              className="w-full px-4 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-green-500 focus:border-transparent font-mono"
              placeholder="Masukkan API Key dari OpenWA"
            />
            <p className="text-xs text-gray-400 mt-1">
              Ditemukan di file <code className="bg-gray-100 px-1 rounded">data/.api-key</code> saat pertama kali menjalankan OpenWA
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Session ID
            </label>
            <input
              type="text"
              value={tempSessionId}
              onChange={(e) => setTempSessionId(e.target.value)}
              className="w-full px-4 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-green-500 focus:border-transparent"
              placeholder="crm-session"
            />
          </div>

          <button
            onClick={handleSaveSettings}
            className="w-full px-4 py-2 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 transition-colors"
          >
            💾 Simpan Pengaturan
          </button>
        </div>
      )}

      {/* How to Setup Guide */}
      <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl border border-blue-200 p-6">
        <h3 className="font-bold text-blue-800 mb-3 flex items-center gap-2">
          <span>📖</span> Cara Setup OpenWA
        </h3>
        <div className="space-y-3 text-sm text-blue-700">
          <div className="flex gap-3">
            <span className="flex-shrink-0 w-6 h-6 bg-blue-200 text-blue-800 rounded-full flex items-center justify-center text-xs font-bold">1</span>
            <div>
              <p className="font-medium">Install OpenWA Server</p>
              <code className="text-xs bg-blue-100 px-2 py-1 rounded mt-1 block">
                git clone https://github.com/rmyndharis/OpenWA.git
              </code>
            </div>
          </div>
          <div className="flex gap-3">
            <span className="flex-shrink-0 w-6 h-6 bg-blue-200 text-blue-800 rounded-full flex items-center justify-center text-xs font-bold">2</span>
            <div>
              <p className="font-medium">Jalankan dengan Docker</p>
              <code className="text-xs bg-blue-100 px-2 py-1 rounded mt-1 block">
                cd OpenWA && docker compose up -d
              </code>
            </div>
          </div>
          <div className="flex gap-3">
            <span className="flex-shrink-0 w-6 h-6 bg-blue-200 text-blue-800 rounded-full flex items-center justify-center text-xs font-bold">3</span>
            <div>
              <p className="font-medium">Ambil API Key</p>
              <p className="text-xs mt-1">Lihat di log atau file <code className="bg-blue-100 px-1 rounded">data/.api-key</code></p>
            </div>
          </div>
          <div className="flex gap-3">
            <span className="flex-shrink-0 w-6 h-6 bg-blue-200 text-blue-800 rounded-full flex items-center justify-center text-xs font-bold">4</span>
            <div>
              <p className="font-medium">Masukkan URL & API Key di Pengaturan di atas</p>
            </div>
          </div>
          <div className="flex gap-3">
            <span className="flex-shrink-0 w-6 h-6 bg-blue-200 text-blue-800 rounded-full flex items-center justify-center text-xs font-bold">5</span>
            <div>
              <p className="font-medium">Klik "Mulai Sesi / Login"</p>
              <p className="text-xs mt-1">Scan QR Code dengan WhatsApp di HP Anda</p>
            </div>
          </div>
        </div>
      </div>

      {/* Info about auto-send */}
      {isConnected && (
        <div className="bg-green-50 border border-green-200 rounded-2xl p-6">
          <h3 className="font-bold text-green-800 mb-2 flex items-center gap-2">
            <span>🤖</span> Mode Otomatis Aktif!
          </h3>
          <p className="text-sm text-green-700">
            Pesan WhatsApp sekarang bisa dikirim <strong>secara otomatis</strong> tanpa perlu membuka WhatsApp manual. 
            Fitur ini bekerja di:
          </p>
          <ul className="text-sm text-green-700 mt-2 space-y-1 list-disc list-inside">
            <li>Halaman <strong>Pelanggan</strong> - tombol kirim WhatsApp</li>
            <li>Halaman <strong>Template</strong> - kirim test template</li>
            <li>Halaman <strong>Jadwal</strong> - kirim otomatis sesuai jadwal</li>
          </ul>
        </div>
      )}
    </div>
  );
}
