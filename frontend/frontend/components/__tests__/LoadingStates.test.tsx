/**
 * Tests for Loading State Components
 */

import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import {
  Spinner,
  SkeletonText,
  SkeletonCard,
  PageLoader,
  InlineLoader,
  TableLoader,
  LoadingOverlay,
  ProgressBar,
  PulsingDot,
} from '../LoadingStates';

describe('LoadingStates', () => {
  describe('Spinner', () => {
    it('renders with default size', () => {
      const { container } = render(<Spinner />);
      const spinner = container.querySelector('svg');
      expect(spinner).toBeInTheDocument();
      expect(spinner).toHaveClass('w-6', 'h-6'); // md size
    });

    it('renders with small size', () => {
      const { container } = render(<Spinner size="sm" />);
      const spinner = container.querySelector('svg');
      expect(spinner).toHaveClass('w-4', 'h-4');
    });

    it('renders with large size', () => {
      const { container } = render(<Spinner size="lg" />);
      const spinner = container.querySelector('svg');
      expect(spinner).toHaveClass('w-8', 'h-8');
    });

    it('applies custom className', () => {
      const { container } = render(<Spinner className="custom-class" />);
      const spinner = container.querySelector('svg');
      expect(spinner).toHaveClass('custom-class');
    });
  });

  describe('SkeletonText', () => {
    it('renders single line by default', () => {
      const { container } = render(<SkeletonText />);
      const lines = container.querySelectorAll('.h-4');
      expect(lines).toHaveLength(1);
    });

    it('renders multiple lines', () => {
      const { container } = render(<SkeletonText lines={3} />);
      const lines = container.querySelectorAll('.h-4');
      expect(lines).toHaveLength(3);
    });
  });

  describe('SkeletonCard', () => {
    it('renders card skeleton', () => {
      const { container } = render(<SkeletonCard />);
      expect(container.querySelector('.bg-white')).toBeInTheDocument();
      expect(container.querySelector('.animate-pulse')).toBeInTheDocument();
    });

    it('applies custom className', () => {
      const { container } = render(<SkeletonCard className="mb-4" />);
      expect(container.firstChild).toHaveClass('mb-4');
    });
  });

  describe('PageLoader', () => {
    it('renders with default message', () => {
      render(<PageLoader />);
      expect(screen.getByText('Loading...')).toBeInTheDocument();
    });

    it('renders with custom message', () => {
      render(<PageLoader message="Loading data..." />);
      expect(screen.getByText('Loading data...')).toBeInTheDocument();
    });
  });

  describe('InlineLoader', () => {
    it('renders without message', () => {
      const { container } = render(<InlineLoader />);
      expect(container.querySelector('svg')).toBeInTheDocument();
    });

    it('renders with message', () => {
      render(<InlineLoader message="Processing..." />);
      expect(screen.getByText('Processing...')).toBeInTheDocument();
    });
  });

  describe('TableLoader', () => {
    it('renders default rows and columns', () => {
      const { container } = render(<TableLoader />);
      const rows = container.querySelectorAll('.flex.gap-4');
      expect(rows).toHaveLength(5); // default rows
    });

    it('renders custom rows and columns', () => {
      const { container } = render(<TableLoader rows={3} columns={2} />);
      const rows = container.querySelectorAll('.flex.gap-4');
      expect(rows).toHaveLength(3);
    });
  });

  describe('LoadingOverlay', () => {
    it('shows overlay when loading', () => {
      render(
        <LoadingOverlay isLoading={true}>
          <div>Content</div>
        </LoadingOverlay>
      );
      expect(screen.getByText('Processing...')).toBeInTheDocument();
    });

    it('hides overlay when not loading', () => {
      render(
        <LoadingOverlay isLoading={false}>
          <div>Content</div>
        </LoadingOverlay>
      );
      expect(screen.queryByText('Processing...')).not.toBeInTheDocument();
    });

    it('renders children', () => {
      render(
        <LoadingOverlay isLoading={false}>
          <div>Content</div>
        </LoadingOverlay>
      );
      expect(screen.getByText('Content')).toBeInTheDocument();
    });
  });

  describe('ProgressBar', () => {
    it('renders with progress value', () => {
      const { container } = render(<ProgressBar progress={50} />);
      const progressBar = container.querySelector('.bg-green-600');
      expect(progressBar).toBeInTheDocument();
    });

    it('clamps progress to 100', () => {
      const { container } = render(<ProgressBar progress={150} />);
      const progressBar = container.querySelector('.bg-green-600');
      expect(progressBar).toHaveStyle({ width: '100%' });
    });
  });

  describe('PulsingDot', () => {
    it('renders pulsing indicator', () => {
      const { container } = render(<PulsingDot />);
      expect(container.querySelector('.animate-ping')).toBeInTheDocument();
    });
  });
});
