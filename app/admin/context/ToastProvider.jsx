"use client";

import { createContext, useContext, useState, useCallback } from "react";
import ToastItem from "./ToastItem";

const ToastContext = createContext(null);

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  const showToast = useCallback(({ type = "success", message }) => {
    const id = crypto.randomUUID();

    setToasts((prev) => [...prev, { id, type, message }]);

    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4000);
  }, []);

  const removeToast = (id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}

      <div className="fixed bottom-6 right-6 z-[9999] pointer-events-none">
        {toasts.map((toast, index) => {
          const depth = toasts.length - index - 1;

          return (
            <div
              key={toast.id}
              className="
          pointer-events-auto absolute bottom-0 right-0
          transition-all duration-200 ease-out
          toast-enter
        "
              style={{
                transform: `translateY(-${depth * 10}px) scale(${1 - depth * 0.04})`,
                zIndex: 100 - depth,
                opacity: depth > 3 ? 0 : 1,
              }}
            >
              <ToastItem
                toast={toast}
                onClose={() => removeToast(toast.id)}
              />
            </div>
          );
        })}
      </div>


    </ToastContext.Provider>
  );
}

export const useToast = () => {
  const context = useContext(ToastContext);

  if (!context) {
    throw new Error("useToast must be used within a ToastProvider");
  }

  return context;
};
