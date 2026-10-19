import { Page } from '../App';

interface SidebarProps {
  currentPage: Page;
  onNavigate: (page: Page) => void;
  isOpen: boolean;
  waConnected?: boolean;
  onLoginClick?: () => void;
  onSettingsClick?: () => void;
}

export default function Sidebar({ currentPage, onNavigate, isOpen, waConnected, onLoginClick, onSettingsClick }: SidebarProps) {
  const menuItems: { page: Page; label: string; icon: string }[] = [
    { page: 'dashboard', label: 'Dashboard', icon: '📊' },
    { page: 'customers', label: 'Pelanggan', icon: '👥' },
    { page: 'templates', label: 'Template Pesan', icon: '📝' },
    { page: 'schedules', label: 'Jadwal WhatsApp', icon: '📅' },
    { page: 'whatsapp', label: 'WhatsApp', icon: '📱' },
  ];

  return (
    <aside
      className={`fixed lg:static inset-y-0 left-0 z-30 w-64 bg-gradient-to-b from-green-800 to-green-900 text-white transform transition-transform duration-300 ease-in-out ${
        isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
      }`}
    >
      <div className="p-6 border-b border-green-700">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center">
            <span className="text-2xl">💬</span>
          </div>
          <div>
            <h2 className="font-bold text-lg">WA CRM</h2>
            <p className="text-green-300 text-xs">Customer Management</p>
          </div>
        </div>
      </div>

      <nav className="p-4 space-y-1">
        {menuItems.map((item) => (
          <button
            key={item.page}
            onClick={() => onNavigate(item.page)}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-left transition-all duration-200 ${
              currentPage === item.page
                ? 'bg-white/20 text-white shadow-lg'
                : 'text-green-200 hover:bg-white/10 hover:text-white'
            }`}
          >
            <span className="text-xl">{item.icon}</span>
            <span className="font-medium flex-1">{item.label}</span>
            {/* WhatsApp connection indicator */}
            {item.page === 'whatsapp' && (
              <div className={`w-2.5 h-2.5 rounded-full ${
                waConnected ? 'bg-green-400 animate-pulse' : 'bg-red-400'
              }`} />
            )}
          </button>
        ))}
      </nav>

      {/* Quick Login Button */}
      {!waConnected && (
        <div className="px-4 mb-4">
          <button
            onClick={onLoginClick}
            className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-white text-green-800 rounded-lg font-medium hover:bg-green-50 transition-colors shadow-lg"
          >
            <span>📱</span>
            <span>Login WhatsApp</span>
          </button>
        </div>
      )}

      <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-green-700">
        <div className="bg-green-700/50 rounded-lg p-4">
          <p className="text-green-200 text-sm font-medium">💡 Tips</p>
          <p className="text-green-300 text-xs mt-1">
            Gunakan template untuk mengirim pesan WhatsApp secara cepat ke pelanggan Anda.
          </p>
        </div>
      </div>
    </aside>
  );
}
