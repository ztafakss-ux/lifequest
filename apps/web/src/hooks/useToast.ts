import { create } from 'zustand';

export type ToastType = 'success' | 'error' | 'achievement' | 'info' | 'warning';

export interface Toast {
  id: string;
  type: ToastType;
  message: string;
  subtitle?: string;
  duration?: number;
}

interface ToastState {
  toasts: Toast[];
  show: (toast: Omit<Toast, 'id'>) => void;
  success: (message: string, subtitle?: string) => void;
  error: (message: string, subtitle?: string) => void;
  info: (message: string, subtitle?: string) => void;
  warning: (message: string, subtitle?: string) => void;
  remove: (id: string) => void;
}

export const useToastStore = create<ToastState>((set, get) => ({
  toasts: [],

  show: (toast) => {
    const id = Math.random().toString(36).slice(2);
    set(s => ({ toasts: [...s.toasts, { id, ...toast }] }));
    setTimeout(() => get().remove(id), toast.duration ?? 4000);
  },

  success: (message, subtitle) => get().show({ type: 'success', message, subtitle }),
  error:   (message, subtitle) => get().show({ type: 'error',   message, subtitle, duration: 5000 }),
  info:    (message, subtitle) => get().show({ type: 'info',    message, subtitle }),
  warning: (message, subtitle) => get().show({ type: 'warning', message, subtitle }),

  remove: (id) => set(s => ({ toasts: s.toasts.filter(t => t.id !== id) })),
}));

export function useToast() {
  return useToastStore();
}
