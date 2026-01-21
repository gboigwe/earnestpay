/**
 * Mobile-Optimized Components
 * Components specifically designed for mobile devices
 */

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Menu, X, ChevronDown, ChevronRight } from 'lucide-react';
import { useIsMobile, useIsTouchDevice } from '@/utils/responsive';

/**
 * Mobile Navigation Drawer
 */
export const MobileDrawer = ({
  isOpen,
  onClose,
  children,
}: {
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
}) => {
  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            className="fixed inset-0 bg-black/50 z-40"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />

          {/* Drawer */}
          <motion.div
            className="fixed inset-y-0 left-0 w-80 max-w-[85vw] bg-white shadow-xl z-50 overflow-y-auto"
            initial={{ x: '-100%' }}
            animate={{ x: 0 }}
            exit={{ x: '-100%' }}
            transition={{ type: 'spring', damping: 30, stiffness: 300 }}
          >
            <div className="sticky top-0 bg-white border-b border-green-200 p-4 flex items-center justify-between z-10">
              <h2 className="text-lg font-semibold text-green-700">Menu</h2>
              <button
                onClick={onClose}
                className="p-2 hover:bg-green-50 rounded-lg transition-colors"
                aria-label="Close menu"
              >
                <X className="w-5 h-5 text-green-600" />
              </button>
            </div>
            <div className="p-4">{children}</div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

/**
 * Mobile Menu Button
 */
export const MobileMenuButton = ({ onClick }: { onClick: () => void }) => {
  return (
    <button
      onClick={onClick}
      className="p-2 hover:bg-green-50 rounded-lg transition-colors lg:hidden"
      aria-label="Open menu"
    >
      <Menu className="w-6 h-6 text-green-600" />
    </button>
  );
};

/**
 * Mobile Bottom Sheet
 */
export const MobileBottomSheet = ({
  isOpen,
  onClose,
  children,
  title,
}: {
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
  title?: string;
}) => {
  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            className="fixed inset-0 bg-black/50 z-40"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />

          {/* Bottom Sheet */}
          <motion.div
            className="fixed inset-x-0 bottom-0 bg-white rounded-t-2xl shadow-xl z-50 max-h-[85vh] overflow-hidden"
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', damping: 30, stiffness: 300 }}
            drag="y"
            dragConstraints={{ top: 0 }}
            dragElastic={0.2}
            onDragEnd={(e, { offset, velocity }) => {
              if (offset.y > 100 || velocity.y > 500) {
                onClose();
              }
            }}
          >
            {/* Handle */}
            <div className="flex justify-center pt-3 pb-2">
              <div className="w-12 h-1 bg-gray-300 rounded-full" />
            </div>

            {/* Header */}
            {title && (
              <div className="px-4 py-3 border-b border-green-200">
                <h3 className="text-lg font-semibold text-green-700">{title}</h3>
              </div>
            )}

            {/* Content */}
            <div className="overflow-y-auto max-h-[calc(85vh-80px)] p-4">
              {children}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

/**
 * Mobile Accordion
 */
export const MobileAccordion = ({
  items,
}: {
  items: Array<{
    title: string;
    content: React.ReactNode;
    icon?: React.ReactNode;
  }>;
}) => {
  const [expandedIndex, setExpandedIndex] = useState<number | null>(null);

  return (
    <div className="space-y-2">
      {items.map((item, index) => {
        const isExpanded = expandedIndex === index;

        return (
          <div
            key={index}
            className="bg-white border border-green-200 rounded-lg overflow-hidden"
          >
            <button
              onClick={() => setExpandedIndex(isExpanded ? null : index)}
              className="w-full p-4 flex items-center justify-between text-left hover:bg-green-50 transition-colors"
            >
              <div className="flex items-center gap-3">
                {item.icon && <div className="text-green-600">{item.icon}</div>}
                <span className="font-medium text-green-700">{item.title}</span>
              </div>
              <motion.div
                animate={{ rotate: isExpanded ? 180 : 0 }}
                transition={{ duration: 0.2 }}
              >
                <ChevronDown className="w-5 h-5 text-green-600" />
              </motion.div>
            </button>

            <AnimatePresence>
              {isExpanded && (
                <motion.div
                  initial={{ height: 0 }}
                  animate={{ height: 'auto' }}
                  exit={{ height: 0 }}
                  transition={{ duration: 0.2 }}
                  className="overflow-hidden"
                >
                  <div className="p-4 pt-0 border-t border-green-100">
                    {item.content}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        );
      })}
    </div>
  );
};

/**
 * Mobile Card Stack
 */
export const MobileCardStack = ({ children }: { children: React.ReactNode }) => {
  return (
    <div className="space-y-3 px-4 md:px-0 md:grid md:grid-cols-2 lg:grid-cols-3 md:gap-4 md:space-y-0">
      {children}
    </div>
  );
};

/**
 * Mobile Touch-Friendly Button
 */
export const TouchButton = ({
  children,
  onClick,
  variant = 'primary',
  className = '',
}: {
  children: React.ReactNode;
  onClick?: () => void;
  variant?: 'primary' | 'secondary' | 'outline';
  className?: string;
}) => {
  const isTouchDevice = useIsTouchDevice();

  const variants = {
    primary: 'bg-green-600 hover:bg-green-700 text-white',
    secondary: 'bg-green-100 hover:bg-green-200 text-green-700',
    outline: 'border-2 border-green-600 hover:bg-green-50 text-green-700',
  };

  return (
    <motion.button
      onClick={onClick}
      className={`px-6 py-3 rounded-lg font-medium transition-colors ${variants[variant]} ${
        isTouchDevice ? 'min-h-[44px]' : ''
      } ${className}`}
      whileTap={{ scale: 0.98 }}
    >
      {children}
    </motion.button>
  );
};

/**
 * Mobile List Item
 */
export const MobileListItem = ({
  title,
  subtitle,
  icon,
  onClick,
  rightContent,
}: {
  title: string;
  subtitle?: string;
  icon?: React.ReactNode;
  onClick?: () => void;
  rightContent?: React.ReactNode;
}) => {
  return (
    <motion.div
      onClick={onClick}
      className={`p-4 bg-white border-b border-green-100 flex items-center gap-3 ${
        onClick ? 'cursor-pointer active:bg-green-50' : ''
      }`}
      whileTap={onClick ? { scale: 0.98 } : {}}
    >
      {icon && <div className="text-green-600 flex-shrink-0">{icon}</div>}

      <div className="flex-1 min-w-0">
        <h4 className="font-medium text-green-700 truncate">{title}</h4>
        {subtitle && (
          <p className="text-sm text-gray-600 truncate mt-0.5">{subtitle}</p>
        )}
      </div>

      {rightContent || (onClick && <ChevronRight className="w-5 h-5 text-gray-400 flex-shrink-0" />)}
    </motion.div>
  );
};

/**
 * Mobile Tab Bar
 */
export const MobileTabBar = ({
  tabs,
  activeTab,
  onChange,
}: {
  tabs: Array<{ id: string; label: string; icon?: React.ReactNode }>;
  activeTab: string;
  onChange: (id: string) => void;
}) => {
  return (
    <div className="fixed bottom-0 inset-x-0 bg-white border-t border-green-200 safe-area-bottom md:hidden z-30">
      <div className="flex">
        {tabs.map((tab) => {
          const isActive = activeTab === tab.id;

          return (
            <button
              key={tab.id}
              onClick={() => onChange(tab.id)}
              className={`flex-1 py-3 flex flex-col items-center gap-1 transition-colors ${
                isActive ? 'text-green-600' : 'text-gray-500'
              }`}
            >
              {tab.icon}
              <span className="text-xs font-medium">{tab.label}</span>
              {isActive && (
                <motion.div
                  layoutId="activeTab"
                  className="absolute bottom-0 left-0 right-0 h-0.5 bg-green-600"
                />
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
};

/**
 * Mobile Safe Area Wrapper
 */
export const SafeAreaView = ({
  children,
  className = '',
}: {
  children: React.ReactNode;
  className?: string;
}) => {
  return (
    <div className={`safe-area-top safe-area-bottom ${className}`}>
      {children}
    </div>
  );
};

/**
 * Mobile Floating Action Button
 */
export const FloatingActionButton = ({
  onClick,
  icon,
  label,
}: {
  onClick: () => void;
  icon: React.ReactNode;
  label?: string;
}) => {
  return (
    <motion.button
      onClick={onClick}
      className="fixed bottom-20 right-4 bg-green-600 text-white rounded-full shadow-lg p-4 flex items-center gap-2 z-30 md:bottom-4"
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
    >
      {icon}
      {label && <span className="font-medium pr-2">{label}</span>}
    </motion.button>
  );
};

/**
 * Mobile Swipeable Card
 */
export const SwipeableCard = ({
  children,
  onSwipeLeft,
  onSwipeRight,
}: {
  children: React.ReactNode;
  onSwipeLeft?: () => void;
  onSwipeRight?: () => void;
}) => {
  return (
    <motion.div
      drag="x"
      dragConstraints={{ left: 0, right: 0 }}
      dragElastic={0.2}
      onDragEnd={(e, { offset, velocity }) => {
        if (offset.x < -100 && onSwipeLeft) {
          onSwipeLeft();
        } else if (offset.x > 100 && onSwipeRight) {
          onSwipeRight();
        }
      }}
      className="bg-white border border-green-200 rounded-lg p-4 cursor-grab active:cursor-grabbing"
    >
      {children}
    </motion.div>
  );
};
