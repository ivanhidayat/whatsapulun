import { useState, useEffect, useRef } from 'react';
import { openWAService, getOpenWAConfig, saveOpenWAConfig } from '../services/openwa';

interface OpenWALoginProps {
  onClose: () => void;
  onConnected: () => void;
}

export default function OpenWALogin({ onClose, onConnected }: OpenWALoginProps) {
  const [qrData, setQrData] = useState<string | null>(null);
  const [status, setStatus] = useState<'idle' | 'loading' | 'qr_ready' | 'connecting' | 'connected' | 'error'>('idle');
  const [error, setError] = useState<string | null>(null);
  const [countdown, setCountdown] = useState(0);
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const config = getOpenWAConfig();

  useEffect(() => {
    startSession();
    return () => {
      if (pollRef.current) clearInterval(pollRef.current);
    };
  }, []);

  const startSession = async () => {
    setStatus('loading');
    setError(null);

    if (!config.apiUrl || !config.apiKey) {
      setError('OpenWA belum dikonfigurasi. Silakan atur di Settings terlebih dahulu.');
      setStatus('error');
      return;
    }

    try {
      // Start the session
      await openWAService.startSession();
      setStatus('qr_ready');
      
      // Start polling for QR code
      pollQRCode();
    } catch (err: any) {
      // Session might already exist, try getting QR directly
      try {
        const qrResult = await openWAService.getQRCode();
        if (qrResult?.qr) {
          setQrData(qrResult.qr);
          setStatus('qr_ready');
          pollQRCode();
        } else {
          // Check if already connected
          const sessionStatus = await openWAService.getSessionStatus();
          if (sessionStatus.connected) {
            setStatus('connected');
            saveOpenWAConfig({ connected: true, sessionStatus: 'connected' });
            onConnected();
          } else {
            setError(`Status sesi: ${sessionStatus.status}. Coba restart OpenWA server.`);
            setStatus('error');
          }
        }
      } catch {
        setError(err.message || 'Gagal memulai sesi. Pastikan OpenWA server berjalan.');
        setStatus('error');
      }
    }
  };

  const pollQRCode = async () => {
    // Clear existing poll
    if (pollRef.current) clearInterval(pollRef.current);

    setCountdown(20);
    
    const fetchQR = async () => {
      try {
        const result = await openWAService.getQRCode();
        
        // Check session status first
        const sessionStatus = await openWAService.getSessionStatus();
        
        if (sessionStatus.connected) {
          setStatus('connected');
          saveOpenWAConfig({ connected: true, sessionStatus: 'connected' });
          if (pollRef.current) clearInterval(pollRef.current);
          onConnected();
          return;
        }

        if (result?.qr) {
          setQrData(result.qr);
          setStatus('qr_ready');
          setCountdown(20);
        } else if (sessionStatus.status === 'connecting' || sessionStatus.status === 'authenticated') {
          setStatus('connecting');
        }
      } catch {
        // Silently fail polling
      }
    };

    // Initial fetch
    fetchQR();
    
    // Poll every 3 seconds
    pollRef.current = setInterval(fetchQR, 3000);

    // Countdown timer
    const countdownInterval = setInterval(() => {
      setCountdown(prev => {
        if (prev <= 1) return 20;
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(countdownInterval);
  };

  const handleRetry = () => {
    if (pollRef.current) clearInterval(pollRef.current);
    startSession();
  };

  const renderContent = () => {
    switch (status) {
      case 'loading':
        return (
          <div className="text-center py-8">
            <div className="w-16 h-16 border-4 border-green-500 border-t-transparent rounded-full animate-spin mx-auto" />
            <p className="text-gray-600 mt-4">Memulai sesi WhatsApp...</p>
          </div>
        );

      case 'qr_ready':
        return (
          <div className="text-center">
            <div className="bg-white p-4 rounded-xl border-2 border-green-200 inline-block mb-4">
              {qrData ? (
                <img 
                  src={qrData} 
                  alt="QR Code WhatsApp" 
                  className="w-64 h-64 mx-auto"
                  onError={() => {
                    // If QR is base64 text, display as text
                    setQrData(null);
                  }}
                />
              ) : (
                <div className="w-64 h-64 bg-gray-100 rounded-lg flex items-center justify-center">
                  <p className="text-gray-400 text-sm">Memuat QR Code...</p>
                </div>
              )}
            </div>
            <h3 className="font-semibold text-gray-800 mb-2">Scan QR Code dengan WhatsApp</h3>
            <div className="text-sm text-gray-600 space-y-1">
              <p>1. Buka WhatsApp di ponsel</p>
              <p>2. Ketuk <strong>⋮</strong> atau <strong>Pengaturan</strong></p>
              <p>3. Pilih <strong>Perangkat Tertaut</strong></p>
              <p>4. Ketuk <strong>Tautkan Perangkat</strong></p>
              <p>5. Arahkan kamera ke QR Code di atas</p>
            </div>
            <div className="mt-4 flex items-center justify-center gap-2 text-sm text-gray-500">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
              <span>QR berlaku {countdown} detik lagi</span>
            </div>
            <button
              onClick={handleRetry}
              className="mt-4 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-200"
            >
              🔄 Refresh QR Code
            </button>
          </div>
        );

      case 'connecting':
        return (
          <div className="text-center py-8">
            <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto" />
            <p className="text-gray-600 mt-4">Menghubungkan ke WhatsApp...</p>
            <p className="text-sm text-gray-400 mt-2">Mohon tunggu sebentar</p>
          </div>
        );

      case 'connected':
        return (
          <div className="text-center py-8">
            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-4xl">✅</span>
            </div>
            <h3 className="font-bold text-green-800 text-lg">WhatsApp Terhubung!</h3>
            <p className="text-gray-600 mt-2">
              Akun WhatsApp Anda berhasil terhubung ke OpenWA.
              Pesan sekarang bisa dikirim secara otomatis.
            </p>
            <button
              onClick={onClose}
              className="mt-6 px-6 py-2 bg-green-600 text-white rounded-lg text-sm font-medium hover:bg-green-700"
            >
              Mulai Menggunakan
            </button>
          </div>
        );

      case 'error':
        return (
          <div className="text-center py-8">
            <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-4xl">❌</span>
            </div>
            <h3 className="font-bold text-red-800 text-lg">Gagal Terhubung</h3>
            <p className="text-gray-600 mt-2 text-sm">{error}</p>
            <div className="mt-4 bg-yellow-50 border border-yellow-200 rounded-lg p-3 text-left">
              <p className="text-xs text-yellow-700 font-medium mb-1">Kemungkinan penyebab:</p>
              <ul className="text-xs text-yellow-700 list-disc list-inside space-y-0.5">
                <li>OpenWA server belum dijalankan</li>
                <li>URL atau API Key salah</li>
                <li>Session ID sudah digunakan</li>
                <li>Network/firewall memblokir koneksi</li>
              </ul>
            </div>
            <button
              onClick={handleRetry}
              className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700"
            >
              🔄 Coba Lagi
            </button>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b border-gray-100">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-gray-800">📱 Login WhatsApp</h2>
            <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg">✕</button>
          </div>
        </div>

        <div className="p-6">
          {renderContent()}
        </div>
      </div>
    </div>
  );
}
