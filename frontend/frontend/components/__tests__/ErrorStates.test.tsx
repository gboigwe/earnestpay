/**
 * Tests for Error State Components
 */

import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import {
  ErrorMessage,
  ErrorPage,
  EmptyState,
  NetworkError,
  WalletError,
  TransactionError,
  ValidationError,
  TimeoutError,
  PermissionError,
  ErrorBoundaryFallback,
} from '../ErrorStates';
import { AlertCircle } from 'lucide-react';

describe('ErrorStates', () => {
  describe('ErrorMessage', () => {
    it('renders with title and message', () => {
      render(
        <ErrorMessage title="Error Title" message="Error message content" />
      );
      expect(screen.getByText('Error Title')).toBeInTheDocument();
      expect(screen.getByText('Error message content')).toBeInTheDocument();
    });

    it('renders with error severity by default', () => {
      const { container } = render(
        <ErrorMessage title="Error" message="Error message" />
      );
      expect(container.querySelector('.bg-red-50')).toBeInTheDocument();
      expect(container.querySelector('.border-red-200')).toBeInTheDocument();
    });

    it('renders with warning severity', () => {
      const { container } = render(
        <ErrorMessage
          title="Warning"
          message="Warning message"
          severity="warning"
        />
      );
      expect(container.querySelector('.bg-yellow-50')).toBeInTheDocument();
      expect(container.querySelector('.border-yellow-200')).toBeInTheDocument();
    });

    it('renders with info severity', () => {
      const { container } = render(
        <ErrorMessage title="Info" message="Info message" severity="info" />
      );
      expect(container.querySelector('.bg-blue-50')).toBeInTheDocument();
      expect(container.querySelector('.border-blue-200')).toBeInTheDocument();
    });

    it('calls onRetry when retry button clicked', async () => {
      const user = userEvent.setup();
      const onRetry = vi.fn();

      render(
        <ErrorMessage
          title="Error"
          message="Test error"
          onRetry={onRetry}
        />
      );

      const retryButton = screen.getByLabelText('Retry');
      await user.click(retryButton);

      expect(onRetry).toHaveBeenCalledTimes(1);
    });

    it('calls onDismiss when dismiss button clicked', async () => {
      const user = userEvent.setup();
      const onDismiss = vi.fn();

      render(
        <ErrorMessage
          title="Error"
          message="Test error"
          onDismiss={onDismiss}
        />
      );

      const dismissButton = screen.getByLabelText('Dismiss');
      await user.click(dismissButton);

      expect(onDismiss).toHaveBeenCalledTimes(1);
    });

    it('applies custom className', () => {
      const { container } = render(
        <ErrorMessage
          title="Error"
          message="Test"
          className="custom-class"
        />
      );
      expect(container.firstChild).toHaveClass('custom-class');
    });
  });

  describe('ErrorPage', () => {
    it('renders with default title and message', () => {
      render(<ErrorPage />);
      expect(screen.getByText('Something went wrong')).toBeInTheDocument();
      expect(
        screen.getByText('An unexpected error occurred. Please try again.')
      ).toBeInTheDocument();
    });

    it('renders with custom title and message', () => {
      render(
        <ErrorPage
          title="Custom Error"
          message="Custom error message"
        />
      );
      expect(screen.getByText('Custom Error')).toBeInTheDocument();
      expect(screen.getByText('Custom error message')).toBeInTheDocument();
    });

    it('renders retry button when onRetry provided', () => {
      const onRetry = vi.fn();
      render(<ErrorPage onRetry={onRetry} />);
      expect(screen.getByText('Try Again')).toBeInTheDocument();
    });

    it('calls onRetry when button clicked', async () => {
      const user = userEvent.setup();
      const onRetry = vi.fn();

      render(<ErrorPage onRetry={onRetry} />);

      const retryButton = screen.getByText('Try Again');
      await user.click(retryButton);

      expect(onRetry).toHaveBeenCalledTimes(1);
    });

    it('shows home button by default', () => {
      render(<ErrorPage />);
      expect(screen.getByText('Go Home')).toBeInTheDocument();
    });

    it('hides home button when showHomeButton is false', () => {
      render(<ErrorPage showHomeButton={false} />);
      expect(screen.queryByText('Go Home')).not.toBeInTheDocument();
    });
  });

  describe('EmptyState', () => {
    it('renders with title', () => {
      render(<EmptyState title="No Data" />);
      expect(screen.getByText('No Data')).toBeInTheDocument();
    });

    it('renders with message', () => {
      render(
        <EmptyState title="No Data" message="No items to display" />
      );
      expect(screen.getByText('No items to display')).toBeInTheDocument();
    });

    it('renders action button when provided', () => {
      const onAction = vi.fn();
      render(
        <EmptyState
          title="No Data"
          actionLabel="Add Item"
          onAction={onAction}
        />
      );
      expect(screen.getByText('Add Item')).toBeInTheDocument();
    });

    it('calls onAction when button clicked', async () => {
      const user = userEvent.setup();
      const onAction = vi.fn();

      render(
        <EmptyState
          title="No Data"
          actionLabel="Add Item"
          onAction={onAction}
        />
      );

      const actionButton = screen.getByText('Add Item');
      await user.click(actionButton);

      expect(onAction).toHaveBeenCalledTimes(1);
    });

    it('renders custom icon', () => {
      const { container } = render(
        <EmptyState title="No Data" icon={AlertCircle} />
      );
      expect(container.querySelector('svg')).toBeInTheDocument();
    });

    it('applies custom className', () => {
      const { container } = render(
        <EmptyState title="No Data" className="custom-class" />
      );
      expect(container.firstChild).toHaveClass('custom-class');
    });
  });

  describe('NetworkError', () => {
    it('renders network error message', () => {
      render(<NetworkError />);
      expect(screen.getByText('Network Connection Error')).toBeInTheDocument();
      expect(
        screen.getByText(
          'Unable to connect to the network. Please check your internet connection and try again.'
        )
      ).toBeInTheDocument();
    });

    it('calls onRetry when retry clicked', async () => {
      const user = userEvent.setup();
      const onRetry = vi.fn();

      render(<NetworkError onRetry={onRetry} />);

      const retryButton = screen.getByLabelText('Retry');
      await user.click(retryButton);

      expect(onRetry).toHaveBeenCalledTimes(1);
    });
  });

  describe('WalletError', () => {
    it('renders default wallet error message', () => {
      render(<WalletError />);
      expect(screen.getByText('Wallet Not Connected')).toBeInTheDocument();
      expect(
        screen.getByText('Please connect your wallet to continue')
      ).toBeInTheDocument();
    });

    it('renders custom message', () => {
      render(<WalletError message="Custom wallet message" />);
      expect(screen.getByText('Custom wallet message')).toBeInTheDocument();
    });

    it('renders connect button when onConnect provided', () => {
      const onConnect = vi.fn();
      render(<WalletError onConnect={onConnect} />);
      expect(screen.getByText('Connect Wallet')).toBeInTheDocument();
    });

    it('calls onConnect when button clicked', async () => {
      const user = userEvent.setup();
      const onConnect = vi.fn();

      render(<WalletError onConnect={onConnect} />);

      const connectButton = screen.getByText('Connect Wallet');
      await user.click(connectButton);

      expect(onConnect).toHaveBeenCalledTimes(1);
    });
  });

  describe('TransactionError', () => {
    it('renders transaction error', () => {
      render(<TransactionError error="Insufficient funds" />);
      expect(screen.getByText('Transaction Failed')).toBeInTheDocument();
      expect(screen.getByText('Insufficient funds')).toBeInTheDocument();
    });

    it('renders retry button when onRetry provided', () => {
      const onRetry = vi.fn();
      render(<TransactionError error="Error" onRetry={onRetry} />);
      expect(screen.getByText('Try Again')).toBeInTheDocument();
    });

    it('calls onRetry when button clicked', async () => {
      const user = userEvent.setup();
      const onRetry = vi.fn();

      render(<TransactionError error="Error" onRetry={onRetry} />);

      const retryButton = screen.getByText('Try Again');
      await user.click(retryButton);

      expect(onRetry).toHaveBeenCalledTimes(1);
    });

    it('renders view details link when onViewDetails provided', () => {
      const onViewDetails = vi.fn();
      render(<TransactionError error="Error" onViewDetails={onViewDetails} />);
      expect(screen.getByText('View Details')).toBeInTheDocument();
    });

    it('calls onViewDetails when link clicked', async () => {
      const user = userEvent.setup();
      const onViewDetails = vi.fn();

      render(<TransactionError error="Error" onViewDetails={onViewDetails} />);

      const detailsLink = screen.getByText('View Details');
      await user.click(detailsLink);

      expect(onViewDetails).toHaveBeenCalledTimes(1);
    });
  });

  describe('ValidationError', () => {
    it('renders nothing when no errors', () => {
      const { container } = render(<ValidationError errors={[]} />);
      expect(container.firstChild).toBeNull();
    });

    it('renders error list', () => {
      render(
        <ValidationError
          errors={['Error 1', 'Error 2', 'Error 3']}
        />
      );
      expect(
        screen.getByText('Please fix the following errors:')
      ).toBeInTheDocument();
      expect(screen.getByText('Error 1')).toBeInTheDocument();
      expect(screen.getByText('Error 2')).toBeInTheDocument();
      expect(screen.getByText('Error 3')).toBeInTheDocument();
    });

    it('renders correct number of errors', () => {
      const { container } = render(
        <ValidationError errors={['Error 1', 'Error 2']} />
      );
      const listItems = container.querySelectorAll('li');
      expect(listItems).toHaveLength(2);
    });
  });

  describe('TimeoutError', () => {
    it('renders timeout error message', () => {
      render(<TimeoutError />);
      expect(screen.getByText('Request Timeout')).toBeInTheDocument();
      expect(
        screen.getByText('The request took too long to complete. Please try again.')
      ).toBeInTheDocument();
    });

    it('calls onRetry when retry clicked', async () => {
      const user = userEvent.setup();
      const onRetry = vi.fn();

      render(<TimeoutError onRetry={onRetry} />);

      const retryButton = screen.getByLabelText('Retry');
      await user.click(retryButton);

      expect(onRetry).toHaveBeenCalledTimes(1);
    });
  });

  describe('PermissionError', () => {
    it('renders default permission error message', () => {
      render(<PermissionError />);
      expect(screen.getByText('Permission Denied')).toBeInTheDocument();
      expect(
        screen.getByText('You do not have permission to perform this action')
      ).toBeInTheDocument();
    });

    it('renders custom message', () => {
      render(<PermissionError message="Custom permission message" />);
      expect(screen.getByText('Custom permission message')).toBeInTheDocument();
    });
  });

  describe('ErrorBoundaryFallback', () => {
    it('renders error boundary UI', () => {
      const error = new Error('Test error message');
      const resetError = vi.fn();

      render(<ErrorBoundaryFallback error={error} resetError={resetError} />);

      expect(screen.getByText('Application Error')).toBeInTheDocument();
      expect(
        screen.getByText(
          'An unexpected error occurred. We apologize for the inconvenience.'
        )
      ).toBeInTheDocument();
    });

    it('displays error message in details', () => {
      const error = new Error('Detailed error message');
      const resetError = vi.fn();

      render(<ErrorBoundaryFallback error={error} resetError={resetError} />);

      expect(screen.getByText('Detailed error message')).toBeInTheDocument();
    });

    it('calls resetError when Try Again clicked', async () => {
      const user = userEvent.setup();
      const error = new Error('Test error');
      const resetError = vi.fn();

      render(<ErrorBoundaryFallback error={error} resetError={resetError} />);

      const tryAgainButton = screen.getByText('Try Again');
      await user.click(tryAgainButton);

      expect(resetError).toHaveBeenCalledTimes(1);
    });

    it('renders Go Home button', () => {
      const error = new Error('Test error');
      const resetError = vi.fn();

      render(<ErrorBoundaryFallback error={error} resetError={resetError} />);

      expect(screen.getByText('Go Home')).toBeInTheDocument();
    });
  });
});
