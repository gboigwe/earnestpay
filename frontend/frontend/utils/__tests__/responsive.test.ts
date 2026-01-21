/**
 * Tests for responsive design utilities
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import {
  breakpoints,
  useBreakpoint,
  useIsMobile,
  useIsTablet,
  useIsDesktop,
  useViewport,
  useIsTouchDevice,
  useMediaQuery,
  useOrientation,
  useResponsiveValue,
  useResponsiveSpacing,
  getResponsiveClasses,
  clamp,
  pxToRem,
  spacing,
} from '../responsive';
import { mockWindowSize } from '../../test/utils';

describe('Responsive Utilities', () => {
  describe('breakpoints', () => {
    it('defines correct breakpoint values', () => {
      expect(breakpoints.sm).toBe(640);
      expect(breakpoints.md).toBe(768);
      expect(breakpoints.lg).toBe(1024);
      expect(breakpoints.xl).toBe(1280);
      expect(breakpoints['2xl']).toBe(1536);
    });
  });

  describe('useBreakpoint', () => {
    it('returns sm for small screens', () => {
      mockWindowSize(500, 800);
      const { result } = renderHook(() => useBreakpoint());
      expect(result.current).toBe('sm');
    });

    it('returns md for medium screens', () => {
      mockWindowSize(800, 600);
      const { result } = renderHook(() => useBreakpoint());
      expect(result.current).toBe('md');
    });

    it('returns lg for large screens', () => {
      mockWindowSize(1100, 800);
      const { result } = renderHook(() => useBreakpoint());
      expect(result.current).toBe('lg');
    });

    it('returns xl for extra large screens', () => {
      mockWindowSize(1400, 900);
      const { result } = renderHook(() => useBreakpoint());
      expect(result.current).toBe('xl');
    });

    it('returns 2xl for extra extra large screens', () => {
      mockWindowSize(1600, 1000);
      const { result } = renderHook(() => useBreakpoint());
      expect(result.current).toBe('2xl');
    });

    it('updates on window resize', () => {
      mockWindowSize(500, 800);
      const { result } = renderHook(() => useBreakpoint());
      expect(result.current).toBe('sm');

      act(() => {
        mockWindowSize(1100, 800);
      });

      expect(result.current).toBe('lg');
    });
  });

  describe('useIsMobile', () => {
    it('returns true for mobile screens', () => {
      mockWindowSize(600, 800);
      const { result } = renderHook(() => useIsMobile());
      expect(result.current).toBe(true);
    });

    it('returns false for desktop screens', () => {
      mockWindowSize(1024, 768);
      const { result } = renderHook(() => useIsMobile());
      expect(result.current).toBe(false);
    });

    it('updates on window resize', () => {
      mockWindowSize(600, 800);
      const { result } = renderHook(() => useIsMobile());
      expect(result.current).toBe(true);

      act(() => {
        mockWindowSize(1024, 768);
      });

      expect(result.current).toBe(false);
    });
  });

  describe('useIsTablet', () => {
    it('returns true for tablet screens', () => {
      mockWindowSize(800, 1024);
      const { result } = renderHook(() => useIsTablet());
      expect(result.current).toBe(true);
    });

    it('returns false for mobile screens', () => {
      mockWindowSize(600, 800);
      const { result } = renderHook(() => useIsTablet());
      expect(result.current).toBe(false);
    });

    it('returns false for desktop screens', () => {
      mockWindowSize(1280, 800);
      const { result } = renderHook(() => useIsTablet());
      expect(result.current).toBe(false);
    });
  });

  describe('useIsDesktop', () => {
    it('returns true for desktop screens', () => {
      mockWindowSize(1280, 800);
      const { result } = renderHook(() => useIsDesktop());
      expect(result.current).toBe(true);
    });

    it('returns false for mobile screens', () => {
      mockWindowSize(600, 800);
      const { result } = renderHook(() => useIsDesktop());
      expect(result.current).toBe(false);
    });

    it('returns false for tablet screens', () => {
      mockWindowSize(800, 1024);
      const { result } = renderHook(() => useIsDesktop());
      expect(result.current).toBe(false);
    });
  });

  describe('useViewport', () => {
    it('returns viewport dimensions', () => {
      mockWindowSize(1024, 768);
      const { result } = renderHook(() => useViewport());
      expect(result.current.width).toBe(1024);
      expect(result.current.height).toBe(768);
    });

    it('updates on window resize', () => {
      mockWindowSize(800, 600);
      const { result } = renderHook(() => useViewport());
      expect(result.current.width).toBe(800);

      act(() => {
        mockWindowSize(1200, 800);
      });

      expect(result.current.width).toBe(1200);
      expect(result.current.height).toBe(800);
    });
  });

  describe('useIsTouchDevice', () => {
    it('detects touch devices', () => {
      // Mock touch support
      Object.defineProperty(window, 'ontouchstart', {
        writable: true,
        configurable: true,
        value: null,
      });

      const { result } = renderHook(() => useIsTouchDevice());
      expect(typeof result.current).toBe('boolean');
    });

    it('detects devices with maxTouchPoints', () => {
      Object.defineProperty(navigator, 'maxTouchPoints', {
        writable: true,
        configurable: true,
        value: 5,
      });

      const { result } = renderHook(() => useIsTouchDevice());
      expect(result.current).toBe(true);
    });
  });

  describe('useMediaQuery', () => {
    it('matches media query', () => {
      const { result } = renderHook(() => useMediaQuery('(min-width: 768px)'));
      expect(typeof result.current).toBe('boolean');
    });

    it('returns different values for different queries', () => {
      mockWindowSize(1024, 768);
      const { result: mobile } = renderHook(() =>
        useMediaQuery('(max-width: 640px)')
      );
      const { result: desktop } = renderHook(() =>
        useMediaQuery('(min-width: 1024px)')
      );

      expect(mobile.current).toBe(false);
      expect(desktop.current).toBe(true);
    });
  });

  describe('useOrientation', () => {
    it('returns portrait for tall screens', () => {
      mockWindowSize(600, 800);
      const { result } = renderHook(() => useOrientation());
      expect(result.current).toBe('portrait');
    });

    it('returns landscape for wide screens', () => {
      mockWindowSize(1024, 600);
      const { result } = renderHook(() => useOrientation());
      expect(result.current).toBe('landscape');
    });

    it('updates on orientation change', () => {
      mockWindowSize(600, 800);
      const { result } = renderHook(() => useOrientation());
      expect(result.current).toBe('portrait');

      act(() => {
        mockWindowSize(800, 600);
      });

      expect(result.current).toBe('landscape');
    });
  });

  describe('useResponsiveValue', () => {
    it('returns value for current breakpoint', () => {
      mockWindowSize(800, 600);
      const { result } = renderHook(() =>
        useResponsiveValue({ md: 'medium', lg: 'large' }, 'default')
      );
      expect(result.current).toBe('medium');
    });

    it('falls back to smaller breakpoints', () => {
      mockWindowSize(1100, 800);
      const { result } = renderHook(() =>
        useResponsiveValue({ md: 'medium' }, 'default')
      );
      expect(result.current).toBe('medium');
    });

    it('returns default value when no breakpoints match', () => {
      mockWindowSize(500, 800);
      const { result } = renderHook(() =>
        useResponsiveValue({ lg: 'large', xl: 'extra large' }, 'default')
      );
      expect(result.current).toBe('default');
    });

    it('handles different value types', () => {
      mockWindowSize(1100, 800);
      const { result: numbers } = renderHook(() =>
        useResponsiveValue({ sm: 1, md: 2, lg: 3 }, 0)
      );
      expect(result.current).toBe(3);
    });
  });

  describe('useResponsiveSpacing', () => {
    it('returns mobile spacing for mobile screens', () => {
      mockWindowSize(600, 800);
      const { result } = renderHook(() => useResponsiveSpacing('md'));
      expect(result.current).toBe(spacing.md.mobile);
    });

    it('returns tablet spacing for tablet screens', () => {
      mockWindowSize(800, 1024);
      const { result } = renderHook(() => useResponsiveSpacing('md'));
      expect(result.current).toBe(spacing.md.tablet);
    });

    it('returns desktop spacing for desktop screens', () => {
      mockWindowSize(1280, 800);
      const { result } = renderHook(() => useResponsiveSpacing('md'));
      expect(result.current).toBe(spacing.md.desktop);
    });

    it('works with different spacing sizes', () => {
      mockWindowSize(1280, 800);
      const { result: xs } = renderHook(() => useResponsiveSpacing('xs'));
      const { result: xl } = renderHook(() => useResponsiveSpacing('xl'));

      expect(xs.current).toBe(spacing.xs.desktop);
      expect(xl.current).toBe(spacing.xl.desktop);
    });
  });

  describe('getResponsiveClasses', () => {
    it('returns base class when no responsive classes', () => {
      const result = getResponsiveClasses('base-class');
      expect(result).toBe('base-class');
    });

    it('combines base and responsive classes', () => {
      const result = getResponsiveClasses('base', {
        md: 'md-class',
        lg: 'lg-class',
      });
      expect(result).toContain('base');
      expect(result).toContain('md:md-class');
      expect(result).toContain('lg:lg-class');
    });

    it('handles empty responsive object', () => {
      const result = getResponsiveClasses('base', {});
      expect(result).toBe('base');
    });

    it('skips undefined responsive values', () => {
      const result = getResponsiveClasses('base', {
        md: 'md-class',
        lg: undefined,
      });
      expect(result).toContain('base');
      expect(result).toContain('md:md-class');
      expect(result).not.toContain('lg:');
    });
  });

  describe('clamp', () => {
    it('returns value when within range', () => {
      expect(clamp(5, 0, 10)).toBe(5);
    });

    it('returns min when value below range', () => {
      expect(clamp(-5, 0, 10)).toBe(0);
    });

    it('returns max when value above range', () => {
      expect(clamp(15, 0, 10)).toBe(10);
    });

    it('handles negative ranges', () => {
      expect(clamp(-5, -10, -1)).toBe(-5);
    });

    it('handles equal min and max', () => {
      expect(clamp(5, 3, 3)).toBe(3);
    });
  });

  describe('pxToRem', () => {
    it('converts px to rem with default base', () => {
      expect(pxToRem(16)).toBe(1);
      expect(pxToRem(32)).toBe(2);
    });

    it('converts px to rem with custom base', () => {
      expect(pxToRem(20, 10)).toBe(2);
      expect(pxToRem(15, 10)).toBe(1.5);
    });

    it('handles zero', () => {
      expect(pxToRem(0)).toBe(0);
    });

    it('handles decimals', () => {
      expect(pxToRem(24)).toBe(1.5);
    });
  });

  describe('spacing', () => {
    it('defines all spacing sizes', () => {
      expect(spacing.xs).toBeDefined();
      expect(spacing.sm).toBeDefined();
      expect(spacing.md).toBeDefined();
      expect(spacing.lg).toBeDefined();
      expect(spacing.xl).toBeDefined();
      expect(spacing['2xl']).toBeDefined();
    });

    it('has mobile, tablet, and desktop values', () => {
      expect(spacing.md.mobile).toBeDefined();
      expect(spacing.md.tablet).toBeDefined();
      expect(spacing.md.desktop).toBeDefined();
    });

    it('has increasing values', () => {
      expect(spacing.xs.mobile).toBeLessThan(spacing.sm.mobile);
      expect(spacing.sm.mobile).toBeLessThan(spacing.md.mobile);
      expect(spacing.md.mobile).toBeLessThan(spacing.lg.mobile);
    });

    it('desktop spacing is larger than mobile', () => {
      expect(spacing.md.desktop).toBeGreaterThan(spacing.md.mobile);
    });
  });
});
