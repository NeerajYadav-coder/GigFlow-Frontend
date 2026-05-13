import { createContext, useContext, useState, useCallback } from "react";

const ToastContext = createContext(null);

let toastId = 0;

export const ToastProvider = ({ children }) => {
    const [toasts, setToasts] = useState([]);

    const addToast = useCallback((message, type = "info", duration = 4000) => {
        const id = ++toastId;
        setToasts(prev => [...prev, { id, message, type }]);
        setTimeout(() => {
            setToasts(prev => prev.filter(t => t.id !== id));
        }, duration);
    }, []);

    const removeToast = useCallback((id) => {
        setToasts(prev => prev.filter(t => t.id !== id));
    }, []);

    const toast = {
        success: (msg) => addToast(msg, "success"),
        error: (msg) => addToast(msg, "error"),
        info: (msg) => addToast(msg, "info"),
        warning: (msg) => addToast(msg, "warning"),
    };

    return (
        <ToastContext.Provider value={toast}>
            {children}
            <div className="fixed top-4 right-4 z-[9999] flex flex-col gap-3 pointer-events-none">
                {toasts.map(t => (
                    <ToastItem key={t.id} toast={t} onRemove={removeToast} />
                ))}
            </div>
        </ToastContext.Provider>
    );
};

function ToastItem({ toast, onRemove }) {
    const icons = {
        success: (
            <svg className="w-5 h-5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
        ),
        error: (
            <svg className="w-5 h-5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
        ),
        warning: (
            <svg className="w-5 h-5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
            </svg>
        ),
        info: (
            <svg className="w-5 h-5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
        ),
    };

    const colors = {
        success: "border-emerald-500/30 text-emerald-400",
        error: "border-red-500/30 text-red-400",
        warning: "border-amber-500/30 text-amber-400",
        info: "border-violet-500/30 text-violet-400",
    };

    const bgColors = {
        success: "rgba(16, 185, 129, 0.1)",
        error: "rgba(239, 68, 68, 0.1)",
        warning: "rgba(245, 158, 11, 0.1)",
        info: "rgba(139, 92, 246, 0.1)",
    };

    return (
        <div
            className={`pointer-events-auto flex items-start gap-3 max-w-sm w-full rounded-xl border p-4 shadow-2xl animate-slideUp ${colors[toast.type]}`}
            style={{
                background: `rgba(22,22,31,0.95)`,
                borderLeft: `3px solid currentColor`,
                backdropFilter: "blur(12px)",
            }}
            onClick={() => onRemove(toast.id)}
            role="alert"
        >
            <span className={colors[toast.type]}>{icons[toast.type]}</span>
            <p className="text-sm font-medium text-[#f0f0fa] flex-1 leading-relaxed">{toast.message}</p>
            <button
                className="text-[#55556a] hover:text-[#f0f0fa] transition-colors"
                onClick={() => onRemove(toast.id)}
            >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
            </button>
        </div>
    );
}

export const useToast = () => {
    const ctx = useContext(ToastContext);
    if (!ctx) throw new Error("useToast must be used inside ToastProvider");
    return ctx;
};
