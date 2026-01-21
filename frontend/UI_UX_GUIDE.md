# UI/UX Enhancement Guide

Comprehensive guide for the improved user interface and experience components with Base branding and mobile-first design.

## Overview

This guide covers:
- **Loading States** - Consistent loading indicators
- **Error Handling** - User-friendly error messages
- **Responsive Design** - Mobile-first utilities
- **Mobile Components** - Touch-optimized interfaces
- **Base Branding** - White and green color scheme

## Loading States

### Components

#### Spinner
Basic loading spinner in green theme.

```typescript
import { Spinner } from '@/components';

<Spinner size="sm" />   // Small (16px)
<Spinner size="md" />   // Medium (24px) - default
<Spinner size="lg" />   // Large (32px)
```

#### SkeletonText
Animated skeleton for text content.

```typescript
import { SkeletonText } from '@/components';

<SkeletonText lines={3} />
```

#### SkeletonCard
Full card skeleton with pulsing animation.

```typescript
import { SkeletonCard } from '@/components';

<SkeletonCard className="mb-4" />
```

#### PageLoader
Full-page loading state.

```typescript
import { PageLoader } from '@/components';

<PageLoader message="Loading your dashboard..." />
```

#### InlineLoader
Compact inline loading indicator.

```typescript
import { InlineLoader } from '@/components';

<InlineLoader message="Processing..." />
```

#### ButtonLoader
Button with loading state.

```typescript
import { ButtonLoader } from '@/components';

<button>
  <ButtonLoader isLoading={isSubmitting}>
    Submit
  </ButtonLoader>
</button>
```

#### TableLoader
Skeleton for tables.

```typescript
import { TableLoader } from '@/components';

<TableLoader rows={5} columns={4} />
```

#### LoadingOverlay
Overlay for existing content.

```typescript
import { LoadingOverlay } from '@/components';

<LoadingOverlay isLoading={isSaving}>
  <YourContent />
</LoadingOverlay>
```

#### ProgressBar
Progress indicator (0-100%).

```typescript
import { ProgressBar } from '@/components';

<ProgressBar progress={uploadProgress} />
```

#### Additional Loading Components

```typescript
// Pulsing dot indicator
<PulsingDot />

// Refresh loader
<RefreshLoader isRefreshing={isRefreshing} />

// Loading dots animation
<LoadingDots />

// Shimmer effect
<ShimmerBox className="h-20 w-full rounded-lg" />
```

### Usage Example

```typescript
function EmployeeList() {
  const { data, isLoading, error } = useEmployees();

  if (isLoading) {
    return (
      <div className="space-y-4">
        <SkeletonCard />
        <SkeletonCard />
        <SkeletonCard />
      </div>
    );
  }

  if (error) {
    return <ErrorMessage title="Failed to load" message={error.message} />;
  }

  return <div>{/* Render data */}</div>;
}
```

## Error States

### Components

#### ErrorMessage
Inline error with severity levels.

```typescript
import { ErrorMessage } from '@/components';

<ErrorMessage
  title="Payment Failed"
  message="Insufficient funds in wallet"
  severity="error"  // 'error' | 'warning' | 'info'
  onRetry={() => retryPayment()}
  onDismiss={() => closeError()}
/>
```

**Severity Colors:**
- `error` - Red (critical issues)
- `warning` - Yellow (warnings)
- `info` - Blue (informational)

#### ErrorPage
Full-page error state.

```typescript
import { ErrorPage } from '@/components';

<ErrorPage
  title="Something went wrong"
  message="Unable to load your data"
  onRetry={() => window.location.reload()}
  showHomeButton={true}
/>
```

#### EmptyState
Empty data state.

```typescript
import { EmptyState } from '@/components';
import { Users } from 'lucide-react';

<EmptyState
  icon={Users}
  title="No employees yet"
  message="Get started by adding your first employee"
  actionLabel="Add Employee"
  onAction={() => openAddModal()}
/>
```

#### Specialized Error Components

