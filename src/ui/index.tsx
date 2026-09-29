/**
 * MealPick UI Library
 * 
 * Единая библиотека компонентов для всего приложения.
 * Все компоненты следуют единому дизайн-системе.
 * 
 * Использование:
 * import { Button, Card, Input } from '../ui';
 */

import React, { forwardRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

// ============================================================================
// ТИПЫ И ИНТЕРФЕЙСЫ
// ============================================================================

type ButtonVariant = 'primary' | 'secondary' | 'danger' | 'ghost' | 'success';
type ButtonSize = 'sm' | 'md' | 'lg';

type CardVariant = 'default' | 'bordered' | 'elevated' | 'gradient';

type InputVariant = 'default' | 'filled' | 'bordered';
type InputSize = 'sm' | 'md' | 'lg';

type BadgeVariant = 'default' | 'success' | 'warning' | 'danger' | 'info';
type BadgeSize = 'sm' | 'md' | 'lg';

type AlertVariant = 'info' | 'success' | 'warning' | 'error';

type AvatarSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl';

// ============================================================================
// ЦВЕТОВАЯ ПАЛИТРА (Design Tokens)
// ============================================================================

export const colors = {
  // Основные цвета
  primary: {
    50: '#fff7ed',
    100: '#ffedd5',
    200: '#fed7aa',
    300: '#fdba74',
    400: '#fb923c',
    500: '#f97316', // Основной оранжевый
    600: '#ea580c',
    700: '#c2410c',
    800: '#9a3412',
    900: '#7c2d12',
  },
  secondary: {
    50: '#faf5ff',
    100: '#f3e8ff',
    200: '#e9d5ff',
    300: '#d8b4fe',
    400: '#c084fc',
    500: '#a855f7', // Фиолетовый
    600: '#9333ea',
    700: '#7e22ce',
    800: '#6b21a8',
    900: '#581c87',
  },
  success: {
    50: '#f0fdf4',
    100: '#dcfce7',
    200: '#bbf7d0',
    300: '#86efac',
    400: '#4ade80',
    500: '#22c55e', // Зелёный
    600: '#16a34a',
    700: '#15803d',
    800: '#166534',
    900: '#14532d',
  },
  danger: {
    50: '#fef2f2',
    100: '#fee2e2',
    200: '#fecaca',
    300: '#fca5a5',
    400: '#f87171',
    500: '#ef4444', // Красный
    600: '#dc2626',
    700: '#b91c1c',
    800: '#991b1b',
    900: '#7f1d1d',
  },
  warning: {
    50: '#fffbeb',
    100: '#fef3c7',
    200: '#fde68a',
    300: '#fcd34d',
    400: '#fbbf24',
    500: '#f59e0b', // Жёлтый
    600: '#d97706',
    700: '#b45309',
    800: '#92400e',
    900: '#78350f',
  },
  info: {
    50: '#eff6ff',
    100: '#dbeafe',
    200: '#bfdbfe',
    300: '#93c5fd',
    400: '#60a5fa',
    500: '#3b82f6', // Синий
    600: '#2563eb',
    700: '#1d4ed8',
    800: '#1e40af',
    900: '#1e3a8a',
  },
  gray: {
    50: '#f9fafb',
    100: '#f3f4f6',
    200: '#e5e7eb',
    300: '#d1d5db',
    400: '#9ca3af',
    500: '#6b7280',
    600: '#4b5563',
    700: '#374151',
    800: '#1f2937',
    900: '#111827',
  },
};

// ============================================================================
// ТИПОГРАФИКА
// ============================================================================

export const typography = {
  fontFamily: {
    sans: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
    mono: 'ui-monospace, SFMono-Regular, "SF Mono", Menlo, Consolas, monospace',
  },
  fontSize: {
    xs: '0.75rem',    // 12px
    sm: '0.875rem',   // 14px
    base: '1rem',     // 16px
    lg: '1.125rem',   // 18px
    xl: '1.25rem',    // 20px
    '2xl': '1.5rem',  // 24px
    '3xl': '1.875rem', // 30px
    '4xl': '2.25rem', // 36px
  },
  fontWeight: {
    normal: '400',
    medium: '500',
    semibold: '600',
    bold: '700',
  },
  lineHeight: {
    tight: '1.25',
    normal: '1.5',
    relaxed: '1.75',
  },
};

// ============================================================================
// ОТСТУПЫ И РАЗМЕРЫ
// ============================================================================

export const spacing = {
  0: '0',
  1: '0.25rem',   // 4px
  2: '0.5rem',    // 8px
  3: '0.75rem',   // 12px
  4: '1rem',      // 16px
  5: '1.25rem',   // 20px
  6: '1.5rem',    // 24px
  8: '2rem',      // 32px
  10: '2.5rem',   // 40px
  12: '3rem',     // 48px
  16: '4rem',     // 64px
};

export const borderRadius = {
  none: '0',
  sm: '0.375rem',   // 6px
  md: '0.5rem',     // 8px
  lg: '0.75rem',    // 12px
  xl: '1rem',       // 16px
  '2xl': '1.5rem',  // 24px
  full: '9999px',
};

export const shadows = {
  none: 'none',
  sm: '0 1px 2px 0 rgb(0 0 0 / 0.05)',
  md: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)',
  lg: '0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)',
  xl: '0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)',
  '2xl': '0 25px 50px -12px rgb(0 0 0 / 0.25)',
};

