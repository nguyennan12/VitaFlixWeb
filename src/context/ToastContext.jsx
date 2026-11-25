import React, { createContext, useContext, useState, useCallback } from 'react';

const ToastContext = createContext();

const ICON_MAP = {
  success: 'fa-circle-check',
  warning: 'fa-triangle-exclamation',
  error: 'fa-circle-xmark',
  info: 'fa-circle-info'
};

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  const removeToast = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const showToast = useCallback(
    (message, type = 'info', duration = 3500) => {
      const id = `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
      setToasts((prev) => [...prev.slice(-3), { id, message, type }]);

      if (duration > 0) {
        setTimeout(() => {
          removeToast(id);
        }, duration);
      }
    },
    [removeToast]
  );

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}

      {toasts.length > 0 && (
        <div className="vf-toast-container" role="status" aria-live="polite">
          {toasts.map((t) => (
            <div key={t.id} className={`vf-toast vf-toast-${t.type}`}>
              <i className={`fa-solid ${ICON_MAP[t.type] || ICON_MAP.info} vf-toast-icon`} />
              <span className="vf-toast-msg">{t.message}</span>
              <button
                type="button"
                className="vf-toast-close"
                onClick={() => removeToast(t.id)}
                aria-label="Đóng thông báo"
              >
                <i className="fa-solid fa-xmark" />
              </button>
            </div>
          ))}
        </div>
      )}
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
}
