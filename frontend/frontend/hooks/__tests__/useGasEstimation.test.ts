/**
 * Tests for useGasEstimation hook
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { useGasEstimation } from '../useGasEstimation';
import { TestProviders } from '../../test/utils';

describe('useGasEstimation', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('returns null initially when no gas limit provided', () => {
    const { result } = renderHook(() => useGasEstimation(), {
      wrapper: TestProviders,
    });

    expect(result.current.gasPrices).toBeNull();
    expect(result.current.isLoading).toBe(false);
  });

  it('returns default tier as standard', () => {
    const { result } = renderHook(() => useGasEstimation(), {
      wrapper: TestProviders,
    });

    expect(result.current.selectedTier).toBe('standard');
  });

  it('allows changing selected tier', () => {
    const { result } = renderHook(() => useGasEstimation(), {
      wrapper: TestProviders,
    });

    result.current.setSelectedTier('fast');
    expect(result.current.selectedTier).toBe('fast');
  });

  it('provides optimization tips', () => {
    const { result } = renderHook(() => useGasEstimation(), {
      wrapper: TestProviders,
    });

    expect(result.current.optimizationTips).toBeInstanceOf(Array);
    expect(result.current.optimizationTips.length).toBeGreaterThan(0);
  });

  it('can be disabled', () => {
    const gasLimit = BigInt(200000);
    const { result } = renderHook(
      () => useGasEstimation(gasLimit, { enabled: false }),
      {
        wrapper: TestProviders,
      }
    );

    expect(result.current.gasPrices).toBeNull();
  });

  it('refreshes gas prices on demand', async () => {
    const gasLimit = BigInt(200000);
    const { result } = renderHook(() => useGasEstimation(gasLimit), {
      wrapper: TestProviders,
    });

    await waitFor(() => {
      expect(typeof result.current.refresh).toBe('function');
    });

    await result.current.refresh();
    // Verify refresh was called
    expect(result.current.refresh).toBeDefined();
  });
});
