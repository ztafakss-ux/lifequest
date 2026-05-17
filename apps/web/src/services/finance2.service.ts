import api from '../lib/api';

export interface RecurringTransaction { id: string; type: string; amount: number; category: string; description: string; dayOfMonth: number; isActive: boolean; }
export interface Debt { id: string; title: string; type: 'owe' | 'owed'; originalAmount: number; currentAmount: number; interestRate?: number; personName?: string; dueDate?: string; isPaid: boolean; payments: DebtPayment[]; }
export interface DebtPayment { id: string; debtId: string; amount: number; date: string; notes?: string; }
export interface FinancialProjection { monthlyIncome: number; monthlyRecurringExpenses: number; avgVariableExpenses: number; netMonthly: number; projection: Array<{ month: string; balance: number; income: number; expenses: number }>; debtProjections: Array<{ id: string; title: string; remaining: number; avgMonthlyPayment: number; monthsToPayoff: number | null }>; }

export const fetchRecurring = () => api.get<RecurringTransaction[]>('/finances/recurring').then(r => r.data);
export const createRecurring = (data: Omit<RecurringTransaction, 'id' | 'isActive'>) => api.post('/finances/recurring', data).then(r => r.data);
export const updateRecurring = (id: string, data: Partial<RecurringTransaction>) => api.patch(`/finances/recurring/${id}`, data);
export const deleteRecurring = (id: string) => api.delete(`/finances/recurring/${id}`);

export const fetchDebts = () => api.get<Debt[]>('/finances/debts').then(r => r.data);
export const createDebt = (data: { title: string; type: string; originalAmount: number; interestRate?: number; personName?: string; dueDate?: string }) => api.post('/finances/debts', data).then(r => r.data as Debt);
export const updateDebt = (id: string, data: Partial<Debt>) => api.patch(`/finances/debts/${id}`, data);
export const addDebtPayment = (id: string, amount: number, date: string, notes?: string) => api.post(`/finances/debts/${id}/payment`, { amount, date, notes });
export const deleteDebt = (id: string) => api.delete(`/finances/debts/${id}`);

export const fetchProjection = (months = 3) => api.get<FinancialProjection>(`/finances/projection?months=${months}`).then(r => r.data);
