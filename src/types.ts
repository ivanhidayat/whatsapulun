export interface Customer {
  id: string;
  name: string;
  phone: string;
  email: string;
  company: string;
  status: 'active' | 'inactive' | 'prospect';
  notes: string;
  createdAt: string;
  lastContact: string;
}

export interface MessageTemplate {
  id: string;
  name: string;
  content: string;
  category: 'greeting' | 'followup' | 'promotion' | 'reminder' | 'custom';
  createdAt: string;
}

export interface Schedule {
  id: string;
  customerId: string;
  templateId: string;
  customMessage: string;
  scheduledDate: string;
  scheduledTime: string;
  status: 'pending' | 'sent' | 'cancelled';
  createdAt: string;
}