```typescript
// Network error
<NetworkError onRetry={retry} />

// Wallet not connected
<WalletError
  message="Connect wallet to view transactions"
  onConnect={connectWallet}
/>

// Transaction error
<TransactionError
  error="Transaction reverted: Insufficient balance"
  onRetry={retryTransaction}
  onViewDetails={showDetails}
/>

// Form validation errors
<ValidationError errors={['Email is required', 'Invalid amount']} />

// Timeout error
<TimeoutError onRetry={retry} />

// Permission denied
<PermissionError message="Admin access required" />
```

#### ErrorBoundaryFallback
React error boundary fallback.

```typescript
import { ErrorBoundaryFallback } from '@/components';

<ErrorBoundary
  FallbackComponent={ErrorBoundaryFallback}
>
  <App />
</ErrorBoundary>
```

### Complete Error Handling Example

```typescript
function PaymentForm() {
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (data) => {
    setError(null);
    setIsSubmitting(true);

    try {
      await processPayment(data);
      toast.success('Payment successful!');
    } catch (err) {
      setError(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div>
      {error && (
        <ErrorMessage
          title="Payment Error"
          message={error}
          severity="error"
          onRetry={() => handleSubmit(lastData)}
          onDismiss={() => setError(null)}
        />
      )}

      <form onSubmit={handleSubmit}>
        {/* Form fields */}
        <button disabled={isSubmitting}>
          <ButtonLoader isLoading={isSubmitting}>
            Submit Payment
          </ButtonLoader>
        </button>
      </form>
    </div>
  );
}
```

## Responsive Design

### Hooks

#### useBreakpoint
Get current breakpoint.

```typescript
import { useBreakpoint } from '@/utils/responsive';

function MyComponent() {
  const breakpoint = useBreakpoint(); // 'sm' | 'md' | 'lg' | 'xl' | '2xl'

  return <div>Current: {breakpoint}</div>;
}
```

#### useIsMobile / useIsTablet / useIsDesktop

```typescript
import { useIsMobile, useIsTablet, useIsDesktop } from '@/utils/responsive';

const isMobile = useIsMobile();   // < 768px
const isTablet = useIsTablet();   // 768px - 1024px
const isDesktop = useIsDesktop(); // >= 1024px
```

#### useViewport
Get viewport dimensions.

```typescript
import { useViewport } from '@/utils/responsive';

const { width, height } = useViewport();
```

#### useIsTouchDevice
Detect touch capability.

```typescript
import { useIsTouchDevice } from '@/utils/responsive';

const isTouch = useIsTouchDevice();
```

#### useMediaQuery
Custom media query matching.

```typescript
import { useMediaQuery } from '@/utils/responsive';

const isDarkMode = useMediaQuery('(prefers-color-scheme: dark)');
const isPortrait = useMediaQuery('(orientation: portrait)');
```

#### useOrientation
Detect device orientation.

```typescript
import { useOrientation } from '@/utils/responsive';

const orientation = useOrientation(); // 'portrait' | 'landscape'
```

#### useResponsiveValue
Select value based on breakpoint.

```typescript
import { useResponsiveValue } from '@/utils/responsive';

const columns = useResponsiveValue(
  { sm: 1, md: 2, lg: 3, xl: 4 },
  1 // default
);
```

#### useResponsiveSpacing
Get responsive spacing.

```typescript
import { useResponsiveSpacing } from '@/utils/responsive';

const padding = useResponsiveSpacing('md');
// Mobile: 12px, Tablet: 16px, Desktop: 24px
```

### Responsive Design Example

```typescript
function ResponsiveCard() {
  const isMobile = useIsMobile();
  const columns = useResponsiveValue({ sm: 1, md: 2, lg: 3 }, 1);
  const spacing = useResponsiveSpacing('md');

  return (
    <div
      className={`grid gap-${spacing} grid-cols-${columns}`}
      style={{ padding: `${spacing}px` }}
    >
      {isMobile ? (
        <MobileCardView />
      ) : (
        <DesktopCardView />
      )}
    </div>
  );
}
```

## Mobile-Optimized Components

### MobileDrawer
Slide-in navigation drawer.

```typescript
import { MobileDrawer, MobileMenuButton } from '@/components';

function Navigation() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <MobileMenuButton onClick={() => setIsOpen(true)} />

      <MobileDrawer isOpen={isOpen} onClose={() => setIsOpen(false)}>
        <nav>
          {/* Menu items */}
        </nav>
      </MobileDrawer>
    </>
  );
}
```