// ============================================================================
// АНИМАЦИИ
// ============================================================================

export const animations = {
  // Transition presets
  fast: { duration: 0.15 },
  normal: { duration: 0.3 },
  slow: { duration: 0.5 },
  
  // Spring presets
  spring: { type: 'spring', stiffness: 500, damping: 30 },
  springBouncy: { type: 'spring', stiffness: 300, damping: 20 },
  springSmooth: { type: 'spring', stiffness: 200, damping: 40 },
  
  // Common animations
  fadeIn: {
    initial: { opacity: 0 },
    animate: { opacity: 1 },
    exit: { opacity: 0 },
  },
  slideUp: {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: 20 },
  },
  slideDown: {
    initial: { opacity: 0, y: -20 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: -20 },
  },
  scaleIn: {
    initial: { opacity: 0, scale: 0.9 },
    animate: { opacity: 1, scale: 1 },
    exit: { opacity: 0, scale: 0.9 },
  },
};

// ============================================================================
// КОМПОНЕНТ: BUTTON
// ============================================================================

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  loading?: boolean;
  icon?: React.ReactNode;
  iconPosition?: 'left' | 'right';
  fullWidth?: boolean;
}

const buttonVariants: Record<ButtonVariant, string> = {
  primary: 'bg-gradient-to-r from-orange-500 to-amber-500 text-white shadow-lg shadow-orange-200 hover:shadow-xl',
  secondary: 'bg-gray-100 text-gray-700 hover:bg-gray-200',
  danger: 'bg-red-500 text-white hover:bg-red-600 shadow-lg shadow-red-200',
  ghost: 'bg-transparent text-gray-700 hover:bg-gray-100',
  success: 'bg-gradient-to-r from-green-500 to-emerald-500 text-white shadow-lg shadow-green-200 hover:shadow-xl',
};

const buttonSizes: Record<ButtonSize, string> = {
  sm: 'px-3 py-1.5 text-xs',
  md: 'px-4 py-2.5 text-sm',
  lg: 'px-6 py-3.5 text-base',
};

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(({
  variant = 'primary',
  size = 'md',
  loading = false,
  icon,
  iconPosition = 'left',
  fullWidth = false,
  children,
  className = '',
  disabled,
  ...props
}, ref) => {
  return (
    <motion.button
      ref={ref as any}
      whileHover={{ scale: disabled || loading ? 1 : 1.02 }}
      whileTap={{ scale: disabled || loading ? 1 : 0.98 }}
      className={`
        inline-flex items-center justify-center gap-2
        font-semibold rounded-xl
        transition-all duration-200
        disabled:opacity-50 disabled:cursor-not-allowed
        ${buttonVariants[variant]}
        ${buttonSizes[size]}
        ${fullWidth ? 'w-full' : ''}
        ${className}
      `}
      disabled={disabled || loading}
      {...props as any}
    >
      {loading ? (
        <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
        </svg>
      ) : icon && iconPosition === 'left' ? icon : null}
      {children}
      {icon && iconPosition === 'right' && !loading ? icon : null}
    </motion.button>
  );
});

Button.displayName = 'Button';

// ============================================================================
// КОМПОНЕНТ: CARD
// ============================================================================

