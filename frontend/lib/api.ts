import type {
  AuthResponse,
  RegisterData,
  Client,
  ClientCreate,
  Invoice,
  InvoiceCreate,
  Quote,
  QuoteCreate,
  DashboardStats,
  User,
} from '@/types';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

function getToken(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('access_token');
}

function authHeaders(): HeadersInit {
  const token = getToken();
  return {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
}

// Gestionnaire global des erreurs 401
async function handle401(response: Response) {
  if (response.status === 401) {
    logout();
    if (typeof window !== 'undefined') {
      window.location.href = '/login';
    }
    throw new Error('Session expirée, veuillez vous reconnecter');
  }
}

async function fetchAPI<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const response = await fetch(`${API_URL}${endpoint}`, {
    ...options,
    headers: { ...authHeaders(), ...options.headers },
  });
  
  // Gérer 401
  await handle401(response);
  
  if (!response.ok) {
    const error = await response.json().catch(() => ({ detail: 'An error occurred' }));
    throw new Error(error.detail || `HTTP error! status: ${response.status}`);
  }
  const text = await response.text();
  if (!text) return {} as T;
  return JSON.parse(text);
}

// ============ Authentication ============

export async function login(username: string, password: string): Promise<AuthResponse> {
  const formData = new URLSearchParams();
  formData.append('username', username);
  formData.append('password', password);

  const response = await fetch(`${API_URL}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: formData,
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ detail: 'Login failed' }));
    throw new Error(error.detail || 'Login failed');
  }

  const data: AuthResponse = await response.json();
  localStorage.setItem('access_token', data.access_token);
  return data;
}

export async function register(data: RegisterData): Promise<User> {
  const response = await fetch(`${API_URL}/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  if (!response.ok) {
    const error = await response.json().catch(() => ({ detail: 'Registration failed' }));
    throw new Error(error.detail || 'Registration failed');
  }
  return response.json();
}

export function logout(): void {
  localStorage.removeItem('access_token');
}

export function isAuthenticated(): boolean {
  return !!getToken();
}

// ============ Dashboard ============

export async function getDashboardStats(): Promise<DashboardStats> {
  return fetchAPI<DashboardStats>('/dashboard/stats');
}

// ============ Clients ============

export async function getClients(): Promise<Client[]> {
  return fetchAPI<Client[]>('/clients/');
}

export async function getClient(id: number): Promise<Client> {
  return fetchAPI<Client>(`/clients/${id}`);
}

export async function createClient(data: ClientCreate): Promise<Client> {
  return fetchAPI<Client>('/clients/', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

export async function updateClient(id: number, data: Partial<ClientCreate>): Promise<Client> {
  return fetchAPI<Client>(`/clients/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  });
}

export async function deleteClient(id: number): Promise<void> {
  return fetchAPI<void>(`/clients/${id}`, {
    method: 'DELETE',
  });
}

// ============ Invoices ============

export async function getInvoices(): Promise<Invoice[]> {
  return fetchAPI<Invoice[]>('/invoices/');
}

export async function getInvoice(id: number): Promise<Invoice> {
  const invoice = await fetchAPI<Invoice>(`/invoices/${id}`);
  // Si l'invoice n'a pas d'objet client, on le récupère séparément
  if (invoice && invoice.client_id && !invoice.client) {
    try {
      const client = await getClient(invoice.client_id);
      invoice.client = client;
    } catch (err) {
      console.warn('Could not fetch client for invoice', err);
    }
  }
  return invoice;
}

export async function createInvoice(data: InvoiceCreate): Promise<Invoice> {
  return fetchAPI<Invoice>('/invoices/', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

export async function updateInvoice(id: number, data: Partial<InvoiceCreate>): Promise<Invoice> {
  return fetchAPI<Invoice>(`/invoices/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  });
}

export async function updateInvoiceStatus(id: number, status: string): Promise<Invoice> {
  return fetchAPI<Invoice>(`/invoices/${id}/status`, {
    method: 'PATCH',
    body: JSON.stringify({ status }),
  });
}

export async function deleteInvoice(id: number): Promise<void> {
  return fetchAPI<void>(`/invoices/${id}`, {
    method: 'DELETE',
  });
}

export async function downloadInvoicePDF(id: number): Promise<Blob> {
  const token = getToken();
  const response = await fetch(`${API_URL}/invoices/${id}/pdf`, {
    headers: {
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
  });
  await handle401(response);
  if (!response.ok) {
    throw new Error('Failed to download PDF');
  }
  return response.blob();
}

// ============ Quotes ============

export async function getQuotes(): Promise<Quote[]> {
  return fetchAPI<Quote[]>('/quotes/');
}

export async function getQuote(id: number): Promise<Quote> {
  const quote = await fetchAPI<Quote>(`/quotes/${id}`);
  if (quote && quote.client_id && !quote.client) {
    try {
      const client = await getClient(quote.client_id);
      quote.client = client;
    } catch (err) {
      console.warn('Could not fetch client for quote', err);
    }
  }
  return quote;
}

export async function createQuote(data: QuoteCreate): Promise<Quote> {
  return fetchAPI<Quote>('/quotes/', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

export async function updateQuote(id: number, data: Partial<QuoteCreate>): Promise<Quote> {
  return fetchAPI<Quote>(`/quotes/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  });
}

export async function updateQuoteStatus(id: number, status: string): Promise<Quote> {
  return fetchAPI<Quote>(`/quotes/${id}/status`, {
    method: 'PATCH',
    body: JSON.stringify({ status }),
  });
}

export async function deleteQuote(id: number): Promise<void> {
  return fetchAPI<void>(`/quotes/${id}`, {
    method: 'DELETE',
  });
}

export async function convertQuoteToInvoice(id: number): Promise<Invoice> {
  return fetchAPI<Invoice>(`/quotes/${id}/convert`, {
    method: 'POST',
  });
}

export { fetchAPI };