### MobileBottomSheet
Bottom sheet modal (iOS-style).

```typescript
import { MobileBottomSheet } from '@/components';

<MobileBottomSheet
  isOpen={isOpen}
  onClose={() => setIsOpen(false)}
  title="Select Payment Method"
>
  <div>
    {/* Sheet content */}
  </div>
</MobileBottomSheet>
```

**Features:**
- Swipe-to-dismiss
- Pull handle
- Drag constraints
- Max height: 85vh

### MobileAccordion
Touch-friendly accordion.

```typescript
import { MobileAccordion } from '@/components';

<MobileAccordion
  items={[
    {
      title: 'Payment Details',
      content: <PaymentInfo />,
      icon: <CreditCard className="w-5 h-5" />
    },
    {
      title: 'Transaction History',
      content: <History />
    }
  ]}
/>
```

### TouchButton
Touch-optimized button (min height 44px).

```typescript
import { TouchButton } from '@/components';

<TouchButton
  onClick={handleClick}
  variant="primary"  // 'primary' | 'secondary' | 'outline'
>
  Confirm Payment
</TouchButton>
```

### MobileListItem
Tap-friendly list item.

```typescript
import { MobileListItem } from '@/components';

<MobileListItem
  title="John Doe"
  subtitle="john@example.com"
  icon={<User className="w-5 h-5" />}
  onClick={() => viewEmployee()}
  rightContent={<Badge>Active</Badge>}
/>
```

### MobileTabBar
Fixed bottom tab navigation.

```typescript
import { MobileTabBar } from '@/components';

<MobileTabBar
  tabs={[
    { id: 'home', label: 'Home', icon: <Home className="w-5 h-5" /> },
    { id: 'payments', label: 'Payments', icon: <DollarSign className="w-5 h-5" /> },
    { id: 'profile', label: 'Profile', icon: <User className="w-5 h-5" /> }
  ]}
  activeTab={activeTab}
  onChange={setActiveTab}
/>
```

### FloatingActionButton
Floating action button.

```typescript
import { FloatingActionButton } from '@/components';

<FloatingActionButton
  onClick={() => createNew()}
  icon={<Plus className="w-6 h-6" />}
  label="Add"
/>
```

### SwipeableCard
Swipeable card with actions.

```typescript
import { SwipeableCard } from '@/components';

<SwipeableCard
  onSwipeLeft={() => deleteItem()}
  onSwipeRight={() => archiveItem()}
>
  <div>Card content</div>
</SwipeableCard>
```

### Complete Mobile Example

```typescript
function MobileApp() {
  const [activeTab, setActiveTab] = useState('home');
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <SafeAreaView>
      {/* Header */}
      <header className="sticky top-0 bg-white border-b border-green-200 p-4">
        <div className="flex items-center justify-between">
          <h1 className="text-xl font-bold text-green-700">EarnestPay</h1>
          <MobileMenuButton onClick={() => setMenuOpen(true)} />
        </div>
      </header>

      {/* Drawer */}
      <MobileDrawer isOpen={menuOpen} onClose={() => setMenuOpen(false)}>
        <nav className="space-y-2">
          <MobileListItem
            title="Dashboard"
            icon={<Home className="w-5 h-5" />}
            onClick={() => navigate('/dashboard')}
          />
          <MobileListItem
            title="Payments"
            icon={<DollarSign className="w-5 h-5" />}
            onClick={() => navigate('/payments')}
          />
        </nav>
      </MobileDrawer>

      {/* Content */}
      <main className="pb-20">
        {activeTab === 'home' && <HomePage />}
        {activeTab === 'payments' && <PaymentsPage />}
        {activeTab === 'profile' && <ProfilePage />}
      </main>

      {/* Tab Bar */}
      <MobileTabBar
        tabs={[
          { id: 'home', label: 'Home', icon: <Home /> },
          { id: 'payments', label: 'Payments', icon: <DollarSign /> },
          { id: 'profile', label: 'Profile', icon: <User /> }
        ]}
        activeTab={activeTab}
        onChange={setActiveTab}
      />

      {/* FAB */}
      <FloatingActionButton
        onClick={() => createPayment()}
        icon={<Plus />}
        label="New"
      />
    </SafeAreaView>
  );
}
```