interface CardProps {
  variant?: CardVariant;
  padding?: 'none' | 'sm' | 'md' | 'lg';
  className?: string;
  children?: React.ReactNode;
  onClick?: () => void;
}

const cardVariants: Record<CardVariant, string> = {
  default: 'bg-white border border-gray-100',
  bordered: 'bg-white border-2 border-gray-200',
  elevated: 'bg-white shadow-md border border-gray-100',
  gradient: 'bg-gradient-to-br from-orange-50 to-amber-50 border border-orange-100',
};

const cardPaddings: Record<string, string> = {
  none: '',
  sm: 'p-3',
  md: 'p-5',
  lg: 'p-6',
};

export const Card: React.FC<CardProps> = ({
  variant = 'default',
  padding = 'md',
  className = '',
  children,
  onClick,
}) => {
  return (
    <motion.div
      whileHover={onClick ? { scale: 1.01 } : undefined}
      onClick={onClick}
      className={`
        rounded-2xl
        ${cardVariants[variant]}
        ${cardPaddings[padding]}
        ${onClick ? 'cursor-pointer' : ''}
        ${className}
      `}
    >
      {children}
    </motion.div>
  );
};

// ============================================================================
// КОМПОНЕНТ: INPUT
// ============================================================================

interface InputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'size'> {
  variant?: InputVariant;
  size?: InputSize;
  label?: string;
  error?: string;
  icon?: React.ReactNode;
}

const inputVariants: Record<InputVariant, string> = {
  default: 'bg-white border border-gray-200 focus:border-orange-300 focus:ring-2 focus:ring-orange-100',
  filled: 'bg-gray-50 border border-transparent focus:bg-white focus:border-orange-300 focus:ring-2 focus:ring-orange-100',
  bordered: 'bg-white border-2 border-gray-200 focus:border-orange-400',
};

const inputSizes: Record<InputSize, string> = {
  sm: 'px-3 py-2 text-sm',
  md: 'px-4 py-3 text-sm',
  lg: 'px-4 py-3.5 text-base',
};

export const Input = forwardRef<HTMLInputElement, InputProps>(({
  variant = 'default',
  size = 'md',
  label,
  error,
  icon,
  className = '',
  ...props
}, ref) => {
  return (
    <div className="space-y-2">
      {label && (
        <label className="text-sm font-medium text-gray-700">
          {label}
        </label>
      )}
      <div className="relative">
        {icon && (
          <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
            {icon}
          </div>
        )}
        <input
          ref={ref}
          className={`
            w-full rounded-xl
            outline-none transition-all
            ${inputVariants[variant]}
            ${inputSizes[size]}
            ${icon ? 'pl-10' : ''}
            ${error ? 'border-red-300 focus:border-red-400 focus:ring-red-100' : ''}
            ${className}
          `}
          {...props}
        />
      </div>
      {error && (
        <p className="text-xs text-red-600">{error}</p>
      )}
    </div>
  );
});

Input.displayName = 'Input';

// ============================================================================
// КОМПОНЕНТ: TEXTAREA
// ============================================================================

interface TextAreaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
}

export const TextArea = forwardRef<HTMLTextAreaElement, TextAreaProps>(({
  label,
  error,
  className = '',
  ...props
}, ref) => {
  return (
    <div className="space-y-2">
      {label && (
        <label className="text-sm font-medium text-gray-700">
          {label}
        </label>
      )}
      <textarea
        ref={ref}
        className={`
          w-full px-4 py-3 rounded-xl
          border border-gray-200
          focus:border-orange-300 focus:ring-2 focus:ring-orange-100
          outline-none transition-all
          resize-none
          text-sm
          ${error ? 'border-red-300 focus:border-red-400 focus:ring-red-100' : ''}
          ${className}
        `}
        {...props}
      />
      {error && (
        <p className="text-xs text-red-600">{error}</p>
      )}
    </div>
  );
});

TextArea.displayName = 'TextArea';

// ============================================================================
// КОМПОНЕНТ: BADGE
// ============================================================================

interface BadgeProps {
  variant?: BadgeVariant;
  size?: BadgeSize;
  children: React.ReactNode;
  className?: string;
  animated?: boolean;
}

const badgeVariants: Record<BadgeVariant, string> = {
  default: 'bg-gray-100 text-gray-700',
  success: 'bg-green-100 text-green-700',
  warning: 'bg-yellow-100 text-yellow-700',
  danger: 'bg-red-100 text-red-700',
  info: 'bg-blue-100 text-blue-700',
};

