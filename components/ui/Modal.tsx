import React, { useEffect, useRef } from 'react';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export const Modal: React.FC<ModalProps> = ({
  isOpen,
  onClose,
  children,
  size = 'lg',
  className = '',
}) => {
  const modalRef = useRef<HTMLDivElement>(null);

  const getSizeClasses = () => {
    switch (size) {
      case 'sm':
        return 'w-full max-w-md';
      case 'md':
        return 'w-full max-w-lg';
      case 'lg':
        return 'w-full max-w-xl';
      default:
        return 'w-full max-w-lg';
    }
  };

  // Handle escape key
  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && isOpen) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      // Prevent body scroll
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, onClose]);

  // Handle backdrop click
  const handleBackdropClick = (event: React.MouseEvent) => {
    if (event.target === event.currentTarget) {
      onClose();
    }
  };

  // Focus management
  useEffect(() => {
    if (isOpen && modalRef.current) {
      const firstFocusable = modalRef.current.querySelector(
        'button, input, select, textarea, [tabindex]:not([tabindex="-1"])'
      ) as HTMLElement;
      
      if (firstFocusable) {
        firstFocusable.focus();
      }
    }
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <>
      <style jsx>{`
        .modal-overlay {
          background: rgba(0, 0, 0, 0.6);
          backdrop-filter: blur(8px);
        }
        .modal-fade-in {
          animation: fadeInModal 0.25s ease-out;
        }
        @keyframes fadeInModal {
          from {
            opacity: 0;
            transform: translateY(-20px) scale(0.95);
          }
          to {
            opacity: 1;
            transform: translateY(0) scale(1);
          }
        }

      `}</style>

      <div
        className="modal-overlay fixed inset-0 flex items-center justify-center p-4 z-50"
        onClick={handleBackdropClick}
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-title"
      >
        <div className={`bg-zinc-800 border border-zinc-600 rounded-xl shadow-2xl ${getSizeClasses()} modal-fade-in ${className}`} ref={modalRef}>
          {children}
        </div>
      </div>
    </>
  );
};

interface ModalHeaderProps {
  title: string;
  subtitle?: string;
  icon?: React.ReactNode;
  onClose?: () => void;
}

export const ModalHeader: React.FC<ModalHeaderProps> = ({
  title,
  subtitle,
  icon,
  onClose,
}) => {
  return (
    <div className="px-6 py-5 border-b border-zinc-600 flex items-center">
      {icon && (
        <div className="w-10 h-10 bg-purple-600 rounded-lg flex items-center justify-center mr-3">
          {icon}
        </div>
      )}
      
      <div className="flex-1">
        <h2 id="modal-title" className="text-xl font-semibold text-white">
          {title}
        </h2>
        {subtitle && (
          <p className="text-sm text-zinc-400">{subtitle}</p>
        )}
      </div>
      
      {onClose && (
        <button
          onClick={onClose}
          className="w-8 h-8 rounded-lg flex items-center justify-center text-zinc-400 hover:text-white hover:bg-zinc-600 transition-all"
          aria-label="Close modal"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      )}
    </div>
  );
};

interface ModalContentProps {
  children: React.ReactNode;
  className?: string;
}

export const ModalContent: React.FC<ModalContentProps> = ({
  children,
  className = '',
}) => {
  return (
    <div className={`px-6 py-5 space-y-5 ${className}`}>
      {children}
    </div>
  );
};

interface ModalFooterProps {
  children: React.ReactNode;
  className?: string;
  variant?: 'default' | 'danger';
}

export const ModalFooter: React.FC<ModalFooterProps> = ({
  children,
  className = '',
  variant = 'default',
}) => {
  const getVariantClasses = () => {
    switch (variant) {
      case 'danger':
        return 'bg-red-900/20';
      default:
        return 'bg-zinc-800';
    }
  };

  return (
    <div className={`px-6 py-4 ${getVariantClasses()} rounded-b-xl flex justify-between items-center ${className}`}>
      {children}
    </div>
  );
};

interface ModalFieldProps {
  label: string;
  required?: boolean;
  children: React.ReactNode;
  error?: string;
}

export const ModalField: React.FC<ModalFieldProps> = ({
  label,
  required = false,
  children,
  error,
}) => {
  return (
    <div>
      <label className="block text-sm font-medium text-white mb-2">
        {label}
        {required && <span className="text-red-400 ml-1">*</span>}
      </label>
      {children}
      {error && (
        <p className="text-sm text-red-400 mt-1">{error}</p>
      )}
    </div>
  );
};

// Enhanced form components for use within modals
interface ModalInputProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  required?: boolean;
  disabled?: boolean;
  type?: 'text' | 'email' | 'password';
}

export const ModalInput: React.FC<ModalInputProps> = ({
  value,
  onChange,
  placeholder,
  required = false,
  disabled = false,
  type = 'text',
}) => {
  return (
    <input
      type={type}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      required={required}
      disabled={disabled}
      className="w-full bg-zinc-600 border-2 border-zinc-500 rounded-lg px-4 py-3 text-white placeholder-zinc-400 focus:outline-none focus:border-purple-500 focus:bg-zinc-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed min-h-[44px] touch-manipulation"
    />
  );
};

interface ModalTextareaProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  required?: boolean;
  disabled?: boolean;
  rows?: number;
}

export const ModalTextarea: React.FC<ModalTextareaProps> = ({
  value,
  onChange,
  placeholder,
  required = false,
  disabled = false,
  rows = 4,
}) => {
  return (
    <textarea
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      required={required}
      disabled={disabled}
      rows={rows}
      className="w-full bg-zinc-600 border-2 border-zinc-500 rounded-lg px-4 py-3 text-white placeholder-zinc-400 focus:outline-none focus:border-purple-500 focus:bg-zinc-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed resize-none touch-manipulation"
    />
  );
};

interface ModalStatusProps {
  type: 'active' | 'inactive' | 'error';
  label: string;
}

export const ModalStatus: React.FC<ModalStatusProps> = ({ type, label }) => {
  const getStatusClasses = () => {
    switch (type) {
      case 'active':
        return 'text-green-400';
      case 'error':
        return 'text-red-400';
      default:
        return 'text-zinc-500';
    }
  };

  const getStatusDotClasses = () => {
    switch (type) {
      case 'active':
        return 'bg-green-500';
      case 'error':
        return 'bg-red-500';
      default:
        return 'bg-zinc-500';
    }
  };

  return (
    <div className="flex items-center space-x-2 text-sm">
      <div className={`w-2 h-2 ${getStatusDotClasses()} rounded-full`} />
      <span className={getStatusClasses()}>{label}</span>
    </div>
  );
};