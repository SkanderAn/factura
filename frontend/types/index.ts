// User and Authentication Types
export interface User {
  id: number;
  email: string;
  full_name: string;
  company_name?: string;
  is_active: boolean;
  created_at: string;
}

export interface AuthResponse {
  access_token: string;
  token_type: string;
}

export interface RegisterData {
  email: string;
  password: string;
  full_name: string;
  company_name?: string;
}

export interface LoginData {
  username: string;
  password: string;
}

// Client Types
export interface Client {
  id: number;
  name: string;
  email: string;
  phone?: string;
  address?: string;
  tax_id?: string; // Matricule fiscal
  created_at: string;
  updated_at?: string;
}

export interface ClientCreate {
  name: string;
  email: string;
  phone?: string;
  address?: string;
  tax_id?: string;
}

// Invoice Types
export type InvoiceStatus = 'draft' | 'sent' | 'paid' | 'unpaid';

export interface InvoiceItem {
  id?: number;
  description: string;
  quantity: number;
  unit_price: number;
  vat_rate: number;
  subtotal?: number;
  vat_amount?: number;
  total?: number;
}

export interface Invoice {
  id: number;
  invoice_number: string;
  client_id: number;
  client?: Client;
  issue_date: string;
  due_date: string;
  currency: string;
  status: InvoiceStatus;
  items: InvoiceItem[];
  subtotal: number;
  vat_total: number;
  total: number;
  notes?: string;
  created_at: string;
  updated_at?: string;
}

export interface InvoiceCreate {
  client_id: number;
  issue_date: string;
  due_date: string;
  currency: string;
  items: InvoiceItem[];
  notes?: string;
}

// Quote Types
export type QuoteStatus = 'draft' | 'accepted' | 'rejected' | 'converted';

export interface Quote {
  id: number;
  quote_number: string;
  client_id: number;
  client?: Client;
  issue_date: string;
  valid_until: string;
  currency: string;
  status: QuoteStatus;
  items: InvoiceItem[];
  subtotal: number;
  vat_total: number;
  total: number;
  notes?: string;
  created_at: string;
  updated_at?: string;
}

export interface QuoteCreate {
  client_id: number;
  issue_date: string;
  valid_until: string;
  currency: string;
  items: InvoiceItem[];
  notes?: string;
}

// Dashboard Types
export interface DashboardStats {
  monthly_revenue: number;
  unpaid_count: number;
  unpaid_total: number;
  client_count: number;
  evolution: Array<{ month: string; total: number }>;
}

export interface RevenueData {
  month: string;
  revenue: number;
}

// Company Settings
export interface CompanySettings {
  name: string;
  address: string;
  tax_id: string;
  phone?: string;
  email?: string;
  logo_url?: string;
}

// API Response Types
export interface ApiError {
  detail: string;
}

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  per_page: number;
}