const badgeSizes: Record<BadgeSize, string> = {
  sm: 'px-2 py-0.5 text-[10px]',
  md: 'px-2.5 py-1 text-xs',
  lg: 'px-3 py-1.5 text-sm',
};

export const Badge: React.FC<BadgeProps> = ({
  variant = 'default',
  size = 'md',
  children,
  className = '',
  animated = false,
}) => {
  const badge = (
    <span
      className={`
        inline-flex items-center gap-1
        font-medium rounded-full
        ${badgeVariants[variant]}
        ${badgeSizes[size]}
        ${className}
      `}
    >
      {children}
    </span>
  );

  if (animated) {
    return (
      <motion.span
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={animations.spring}
      >
        {badge}
      </motion.span>
    );
  }

  return badge;
};

// ============================================================================
// КОМПОНЕНТ: AVATAR
// ============================================================================

interface AvatarProps {
  emoji?: string;
  src?: string;
  size?: AvatarSize;
  className?: string;
  status?: 'online' | 'offline' | 'busy';
}

const avatarSizes: Record<AvatarSize, string> = {
  xs: 'w-8 h-8 text-sm',
  sm: 'w-10 h-10 text-lg',
  md: 'w-12 h-12 text-2xl',
  lg: 'w-16 h-16 text-3xl',
  xl: 'w-20 h-20 text-4xl',
};

export const Avatar: React.FC<AvatarProps> = ({
  emoji,
  src,
  size = 'md',
  className = '',
  status,
}) => {
  return (
    <div className={`relative inline-flex ${className}`}>
      <div
        className={`
          ${avatarSizes[size]}
          rounded-full
          bg-gray-100
          flex items-center justify-center
          overflow-hidden
          border-2 border-white
          shadow-sm
        `}
      >
        {src ? (
          <img src={src} alt="" className="w-full h-full object-cover" />
        ) : (
          <span>{emoji || '👤'}</span>
        )}
      </div>
      {status && (
        <span
          className={`
            absolute bottom-0 right-0
            w-3 h-3 rounded-full
            border-2 border-white
            ${status === 'online' ? 'bg-green-500' : ''}
            ${status === 'offline' ? 'bg-gray-400' : ''}
            ${status === 'busy' ? 'bg-red-500' : ''}
          `}
        />
      )}
    </div>
  );
};

// ============================================================================
// КОМПОНЕНТ: MODAL
// ============================================================================

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
  size?: 'sm' | 'md' | 'lg' | 'full';
  showCloseButton?: boolean;
}

const modalSizes: Record<string, string> = {
  sm: 'max-w-sm',
  md: 'max-w-md',
  lg: 'max-w-lg',
  full: 'max-w-full mx-4',
};

export const Modal: React.FC<ModalProps> = ({
  isOpen,
  onClose,
  title,
  children,
  size = 'md',
  showCloseButton = true,
}) => {
  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.9, y: 20 }}
            animate={{ scale: 1, y: 0 }}
            exit={{ scale: 0.9, y: 20 }}
            transition={animations.spring}
            onClick={(e) => e.stopPropagation()}
            className={`bg-white rounded-3xl shadow-2xl p-6 w-full ${modalSizes[size]}`}
          >
            {(title || showCloseButton) && (
              <div className="flex items-center justify-between mb-4">
                {title && <h3 className="text-xl font-bold text-gray-800">{title}</h3>}
                {showCloseButton && (
                  <button
                    onClick={onClose}
                    className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                  >
                    <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                )}
              </div>
            )}
            {children}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

// ============================================================================
// КОМПОНЕНТ: ALERT
// ============================================================================

interface AlertProps {
  variant?: AlertVariant;
  title?: string;
  children: React.ReactNode;
  icon?: React.ReactNode;
  className?: string;
}

const alertVariants: Record<AlertVariant, string> = {
  info: 'bg-blue-50 border-blue-200 text-blue-800',
  success: 'bg-green-50 border-green-200 text-green-800',
  warning: 'bg-yellow-50 border-yellow-200 text-yellow-800',
  error: 'bg-red-50 border-red-200 text-red-800',
};

