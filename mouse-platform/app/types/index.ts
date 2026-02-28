export interface Lead {
  id: string;
  name: string;
  company: string;
  email: string;
  phone: string;
  status: 'new' | 'contacted' | 'qualified' | 'proposal' | 'negotiation' | 'closed';
  value: number;
  source: string;
  createdAt: string;
  lastContact: string;
  notes: string;
  activities: Activity[];
}

export interface Activity {
  id: string;
  type: 'call' | 'email' | 'meeting' | 'note' | 'demo';
  description: string;
  createdAt: string;
  createdBy: string;
}

export interface Reseller {
  id: string;
  name: string;
  email: string;
  company: string;
  commissionRate: number;
  totalSales: number;
  totalCommission: number;
  customers: Customer[];
  status: 'active' | 'pending' | 'inactive';
  signupDate: string;
  whiteLabelSettings?: WhiteLabelSettings;
}

export interface WhiteLabelSettings {
  logo: string;
  primaryColor: string;
  domain: string;
  companyName: string;
}

export interface Customer {
  id: string;
  name: string;
  email: string;
  company: string;
  plan: 'basic' | 'pro' | 'enterprise';
  status: 'active' | 'inactive' | 'suspended';
  createdAt: string;
  aiEmployees: AIEmployee[];
  resellerId?: string;
  vmStatus?: VMStatus;
  usage: UsageStats;
}

export interface AIEmployee {
  id: string;
  name: string;
  role: string;
  status: 'active' | 'paused' | 'offline';
  skills: string[];
  tasksCompleted: number;
  efficiency: number;
  avatar: string;
}

export interface VMStatus {
  id: string;
  status: 'running' | 'stopped' | 'paused';
  cpu: number;
  memory: number;
  uptime: string;
  screenshot?: string;
}

export interface UsageStats {
  requests: number;
  storage: number;
  compute: number;
  cost: number;
}

export interface Task {
  id: string;
  title: string;
  description: string;
  status: 'pending' | 'in-progress' | 'completed' | 'failed';
  priority: 'low' | 'medium' | 'high';
  assignedTo: string;
  createdAt: string;
  dueDate: string;
}

export interface Connection {
  id: string;
  type: 'gmail' | 'slack' | 'github' | 'notion' | 'calendar';
  name: string;
  status: 'connected' | 'disconnected' | 'error';
  lastSync: string;
}

export interface SecurityLog {
  id: string;
  event: string;
  user: string;
  ip: string;
  timestamp: string;
  severity: 'low' | 'medium' | 'high';
  details: string;
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'sales' | 'reseller' | 'customer';
  avatar?: string;
}
