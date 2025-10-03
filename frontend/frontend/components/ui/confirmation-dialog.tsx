import { AlertCircle, CheckCircle, DollarSign } from 'lucide-react';
import { Button } from './button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from './dialog';

interface ConfirmationDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description: string;
  confirmLabel?: string;
  cancelLabel?: string;
  onConfirm: () => void;
  onCancel?: () => void;
  variant?: 'default' | 'danger' | 'warning' | 'success';
  amount?: string;
  loading?: boolean;
}

export function ConfirmationDialog({
  open,
  onOpenChange,
  title,
  description,
  confirmLabel = 'Confirm',
  cancelLabel = 'Cancel',
  onConfirm,
  onCancel,
  variant = 'default',
  amount,
  loading = false
}: ConfirmationDialogProps) {
  const handleCancel = () => {
    onCancel?.();
    onOpenChange(false);
  };

  const handleConfirm = () => {
    onConfirm();
  };

  const getIcon = () => {
    switch (variant) {
      case 'danger':
        return <AlertCircle className="h-12 w-12 text-red-500" />;
      case 'warning':
        return <AlertCircle className="h-12 w-12 text-amber-500" />;
      case 'success':
        return <CheckCircle className="h-12 w-12 text-green-500" />;
      default:
        return <DollarSign className="h-12 w-12 text-blue-500" />;
    }
  };

  const getConfirmButtonClass = () => {
    switch (variant) {
      case 'danger':
        return 'bg-red-500 hover:bg-red-600 text-white';
      case 'warning':
        return 'bg-amber-500 hover:bg-amber-600 text-white';
      case 'success':
        return 'bg-green-500 hover:bg-green-600 text-white';
      default:
        return 'gradient-primary text-white';
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <div className="flex flex-col items-center text-center mb-4">
            <div className="rounded-full bg-gray-100 dark:bg-gray-800 p-4 mb-4">
              {getIcon()}
            </div>
            <DialogTitle className="text-xl">{title}</DialogTitle>
          </div>
          <DialogDescription className="text-center text-base">
            {description}
          </DialogDescription>
          {amount && (
            <div className="mt-4 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
              <div className="text-sm text-gray-500 dark:text-gray-400 mb-1">Amount</div>
              <div className="text-2xl font-bold text-gray-900 dark:text-white">{amount}</div>
            </div>
          )}
        </DialogHeader>
        <DialogFooter className="flex-col sm:flex-row gap-2 mt-6">
          <Button
            variant="outline"
            onClick={handleCancel}
            disabled={loading}
            className="w-full sm:w-auto"
          >
            {cancelLabel}
          </Button>
          <Button
            onClick={handleConfirm}
            disabled={loading}
            className={`w-full sm:w-auto ${getConfirmButtonClass()}`}
          >
            {loading ? 'Processing...' : confirmLabel}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
