'use client';

import { useState, useEffect, useCallback } from 'react';
import { X, CheckCircle2, AlertCircle, Zap, Activity } from 'lucide-react';

export interface ToastData {
  id: string;
  type: 'success' | 'error' | 'info' | 'working';
  title: string;
  message?: string;
  agentEmoji?: string;
  duration?: number;
}

interface ToastProps {
  toast: ToastData;
  onDismiss: (id: string) => void;
}

const typeConfig = {
  success: { 
    icon: CheckCircle2, 
    color: 'emerald',
    bgClass: 'bg-emerald-500/10 border-emerald-500/30',
    iconClass: 'text-emerald-400'
  },
  error: { 
    icon: AlertCircle, 
    color: 'red',
    bgClass: 'bg-red-500/10 border-red-500/30',
    iconClass: 'text-red-400'
  },
  info: { 
    icon: Activity, 
    color: 'blue',
    bgClass: 'bg-blue-500/10 border-blue-500/30',
    iconClass: 'text-blue-400'
  },
  working: { 
    icon: Zap, 
    color: 'orange',
    bgClass: 'bg-orange-500/10 border-orange-500/30',
    iconClass: 'text-orange-400'
  },
};

function Toast({ toast, onDismiss }: ToastProps) {
  const [isExiting, setIsExiting] = useState(false);
  const config = typeConfig[toast.type];
  const Icon = config.icon;

  useEffect(() => {
    const duration = toast.duration || 5000;
    const timer = setTimeout(() => {
      setIsExiting(true);
      setTimeout(() => onDismiss(toast.id), 300);
    }, duration);

    return () => clearTimeout(timer);
  }, [toast, onDismiss]);

  const handleDismiss = () => {
    setIsExiting(true);
    setTimeout(() => onDismiss(toast.id), 300);
  };

  return (
    <div 
      className={`
        flex items-start gap-3 p-4 rounded-xl border backdrop-blur-md
        shadow-lg shadow-black/20
        transition-all duration-300 ease-out
        ${config.bgClass}
        ${isExiting ? 'opacity-0 translate-x-4' : 'opacity-100 translate-x-0'}
        animate-slide-in-right
      `}
    >
      {toast.agentEmoji ? (
        <span className="text-xl">{toast.agentEmoji}</span>
      ) : (
        <Icon size={20} className={config.iconClass} />
      )}
      
      <div className="flex-1 min-w-0">
        <p className="font-medium text-white text-sm">{toast.title}</p>
        {toast.message && (
          <p className="text-xs text-zinc-400 mt-0.5">{toast.message}</p>
        )}
      </div>

      <button
        onClick={handleDismiss}
        className="text-zinc-500 hover:text-white transition-colors p-1 -m-1"
      >
        <X size={14} />
      </button>
    </div>
  );
}

// Toast container and hook
let toastId = 0;
let addToastFn: ((toast: Omit<ToastData, 'id'>) => void) | null = null;

export function ToastContainer() {
  const [toasts, setToasts] = useState<ToastData[]>([]);

  const addToast = useCallback((toast: Omit<ToastData, 'id'>) => {
    const id = `toast-${++toastId}`;
    setToasts(prev => [...prev.slice(-4), { ...toast, id }]); // Keep max 5 toasts
  }, []);

  const dismissToast = useCallback((id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  }, []);

  useEffect(() => {
    addToastFn = addToast;
    return () => { addToastFn = null; };
  }, [addToast]);

  if (toasts.length === 0) return null;

  return (
    <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2 max-w-sm w-full">
      {toasts.map(toast => (
        <Toast key={toast.id} toast={toast} onDismiss={dismissToast} />
      ))}
    </div>
  );
}

// Utility to add toasts from anywhere
export function showToast(toast: Omit<ToastData, 'id'>) {
  if (addToastFn) {
    addToastFn(toast);
  }
}

// Helper for agent status changes
export function showAgentStatusToast(agentName: string, emoji: string, status: string, task?: string) {
  const statusMessages: Record<string, { type: ToastData['type']; verb: string }> = {
    working: { type: 'working', verb: 'started working' },
    done: { type: 'success', verb: 'completed task' },
    blocked: { type: 'error', verb: 'is blocked' },
    idle: { type: 'info', verb: 'is now idle' },
  };

  const config = statusMessages[status] || { type: 'info', verb: `is now ${status}` };
  
  showToast({
    type: config.type,
    title: `${agentName} ${config.verb}`,
    message: task,
    agentEmoji: emoji,
    duration: status === 'blocked' ? 8000 : 4000,
  });
}
