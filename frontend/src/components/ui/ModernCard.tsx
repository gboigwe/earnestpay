import React from 'react';
import { motion } from 'framer-motion';

interface ModernCardProps {
  children: React.ReactNode;
  className?: string;
  hover?: boolean;
  gradient?: boolean;
  onClick?: () => void;
}

export const ModernCard: React.FC<ModernCardProps> = ({
  children,
  className = '',
  hover = true,
  gradient = false,
  onClick
}) => {
  const baseClasses = "modern-card";
  const hoverClasses = hover ? "hover-card" : "";
  const gradientClasses = gradient ? "border-gradient" : "";
  const clickableClasses = onClick ? "cursor-pointer" : "";

  return (
    <motion.div
      className={`${baseClasses} ${hoverClasses} ${gradientClasses} ${clickableClasses} ${className}`}
      onClick={onClick}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={hover ? { y: -2 } : undefined}
      transition={{ duration: 0.3, ease: "easeOut" }}
    >
      {children}
    </motion.div>
  );
};

interface StatCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: React.ReactNode;
  trend?: {
    value: number;
    isPositive: boolean;
  };
  gradient?: string;
}

export const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  subtitle,
  icon,
  trend,
  gradient = "from-blue-500 to-purple-600"
}) => {
  return (
    <ModernCard hover gradient>
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p className="text-sm font-medium text-gray-400 mb-1">{title}</p>
          <div className="flex items-baseline gap-2">
            <h3 className="text-2xl font-bold text-white">{value}</h3>
            {trend && (
              <span className={`text-xs font-medium ${
                trend.isPositive ? 'text-green-400' : 'text-red-400'
              }`}>
                {trend.isPositive ? '+' : ''}{trend.value}%
              </span>
            )}
          </div>
          {subtitle && (
            <p className="text-xs text-gray-500 mt-1">{subtitle}</p>
          )}
        </div>
        <div className={`p-3 rounded-xl bg-gradient-to-br ${gradient} bg-opacity-20`}>
          {icon}
        </div>
      </div>
    </ModernCard>
  );
};

export const GlassCard: React.FC<{ children: React.ReactNode; className?: string }> = ({
  children,
  className = ''
}) => {
  return (
    <div className={`glass backdrop-blur rounded-xl p-6 ${className}`}>
      {children}
    </div>
  );
};