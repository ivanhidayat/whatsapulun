import { getOpenWAConfig } from '../services/openwa';

interface ConnectionStatusProps {
  onSettingsClick: () => void;
  onLoginClick: () => void;
}

export default function ConnectionStatus({ onSettingsClick, onLoginClick }: ConnectionStatusProps) {
  const config = getOpenWAConfig();
  const isConnected = config.connected && config.sessionStatus === 'connected';
  const isConfigured = !!config.apiUrl && !!config.apiKey;

  return (
    <div className="flex items-center gap-2">
      {/* Connection Badge */}
      <button
        onClick={isConnected ? undefined : isConfigured ? onLoginClick : onSettingsClick}
        className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
          isConnected
            ? 'bg-green-100 text-green-700 hover:bg-green-200'
            : isConfigured
            ? 'bg-yellow-100 text-yellow-700 hover:bg-yellow-200 animate-pulse'
            : 'bg-red-100 text-red-700 hover:bg-red-200'
        }`}
        title={
          isConnected 
            ? 'WhatsApp terhubung via OpenWA' 
            : isConfigured 
            ? 'Klik untuk login WhatsApp' 
            : 'Klik untuk mengatur OpenWA'
        }
      >
        <div className={`w-2 h-2 rounded-full ${
          isConnected ? 'bg-green-500' : isConfigured ? 'bg-yellow-500' : 'bg-red-500'
        }`} />
        <span className="hidden sm:inline">
          {isConnected ? 'WA Connected' : isConfigured ? 'Login WA' : 'Setup WA'}
        </span>
      </button>

      {/* Settings Button */}
      <button
        onClick={onSettingsClick}
        className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
        title="Pengaturan OpenWA"
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.066 2.573c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.573 1.066c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.066-2.573c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
      </button>
    </div>
  );
}