export const Alert: React.FC<AlertProps> = ({
  variant = 'info',
  title,
  children,
  icon,
  className = '',
}) => {
  return (
    <div
      className={`
        rounded-xl border p-4
        ${alertVariants[variant]}
        ${className}
      `}
    >
      <div className="flex gap-3">
        {icon && <div className="flex-shrink-0">{icon}</div>}
        <div className="flex-1">
          {title && <p className="font-semibold mb-1">{title}</p>}
          <div className="text-sm">{children}</div>
        </div>
      </div>
    </div>
  );
};

// ============================================================================
// КОМПОНЕНТ: DIVIDER
// ============================================================================

interface DividerProps {
  orientation?: 'horizontal' | 'vertical';
  className?: string;
  label?: string;
}

export const Divider: React.FC<DividerProps> = ({
  orientation = 'horizontal',
  className = '',
  label,
}) => {
  if (orientation === 'vertical') {
    return <div className={`w-px bg-gray-200 self-stretch ${className}`} />;
  }

  if (label) {
    return (
      <div className="flex items-center gap-4 my-4">
        <div className="flex-1 h-px bg-gray-200" />
        <span className="text-xs text-gray-500 font-medium">{label}</span>
        <div className="flex-1 h-px bg-gray-200" />
      </div>
    );
  }

  return <div className={`h-px bg-gray-200 my-4 ${className}`} />;
};

// ============================================================================
// КОМПОНЕНТ: SPINNER
// ============================================================================

interface SpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

const spinnerSizes: Record<string, string> = {
  sm: 'w-4 h-4',
  md: 'w-8 h-8',
  lg: 'w-12 h-12',
};

export const Spinner: React.FC<SpinnerProps> = ({ size = 'md', className = '' }) => {
  return (
    <div className={`flex items-center justify-center ${className}`}>
      <div
        className={`
          animate-spin rounded-full
          border-2 border-gray-200
          border-t-orange-500
          ${spinnerSizes[size]}
        `}
      />
    </div>
  );
};

// ============================================================================
// КОМПОНЕНТ: EMPTY STATE
// ============================================================================

interface EmptyStateProps {
  icon?: React.ReactNode;
  title: string;
  description?: string;
  action?: React.ReactNode;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  icon,
  title,
  description,
  action,
}) => {
  return (
    <div className="text-center py-16">
      {icon && (
        <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
          {icon}
        </div>
      )}
      <h2 className="text-lg font-semibold text-gray-700 mb-1">{title}</h2>
      {description && <p className="text-sm text-gray-500 mb-6">{description}</p>}
      {action}
    </div>
  );
};

// ============================================================================
// КОМПОНЕНТ: SECTION HEADER
// ============================================================================

interface SectionHeaderProps {
  icon?: React.ReactNode;
  title: string;
  subtitle?: string;
  action?: React.ReactNode;
  className?: string;
}

export const SectionHeader: React.FC<SectionHeaderProps> = ({
  icon,
  title,
  subtitle,
  action,
  className = '',
}) => {
  return (
    <div className={`flex items-center justify-between ${className}`}>
      <div className="flex items-center gap-2">
        {icon && (
          <div className="w-8 h-8 bg-orange-100 rounded-lg flex items-center justify-center">
            {icon}
          </div>
        )}
        <div>
          <h3 className="text-sm font-semibold text-gray-700">{title}</h3>
          {subtitle && <p className="text-xs text-gray-500">{subtitle}</p>}
        </div>
      </div>
      {action}
    </div>
  );
};

// ============================================================================
// КОМПОНЕНТ: TOOLTIP
// ============================================================================

interface TooltipProps {
  content: string;
  children: React.ReactNode;
  position?: 'top' | 'bottom' | 'left' | 'right';
}