## Base Branding

### Color Scheme

Primary colors (white and green):

```css
/* Primary Green */
--primary: hsl(142, 71%, 45%);    /* #22c55e */

/* Dark Green */
--secondary: hsl(142, 76%, 36%);  /* #16a34a */

/* Light Green */
--muted: hsl(120, 10%, 95%);      /* Very light green-tinted */

/* White */
--background: hsl(0, 0%, 100%);   /* #ffffff */
```

### Tailwind Classes

```typescript
// Backgrounds
'bg-white'
'bg-green-50'   // Very light green
'bg-green-100'  // Light green
'bg-green-600'  // Primary green
'bg-green-700'  // Hover green

// Text
'text-green-600'  // Primary text
'text-green-700'  // Dark text
'text-gray-600'   // Secondary text

// Borders
'border-green-200'  // Light border
'border-green-300'  // Medium border

// Buttons
'bg-green-600 hover:bg-green-700 text-white'
```

### Component Examples

```typescript
// Primary button
<button className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg">
  Submit
</button>

// Secondary button
<button className="px-4 py-2 bg-green-100 hover:bg-green-200 text-green-700 rounded-lg">
  Cancel
</button>

// Card
<div className="bg-white border border-green-200 rounded-lg p-6">
  Content
</div>

// Badge
<span className="px-2 py-1 bg-green-100 text-green-700 rounded-full text-xs">
  Active
</span>
```

## Best Practices

### Loading States
- ✅ Show loading immediately on action
- ✅ Use skeleton loaders for content
- ✅ Provide feedback during long operations
- ❌ Don't leave users wondering if something is happening

### Error Handling
- ✅ Provide clear, actionable error messages
- ✅ Offer retry options when applicable
- ✅ Use appropriate severity levels
- ❌ Don't show technical error codes to users

### Responsive Design
- ✅ Design mobile-first
- ✅ Test on actual devices
- ✅ Use touch-friendly sizes (min 44px)
- ✅ Consider safe areas on iOS
- ❌ Don't assume desktop-only usage

### Accessibility
- ✅ Provide proper ARIA labels
- ✅ Ensure keyboard navigation
- ✅ Maintain color contrast ratios
- ✅ Support screen readers
- ❌ Don't rely solely on color for information

## Performance Tips

1. **Lazy Load Components**
```typescript
const MobileDrawer = lazy(() => import('@/components/MobileDrawer'));
```

2. **Memoize Expensive Renders**
```typescript
const SkeletonCards = memo(SkeletonCard);
```

3. **Debounce Resize Handlers**
```typescript
const debouncedResize = useMemo(
  () => debounce(handleResize, 150),
  []
);
```

4. **Use CSS for Simple Animations**
```css
.spinner {
  animation: spin 1s linear infinite;
}
```

## Testing

### Responsive Testing
```typescript
test('shows mobile menu on small screens', () => {
  global.innerWidth = 640;
  render(<Navigation />);
  expect(screen.getByRole('button', { name: /menu/i })).toBeInTheDocument();
});
```

### Loading States
```typescript
test('shows loading skeleton while fetching', async () => {
  render(<EmployeeList />);
  expect(screen.getByRole('status')).toBeInTheDocument();
  await waitForElementToBeRemoved(() => screen.getByRole('status'));
});
```

### Error Handling
```typescript
test('displays error message on failure', async () => {
  mockFetch.mockRejectedValueOnce(new Error('Network error'));
  render(<PaymentForm />);
  await userEvent.click(screen.getByRole('button', { name: /submit/i }));
  expect(screen.getByText(/network error/i)).toBeInTheDocument();
});
```

## Migration Guide

### From Old Loading States
```diff
- <div className="spinner" />
+ <Spinner size="md" />

- <div className="loading-text">Loading...</div>
+ <InlineLoader message="Loading..." />
```

### From Old Error Messages
```diff
- <div className="error">{error}</div>
+ <ErrorMessage
+   title="Error"
+   message={error}
+   severity="error"
+ />
```

### Adding Mobile Support
```diff
- <div className="container">
+ <div className="container md:max-w-7xl">
    {children}
  </div>

- <button className="btn">
+ <TouchButton variant="primary">
    Click Me
+ </TouchButton>
```
