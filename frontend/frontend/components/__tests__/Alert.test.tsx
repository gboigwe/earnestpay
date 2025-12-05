import { render, screen } from '@testing-library/react';
import { Alert, AlertDescription, AlertTitle } from '../ui/alert';
import { describe, it, expect } from 'vitest';

describe('Alert Component', () => {
  it('renders with title and description', () => {
    render(
      <Alert>
        <AlertTitle>Test Title</AlertTitle>
        <AlertDescription>Test Description</AlertDescription>
      </Alert>
    );

    expect(screen.getByText('Test Title')).toBeInTheDocument();
    expect(screen.getByText('Test Description')).toBeInTheDocument();
  });

  it('applies default variant class', () => {
    const { container } = render(
      <Alert>
        <AlertTitle>Test</AlertTitle>
      </Alert>
    );
    
    expect(container.firstChild).toHaveClass('bg-background');
  });

  it('applies destructive variant class when specified', () => {
    const { container } = render(
      <Alert variant="destructive">
        <AlertTitle>Test</AlertTitle>
      </Alert>
    );
    
    expect(container.firstChild).toHaveClass('bg-destructive');
  });
});
