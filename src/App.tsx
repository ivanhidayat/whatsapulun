import { useState, useEffect } from 'react';
import { Customer, MessageTemplate, Schedule } from './types';
import {
  getCustomers,
  saveCustomers,
  getTemplates,
  saveTemplates,
  getSchedules,
  saveSchedules,
  generateId,
  getDefaultTemplates,
} from './utils/storage';
import Sidebar from './components/Sidebar';
import Dashboard from './components/Dashboard';
import CustomerList from './components/CustomerList';
import TemplateList from './components/TemplateList';
import ScheduleList from './components/ScheduleList';
import CustomerForm from './components/CustomerForm';
import TemplateForm from './components/TemplateForm';
import ScheduleForm from './components/ScheduleForm';

export type Page = 'dashboard' | 'customers' | 'templates' | 'schedules';

function App() {
  const [currentPage, setCurrentPage] = useState<Page>('dashboard');
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [templates, setTemplates] = useState<MessageTemplate[]>([]);
  const [schedules, setSchedules] = useState<Schedule[]>([]);
  const [showCustomerForm, setShowCustomerForm] = useState(false);
  const [showTemplateForm, setShowTemplateForm] = useState(false);
  const [showScheduleForm, setShowScheduleForm] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState<Customer | null>(null);
  const [editingTemplate, setEditingTemplate] = useState<MessageTemplate | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    const storedCustomers = getCustomers();
    const storedTemplates = getTemplates();
    const storedSchedules = getSchedules();

    setCustomers(storedCustomers);
    
    if (storedTemplates.length === 0) {
      const defaults = getDefaultTemplates();
      setTemplates(defaults);
      saveTemplates(defaults);
    } else {
      setTemplates(storedTemplates);
    }
    
    setSchedules(storedSchedules);
  }, []);

  // Check for due schedules
  useEffect(() => {
    const interval = setInterval(() => {
      const now = new Date();
      const dueSchedules = schedules.filter(s => {
        if (s.status !== 'pending') return false;
        const scheduleDate = new Date(`${s.scheduledDate}T${s.scheduledTime}`);
        return scheduleDate <= now;
      });

      if (dueSchedules.length > 0) {
        const names = dueSchedules.map(s => {
          const customer = customers.find(c => c.id === s.customerId);
          return customer?.name || 'Unknown';
        }).join(', ');
        
        if (Notification.permission === 'granted') {
          new Notification('📱 WhatsApp CRM Reminder', {
            body: `Jadwal WhatsApp untuk: ${names}`,
          });
        }
      }
    }, 60000);

    return () => clearInterval(interval);
  }, [schedules, customers]);

  const handleAddCustomer = (customer: Omit<Customer, 'id' | 'createdAt' | 'lastContact'>) => {
    const newCustomer: Customer = {
      ...customer,
      id: generateId(),
      createdAt: new Date().toISOString(),
      lastContact: new Date().toISOString(),
    };
    const updated = [...customers, newCustomer];
    setCustomers(updated);
    saveCustomers(updated);
    setShowCustomerForm(false);
  };

  const handleUpdateCustomer = (customer: Customer) => {
    const updated = customers.map((c: Customer) => c.id === customer.id ? customer : c);
    setCustomers(updated);
    saveCustomers(updated);
    setEditingCustomer(null);
    setShowCustomerForm(false);
  };

  const handleDeleteCustomer = (id: string) => {
    const updated = customers.filter(c => c.id !== id);
    setCustomers(updated);
    saveCustomers(updated);
  };

  const handleAddTemplate = (template: Omit<MessageTemplate, 'id' | 'createdAt'>) => {
    const newTemplate: MessageTemplate = {
      ...template,
      id: generateId(),
      createdAt: new Date().toISOString(),
    };
    const updated = [...templates, newTemplate];
    setTemplates(updated);
    saveTemplates(updated);
    setShowTemplateForm(false);
  };

  const handleUpdateTemplate = (template: MessageTemplate) => {
    const updated = templates.map((t: MessageTemplate) => t.id === template.id ? template : t);
    setTemplates(updated);
    saveTemplates(updated);
    setEditingTemplate(null);
    setShowTemplateForm(false);
  };

  const handleDeleteTemplate = (id: string) => {
    const updated = templates.filter(t => t.id !== id);
    setTemplates(updated);
    saveTemplates(updated);
  };

  const handleAddSchedule = (schedule: Omit<Schedule, 'id' | 'createdAt' | 'status'>) => {
    const newSchedule: Schedule = {
      ...schedule,
      id: generateId(),
      status: 'pending',
      createdAt: new Date().toISOString(),
    };
    const updated = [...schedules, newSchedule];
    setSchedules(updated);
    saveSchedules(updated);
    setShowScheduleForm(false);
  };

  const handleUpdateScheduleStatus = (id: string, status: Schedule['status']) => {
    const updated = schedules.map(s => s.id === id ? { ...s, status } : s);
    setSchedules(updated);
    saveSchedules(updated);
  };

  const handleDeleteSchedule = (id: string) => {
    const updated = schedules.filter(s => s.id !== id);
    setSchedules(updated);
    saveSchedules(updated);
  };

  const renderPage = () => {
    switch (currentPage) {
      case 'dashboard':
        return (
          <Dashboard
            customers={customers}
            templates={templates}
            schedules={schedules}
            onNavigate={setCurrentPage}
          />
        );
      case 'customers':
        return (
          <CustomerList
            customers={customers}
            onAdd={() => { setEditingCustomer(null); setShowCustomerForm(true); }}
            onEdit={(c) => { setEditingCustomer(c); setShowCustomerForm(true); }}
            onDelete={handleDeleteCustomer}
          />
        );
      case 'templates':
        return (
          <TemplateList
            templates={templates}
            onAdd={() => { setEditingTemplate(null); setShowTemplateForm(true); }}
            onEdit={(t) => { setEditingTemplate(t); setShowTemplateForm(true); }}
            onDelete={handleDeleteTemplate}
          />
        );
      case 'schedules':
        return (
          <ScheduleList
            schedules={schedules}
            customers={customers}
            templates={templates}
            onAdd={() => setShowScheduleForm(true)}
            onUpdateStatus={handleUpdateScheduleStatus}
            onDelete={handleDeleteSchedule}
          />
        );
      default:
        return null;
    }
  };

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Mobile overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-20 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <Sidebar
        currentPage={currentPage}
        onNavigate={(page) => { setCurrentPage(page); setSidebarOpen(false); }}
        isOpen={sidebarOpen}
      />

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top Bar */}
        <header className="bg-white shadow-sm border-b border-gray-200 px-4 py-3 flex items-center justify-between lg:px-6">
          <button
            onClick={() => setSidebarOpen(true)}
            className="lg:hidden p-2 rounded-lg hover:bg-gray-100"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
          <h1 className="text-lg font-semibold text-gray-800 capitalize">
            {currentPage === 'dashboard' ? '📊 Dashboard' : 
             currentPage === 'customers' ? '👥 Pelanggan' :
             currentPage === 'templates' ? '📝 Template Pesan' : '📅 Jadwal WhatsApp'}
          </h1>
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-500 hidden sm:block">WhatsApp CRM</span>
            <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
              <span className="text-white text-sm font-bold">W</span>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto p-4 lg:p-6">
          {renderPage()}
        </main>
      </div>

      {/* Modals */}
      {showCustomerForm && (
        <CustomerForm
          customer={editingCustomer}
          onSave={editingCustomer ? handleUpdateCustomer : handleAddCustomer as any}
          onClose={() => { setShowCustomerForm(false); setEditingCustomer(null); }}
        />
      )}
      {showTemplateForm && (
        <TemplateForm
          template={editingTemplate}
          onSave={editingTemplate ? handleUpdateTemplate : handleAddTemplate as any}
          onClose={() => { setShowTemplateForm(false); setEditingTemplate(null); }}
        />
      )}
      {showScheduleForm && (
        <ScheduleForm
          customers={customers}
          templates={templates}
          onSave={handleAddSchedule}
          onClose={() => setShowScheduleForm(false)}
        />
      )}
    </div>
  );
}

export default App;
