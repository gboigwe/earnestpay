import React from 'react';
import { motion } from 'framer-motion';
import { Loader2 } from 'lucide-react';
import { Button } from './button';
import { cn } from '@/lib/utils';

interface GradientButtonProps {
  children: React.ReactNode;
  variant?: 'primary' | 'secondary' | 'success' | 'warning' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  loading?: boolean;
  disabled?: boolean;
  icon?: React.ReactNode;
  iconPosition?: 'left' | 'right';
  className?: string;
  onClick?: () => void;
  type?: 'button' | 'submit' | 'reset';
}

export const GradientButton: React.FC<GradientButtonProps> = ({
  children,
  variant = 'primary',
  size = 'md',
  loading = false,
  disabled = false,
  icon,
  iconPosition = 'left',
  className = '',
  onClick,
  type = 'button'
}) => {
  const gradients = {
    primary: 'from-blue-500 to-purple-600',
    secondary: 'from-cyan-500 to-blue-600',
    success: 'from-green-500 to-emerald-600',
    warning: 'from-yellow-500 to-orange-600',
    danger: 'from-red-500 to-rose-600'
  };

  const sizes = {
    sm: 'px-3 py-1.5 text-xs gap-1',
    md: 'px-4 py-2 text-sm gap-2',
    lg: 'px-6 py-3 text-base gap-2'
  };

  return (
    <motion.button
      className={cn(
        'relative inline-flex items-center justify-center font-medium text-white rounded-lg',
        'bg-gradient-to-r shadow-lg hover:shadow-xl transition-all duration-300',
        'focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-900',
        'disabled:opacity-50 disabled:cursor-not-allowed',
        `bg-gradient-to-r ${gradients[variant]}`,
        `focus:ring-${variant === 'primary' ? 'blue' : variant === 'secondary' ? 'cyan' : variant}-500`,
        sizes[size],
        className
      )}
      onClick={onClick}
      disabled={disabled || loading}
      type={type}
      whileHover={{ scale: disabled ? 1 : 1.02 }}
      whileTap={{ scale: disabled ? 1 : 0.98 }}
      transition={{ duration: 0.1 }}
    >
      <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/10 to-white/0 opacity-0 hover:opacity-100 transition-opacity duration-300 rounded-lg" />
      <span className="relative flex items-center gap-2">
        {loading && <Loader2 className="animate-spin" size={16} />}
        {!loading && icon && iconPosition === 'left' && icon}
        {children}
        {!loading && icon && iconPosition === 'right' && icon}
      </span>
    </motion.button>
  );
};

export const GlassButton: React.FC<GradientButtonProps> = ({
  children,
  size = 'md',
  loading = false,
  disabled = false,
  icon,
  iconPosition = 'left',
  className = '',
  onClick,
  type = 'button'
}) => {
  const sizes = {
    sm: 'px-3 py-1.5 text-xs gap-1',
    md: 'px-4 py-2 text-sm gap-2',
    lg: 'px-6 py-3 text-base gap-2'
  };

  return (
    <motion.button
      className={cn(
        'inline-flex items-center justify-center font-medium text-white rounded-lg',
        'bg-white/10 backdrop-blur-md border border-white/20',
        'hover:bg-white/20 hover:border-white/30 transition-all duration-300',
        'focus:outline-none focus:ring-2 focus:ring-white/50',
        'disabled:opacity-50 disabled:cursor-not-allowed',
        sizes[size],
        className
      )}
      onClick={onClick}
      disabled={disabled || loading}
      type={type}
      whileHover={{ scale: disabled ? 1 : 1.02 }}
      whileTap={{ scale: disabled ? 1 : 0.98 }}
      transition={{ duration: 0.1 }}
    >
      {loading && <Loader2 className="animate-spin" size={16} />}
      {!loading && icon && iconPosition === 'left' && icon}
      {children}
      {!loading && icon && iconPosition === 'right' && icon}
    </motion.button>
  );
};

export const FloatingActionButton: React.FC<{
  icon: React.ReactNode;
  onClick: () => void;
  className?: string;
  variant?: 'primary' | 'secondary';
}> = ({ icon, onClick, className = '', variant = 'primary' }) => {
  const variants = {
    primary: 'bg-gradient-to-r from-blue-500 to-purple-600',
    secondary: 'bg-white/10 backdrop-blur-md border border-white/20'
  };

  return (
    <motion.button
      className={cn(
        'fixed bottom-6 right-6 w-14 h-14 rounded-full text-white',
        'shadow-lg hover:shadow-xl focus:outline-none focus:ring-2 focus:ring-offset-2',
        'focus:ring-blue-500 focus:ring-offset-gray-900',
        variants[variant],
        className
      )}
      onClick={onClick}
      whileHover={{ scale: 1.1 }}
      whileTap={{ scale: 0.9 }}
      initial={{ scale: 0 }}
      animate={{ scale: 1 }}
      transition={{ type: "spring", stiffness: 200, damping: 15 }}
    >
      {icon}
    </motion.button>
  );
};