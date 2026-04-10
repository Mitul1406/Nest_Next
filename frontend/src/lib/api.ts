const BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api';

function getToken(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('token');
}

async function request<T>(
  path: string,
  options: RequestInit = {}
): Promise<T> {
  const token = getToken();
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...options.headers,
  };

  const res = await fetch(`${BASE_URL}${path}`, { ...options, headers });
  const json = await res.json();

  if (!res.ok) {
    throw new Error(json.message || 'Something went wrong');
  }

  return json;
}

export const authApi = {
  register: (data: { name: string; email: string; password: string, dateOfBirth: string }) =>
    request<any>('/auth/register', { method: 'POST', body: JSON.stringify(data) }),

  login: (data: { email: string; password: string }) =>
    request<any>('/auth/login', { method: 'POST', body: JSON.stringify(data) }),

  me: () => request<any>('/auth/me'),
};

export const expensesApi = {
  create: (data: any) =>
    request<any>('/expenses', { method: 'POST', body: JSON.stringify(data) }),

  findAll: (params?: Record<string, any>) => {
    const query = params ? '?' + new URLSearchParams(params).toString() : '';
    return request<any>(`/expenses${query}`);
  },

  findOne: (id: string) => request<any>(`/expenses/${id}`),

  update: (id: string, data: any) =>
    request<any>(`/expenses/${id}`, { method: 'PATCH', body: JSON.stringify(data) }),

  remove: (id: string) =>
    request<any>(`/expenses/${id}`, { method: 'DELETE' }),
};

export const budgetsApi = {
  create: (data: any) =>
    request<any>('/budgets', { method: 'POST', body: JSON.stringify(data) }),

  
  findAll: (params?: Record<string, any>) => {
    const query = params ? '?' + new URLSearchParams(params).toString() : '';
    return request<any>(`/budgets${query}`);
  },

  findOne: (id: string) => request<any>(`/budgets/${id}`),

  update: (id: string, data: any) =>
    request<any>(`/budgets/${id}`, { method: 'PATCH', body: JSON.stringify(data) }),

  remove: (id: string) =>
    request<any>(`/budgets/${id}`, { method: 'DELETE' }),
};

export const reportsApi = {
  dashboard: () => request<any>('/reports/dashboard'),

  monthly: (month: number, year: number) =>
    request<any>(`/reports/monthly?month=${month}&year=${year}`),

  yearly: (year: number) => request<any>(`/reports/yearly?year=${year}`),

  categoryBreakdown: (startDate: string, endDate: string) =>
    request<any>(`/reports/category-breakdown?startDate=${startDate}&endDate=${endDate}`),

  recent: (limit = 5) => request<any>(`/reports/recent?limit=${limit}`),
};

export const EXPENSE_CATEGORIES = [
  'Food',
  'Transport',
  'Shopping',
  'Entertainment',
  'Health',
  'Housing',
  'Education',
  'Travel',
  'Utilities',
  'Other',
];

export const CATEGORY_COLORS: Record<string, string> = {
  'Food': '#FF6B6B',
  'Transport': '#4ECDC4',
  'Shopping': '#45B7D1',
  'Entertainment': '#96CEB4',
  'Health': '#FFEAA7',
  'Housing': '#DDA0DD',
  'Education': '#98D8C8',
  'Travel': '#F7DC6F',
  'Utilities': '#BB8FCE',
  'Other': '#85929E',
};
