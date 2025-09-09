import React from 'react';

interface CardProps {
  children: React.ReactNode;
  className?: string;
  hover?: boolean;
  selected?: boolean;
  loading?: boolean;
  onClick?: () => void;
}

export const Card: React.FC<CardProps> = ({
  children,
  className = '',
  hover = true,
  selected = false,
  loading = false,
  onClick,
}) => {
  const baseClasses = 'bg-zinc-700 rounded-lg p-4 sm:p-6 transition-all duration-200 relative';
  const hoverClasses = hover ? 'card-hover cursor-pointer' : '';
  const selectedClasses = selected 
    ? 'border border-purple-500 shadow-[0_0_0_2px_rgba(117,89,255,0.2)]' 
    : 'border border-zinc-600';
  const loadingClasses = loading ? 'opacity-50' : '';
  
  return (
    <>
      <style jsx>{`
        .card-hover:hover {
          transform: translateY(-4px);
          box-shadow: 0 20px 40px rgba(0, 0, 0, 0.3);
        }
        .loading-shimmer {
          background: linear-gradient(90deg, #3f3f46 25%, #52525b 50%, #3f3f46 75%);
          background-size: 200% 100%;
          animation: shimmer 2s infinite ease-in-out;
        }
        @keyframes shimmer {
          0% { background-position: -200% 0; }
          100% { background-position: 200% 0; }
        }
        .skeleton-pulse {
          animation: skeleton-pulse 1.5s ease-in-out infinite;
        }
        @keyframes skeleton-pulse {
          0%, 100% { opacity: 0.6; }
          50% { opacity: 0.8; }
        }
      `}</style>
      
      <div
        className={`${baseClasses} ${hoverClasses} ${selectedClasses} ${loadingClasses} ${className}`.trim()}
        onClick={onClick}
      >
        {children}
      </div>
    </>
  );
};

interface CardHeaderProps {
  title: string;
  description?: string;
  status?: {
    type: 'active' | 'selected' | 'inactive';
    label: string;
  };
}

export const CardHeader: React.FC<CardHeaderProps> = ({
  title,
  description,
  status,
}) => {
  const getStatusClasses = (type: string) => {
    switch (type) {
      case 'active':
        return 'text-green-300';
      case 'selected':
        return 'text-purple-300';
      case 'inactive':
        return 'text-zinc-400';
      default:
        return 'text-zinc-300';
    }
  };

  const getStatusDotClasses = (type: string) => {
    switch (type) {
      case 'active':
        return 'bg-green-400';
      case 'selected':
        return 'bg-purple-400';
      case 'inactive':
        return 'bg-zinc-500';
      default:
        return 'bg-zinc-400';
    }
  };

  return (
    <div className="mb-3 sm:mb-4">
      {status && (
        <div className="absolute top-3 sm:top-4 right-3 sm:right-4 flex items-center space-x-2">
          <div className={`w-2 h-2 ${getStatusDotClasses(status.type)} rounded-full`} />
          <span className={`text-xs font-medium ${getStatusClasses(status.type)}`}>
            {status.label}
          </span>
        </div>
      )}
      
      <h3 className="text-base sm:text-lg font-semibold text-white mb-1 pr-16">{title}</h3>
      {description && (
        <p className="text-sm text-zinc-200">{description}</p>
      )}
    </div>
  );
};

interface CardContentProps {
  children: React.ReactNode;
}

export const CardContent: React.FC<CardContentProps> = ({ children }) => {
  return (
    <div className="mb-3 sm:mb-4 space-y-2">
      {children}
    </div>
  );
};

interface CardContentItemProps {
  icon: React.ReactNode;
  text: string;
}

export const CardContentItem: React.FC<CardContentItemProps> = ({ icon, text }) => {
  return (
    <div className="flex items-center text-sm text-zinc-100">
      <div className="w-4 h-4 mr-2 text-zinc-300">
        {icon}
      </div>
      <span>{text}</span>
    </div>
  );
};

interface CardActionsProps {
  children: React.ReactNode;
  tags?: string[];
}

export const CardActions: React.FC<CardActionsProps> = ({ children, tags }) => {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
      <div className="flex flex-wrap gap-2">
        {tags?.map((tag, index) => (
          <span
            key={index}
            className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-purple-900/30 text-purple-300 border border-purple-700/30"
          >
            {tag}
          </span>
        ))}
      </div>
      
      <div className="flex items-center space-x-2 self-end sm:self-auto">
        {children}
      </div>
    </div>
  );
};

interface CardActionButtonProps {
  onClick: () => void;
  variant?: 'edit' | 'delete' | 'default';
  children: React.ReactNode;
  disabled?: boolean;
}

export const CardActionButton: React.FC<CardActionButtonProps> = ({
  onClick,
  variant = 'default',
  children,
  disabled = false,
}) => {
  const getVariantClasses = () => {
    switch (variant) {
      case 'edit':
        return 'bg-purple-600 hover:bg-purple-700 text-white';
      case 'delete':
        return 'bg-zinc-600 hover:bg-red-600 text-zinc-400 hover:text-white';
      default:
        return 'bg-zinc-600 hover:bg-purple-600 text-zinc-400 hover:text-white';
    }
  };

  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`w-10 h-10 sm:w-8 sm:h-8 rounded-lg flex items-center justify-center transition-colors text-sm ${getVariantClasses()} ${
        disabled ? 'opacity-50 cursor-not-allowed' : ''
      } touch-manipulation min-h-[44px] sm:min-h-[32px]`}
    >
      {children}
    </button>
  );
};

interface CardSkeletonProps {
  showTags?: boolean;
  showActions?: boolean;
}

export const CardSkeleton: React.FC<CardSkeletonProps> = ({
  showTags = true,
  showActions = true,
}) => {
  return (
    <Card loading hover={false}>
      <style jsx>{`
        .loading-shimmer {
          background: linear-gradient(90deg, #3f3f46 25%, #52525b 50%, #3f3f46 75%);
          background-size: 200% 100%;
          animation: shimmer 2s infinite ease-in-out;
        }
        @keyframes shimmer {
          0% { background-position: -200% 0; }
          100% { background-position: 200% 0; }
        }
        .skeleton-pulse {
          animation: skeleton-pulse 1.5s ease-in-out infinite;
        }
        @keyframes skeleton-pulse {
          0%, 100% { opacity: 0.6; }
          50% { opacity: 0.8; }
        }
      `}</style>
      
      {/* Header */}
      <div className="mb-4">
        <div className="h-5 bg-zinc-600 rounded loading-shimmer mb-2 w-3/4" />
        <div className="h-4 bg-zinc-600 rounded loading-shimmer w-1/2" />
      </div>
      
      {/* Content */}
      <div className="mb-4 space-y-3">
        <div className="h-4 bg-zinc-600 rounded loading-shimmer w-full" />
        <div className="h-4 bg-zinc-600 rounded loading-shimmer w-2/3" />
      </div>
      
      {/* Actions */}
      <div className="flex items-center justify-between">
        {showTags && (
          <div className="flex space-x-2">
            <div className="h-6 bg-zinc-600 rounded-full loading-shimmer w-16" />
          </div>
        )}
        
        {showActions && (
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-zinc-600 rounded-lg loading-shimmer" />
            <div className="w-8 h-8 bg-zinc-600 rounded-lg loading-shimmer" />
          </div>
        )}
      </div>
    </Card>
  );
};