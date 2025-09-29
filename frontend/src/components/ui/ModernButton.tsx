import React from 'react';
import { motion } from 'framer-motion';
import { Loader2 } from 'lucide-react';

interface ModernButtonProps {
  children: React.ReactNode;
  variant?: 'primary' | 'secondary' | 'ghost' | 'gradient';
  size?: 'sm' | 'md' | 'lg';
  loading?: boolean;
  disabled?: boolean;
  icon?: React.ReactNode;
  iconPosition?: 'left' | 'right';
  className?: string;
  onClick?: () => void;
  type?: 'button' | 'submit' | 'reset';
}

export const ModernButton: React.FC<ModernButtonProps> = ({
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
  const baseClasses = "inline-flex items-center justify-center font-medium transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-900 disabled:opacity-50 disabled:cursor-not-allowed";
  
  const variants = {
    primary: "btn-primary focus:ring-blue-500",
    secondary: "btn-secondary focus:ring-gray-500",
    ghost: "text-blue-400 hover:text-blue-300 hover:bg-blue-500/10 focus:ring-blue-500",
    gradient: "bg-transparent border border-blue-500/30 text-blue-400 hover:border-blue-400 hover:text-blue-300 hover:bg-blue-500/10 focus:ring-blue-500"
  };
  
  const sizes = {
    sm: "px-3 py-1.5 text-xs rounded-md gap-1",
    md: "px-4 py-2 text-sm rounded-lg gap-2",
    lg: "px-6 py-3 text-base rounded-xl gap-2"
  };

  const buttonClasses = `${baseClasses} ${variants[variant]} ${sizes[size]} ${className}`;

  return (
    <motion.button
      className={buttonClasses}
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
}> = ({ icon, onClick, className = '' }) => {
  return (
    <motion.button
      className={`fixed bottom-6 right-6 w-14 h-14 rounded-full bg-transparent border-2 border-blue-500/50 text-blue-400 hover:border-blue-400 hover:text-blue-300 hover:bg-blue-500/10 shadow-lg hover:shadow-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-gray-900 ${className}`}
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