export const Tooltip: React.FC<TooltipProps> = ({
  content,
  children,
  position = 'top',
}) => {
  const [isVisible, setIsVisible] = React.useState(false);

  const positionClasses = {
    top: 'bottom-full left-1/2 -translate-x-1/2 mb-2',
    bottom: 'top-full left-1/2 -translate-x-1/2 mt-2',
    left: 'right-full top-1/2 -translate-y-1/2 mr-2',
    right: 'left-full top-1/2 -translate-y-1/2 ml-2',
  };

  return (
    <div
      className="relative inline-block"
      onMouseEnter={() => setIsVisible(true)}
      onMouseLeave={() => setIsVisible(false)}
    >
      {children}
      <AnimatePresence>
        {isVisible && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            transition={animations.fast}
            className={`
              absolute z-50 px-3 py-2
              bg-gray-900 text-white text-xs
              rounded-lg shadow-lg
              whitespace-nowrap
              ${positionClasses[position]}
            `}
          >
            {content}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

// ============================================================================
// КОМПОНЕНТ: PROGRESS
// ============================================================================

interface ProgressProps {
  value?: number; // 0-100
  variant?: 'default' | 'success' | 'warning' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  showLabel?: boolean;
  className?: string;
}

const progressVariants: Record<string, string> = {
  default: 'bg-orange-500',
  success: 'bg-green-500',
  warning: 'bg-yellow-500',
  danger: 'bg-red-500',
};

const progressSizes: Record<string, string> = {
  sm: 'h-1',
  md: 'h-2',
  lg: 'h-3',
};

export const Progress: React.FC<ProgressProps> = ({
  value = 0,
  variant = 'default',
  size = 'md',
  showLabel = false,
  className = '',
}) => {
  const clampedValue = Math.max(0, Math.min(100, value));

  return (
    <div className={`w-full ${className}`}>
      {showLabel && (
        <div className="flex justify-between mb-1">
          <span className="text-xs text-gray-600">Прогресс</span>
          <span className="text-xs font-medium text-gray-700">{clampedValue}%</span>
        </div>
      )}
      <div className={`w-full bg-gray-200 rounded-full overflow-hidden ${progressSizes[size]}`}>
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${clampedValue}%` }}
          transition={{ duration: 0.5, ease: 'easeOut' }}
          className={`h-full rounded-full ${progressVariants[variant]}`}
        />
      </div>
    </div>
  );
};

// ============================================================================
// КОМПОНЕНТ: TAG
// ============================================================================

interface TagProps {
  children?: React.ReactNode;
  variant?: 'default' | 'primary' | 'success' | 'warning' | 'danger';
  removable?: boolean;
  onRemove?: () => void;
  className?: string;
}

const tagVariants: Record<string, string> = {
  default: 'bg-gray-100 text-gray-700',
  primary: 'bg-orange-50 text-orange-700',
  success: 'bg-green-50 text-green-700',
  warning: 'bg-yellow-50 text-yellow-700',
  danger: 'bg-red-50 text-red-700',
};

export const Tag: React.FC<TagProps> = ({
  children,
  variant = 'default',
  removable = false,
  onRemove,
  className = '',
}) => {
  return (
    <span
      className={`
        inline-flex items-center gap-1
        px-3 py-1.5 rounded-full
        text-sm font-medium
        ${tagVariants[variant]}
        ${className}
      `}
    >
      {children}
      {removable && (
        <button
          onClick={onRemove}
          className="hover:opacity-70 transition-opacity"
        >
          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      )}
    </span>
  );
};

// ============================================================================
// КОМПОНЕНТ: CHECKBOX
// ============================================================================

interface CheckboxProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  label?: string;
  disabled?: boolean;
  className?: string;
}

export const Checkbox: React.FC<CheckboxProps> = ({
  checked,
  onChange,
  label,
  disabled = false,
  className = '',
}) => {
  return (
    <label className={`flex items-center gap-2 cursor-pointer ${disabled ? 'opacity-50' : ''} ${className}`}>
      <motion.div
        animate={{ scale: checked ? 1 : 0.9 }}
        transition={animations.fast}
        className={`
          w-5 h-5 rounded-md border-2
          flex items-center justify-center
          transition-all
          ${checked ? 'bg-orange-500 border-orange-500' : 'border-gray-300 hover:border-orange-300'}
        `}
        onClick={() => !disabled && onChange(!checked)}
      >
        {checked && (
          <motion.svg
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={animations.spring}
            className="w-3 h-3 text-white"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
          </motion.svg>
        )}
      </motion.div>
      {label && <span className="text-sm text-gray-700">{label}</span>}
    </label>
  );
};

// ============================================================================
// ЭКСПОРТ ВСЕХ КОМПОНЕНТОВ
// ============================================================================

export {
  // Типы
  type ButtonVariant,
  type ButtonSize,
  type CardVariant,
  type InputVariant,
  type InputSize,
  type BadgeVariant,
  type BadgeSize,
  type AlertVariant,
  type AvatarSize,
};
