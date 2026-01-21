/**
 * Tests for Mobile-Optimized Components
 */

import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import {
  MobileDrawer,
  MobileMenuButton,
  MobileBottomSheet,
  MobileAccordion,
  MobileCardStack,
  TouchButton,
  MobileListItem,
  MobileTabBar,
  SafeAreaView,
  FloatingActionButton,
  SwipeableCard,
} from '../MobileOptimized';
import { Home, Settings } from 'lucide-react';

// Mock the responsive hooks
vi.mock('@/utils/responsive', () => ({
  useIsMobile: vi.fn(() => true),
  useIsTouchDevice: vi.fn(() => true),
}));

describe('MobileOptimized', () => {
  describe('MobileDrawer', () => {
    it('renders when open', () => {
      render(
        <MobileDrawer isOpen={true} onClose={vi.fn()}>
          <div>Drawer content</div>
        </MobileDrawer>
      );
      expect(screen.getByText('Drawer content')).toBeInTheDocument();
      expect(screen.getByText('Menu')).toBeInTheDocument();
    });

    it('does not render when closed', () => {
      render(
        <MobileDrawer isOpen={false} onClose={vi.fn()}>
          <div>Drawer content</div>
        </MobileDrawer>
      );
      expect(screen.queryByText('Drawer content')).not.toBeInTheDocument();
    });

    it('calls onClose when close button clicked', async () => {
      const user = userEvent.setup();
      const onClose = vi.fn();

      render(
        <MobileDrawer isOpen={true} onClose={onClose}>
          <div>Content</div>
        </MobileDrawer>
      );

      const closeButton = screen.getByLabelText('Close menu');
      await user.click(closeButton);

      expect(onClose).toHaveBeenCalledTimes(1);
    });

    it('calls onClose when backdrop clicked', async () => {
      const user = userEvent.setup();
      const onClose = vi.fn();

      const { container } = render(
        <MobileDrawer isOpen={true} onClose={onClose}>
          <div>Content</div>
        </MobileDrawer>
      );

      const backdrop = container.querySelector('.bg-black\\/50');
      if (backdrop) {
        await user.click(backdrop);
        expect(onClose).toHaveBeenCalled();
      }
    });
  });

  describe('MobileMenuButton', () => {
    it('renders menu button', () => {
      render(<MobileMenuButton onClick={vi.fn()} />);
      expect(screen.getByLabelText('Open menu')).toBeInTheDocument();
    });

    it('calls onClick when clicked', async () => {
      const user = userEvent.setup();
      const onClick = vi.fn();

      render(<MobileMenuButton onClick={onClick} />);

      const button = screen.getByLabelText('Open menu');
      await user.click(button);

      expect(onClick).toHaveBeenCalledTimes(1);
    });
  });

  describe('MobileBottomSheet', () => {
    it('renders when open', () => {
      render(
        <MobileBottomSheet isOpen={true} onClose={vi.fn()}>
          <div>Bottom sheet content</div>
        </MobileBottomSheet>
      );
      expect(screen.getByText('Bottom sheet content')).toBeInTheDocument();
    });

    it('does not render when closed', () => {
      render(
        <MobileBottomSheet isOpen={false} onClose={vi.fn()}>
          <div>Bottom sheet content</div>
        </MobileBottomSheet>
      );
      expect(screen.queryByText('Bottom sheet content')).not.toBeInTheDocument();
    });

    it('renders title when provided', () => {
      render(
        <MobileBottomSheet isOpen={true} onClose={vi.fn()} title="Sheet Title">
          <div>Content</div>
        </MobileBottomSheet>
      );
      expect(screen.getByText('Sheet Title')).toBeInTheDocument();
    });

    it('calls onClose when backdrop clicked', async () => {
      const user = userEvent.setup();
      const onClose = vi.fn();

      const { container } = render(
        <MobileBottomSheet isOpen={true} onClose={onClose}>
          <div>Content</div>
        </MobileBottomSheet>
      );

      const backdrop = container.querySelector('.bg-black\\/50');
      if (backdrop) {
        await user.click(backdrop);
        expect(onClose).toHaveBeenCalled();
      }
    });
  });

  describe('MobileAccordion', () => {
    const items = [
      {
        title: 'Item 1',
        content: <div>Content 1</div>,
        icon: <Home />,
      },
      {
        title: 'Item 2',
        content: <div>Content 2</div>,
      },
    ];

    it('renders all accordion items', () => {
      render(<MobileAccordion items={items} />);
      expect(screen.getByText('Item 1')).toBeInTheDocument();
      expect(screen.getByText('Item 2')).toBeInTheDocument();
    });

    it('does not show content initially', () => {
      render(<MobileAccordion items={items} />);
      expect(screen.queryByText('Content 1')).not.toBeInTheDocument();
      expect(screen.queryByText('Content 2')).not.toBeInTheDocument();
    });

    it('expands item when clicked', async () => {
      const user = userEvent.setup();
      render(<MobileAccordion items={items} />);

      const item1 = screen.getByText('Item 1');
      await user.click(item1);

      expect(screen.getByText('Content 1')).toBeInTheDocument();
    });

    it('collapses item when clicked again', async () => {
      const user = userEvent.setup();
      render(<MobileAccordion items={items} />);

      const item1 = screen.getByText('Item 1');
      await user.click(item1);
      expect(screen.getByText('Content 1')).toBeInTheDocument();

      await user.click(item1);
      expect(screen.queryByText('Content 1')).not.toBeInTheDocument();
    });

    it('only one item expanded at a time', async () => {
      const user = userEvent.setup();
      render(<MobileAccordion items={items} />);

      const item1 = screen.getByText('Item 1');
      await user.click(item1);
      expect(screen.getByText('Content 1')).toBeInTheDocument();

      const item2 = screen.getByText('Item 2');
      await user.click(item2);
      expect(screen.queryByText('Content 1')).not.toBeInTheDocument();
      expect(screen.getByText('Content 2')).toBeInTheDocument();
    });

    it('renders icon when provided', () => {
      const { container } = render(<MobileAccordion items={items} />);
      expect(container.querySelector('svg')).toBeInTheDocument();
    });
  });

  describe('MobileCardStack', () => {
    it('renders children', () => {
      render(
        <MobileCardStack>
          <div>Card 1</div>
          <div>Card 2</div>
        </MobileCardStack>
      );
      expect(screen.getByText('Card 1')).toBeInTheDocument();
      expect(screen.getByText('Card 2')).toBeInTheDocument();
    });
  });

  describe('TouchButton', () => {
    it('renders button with children', () => {
      render(<TouchButton>Click me</TouchButton>);
      expect(screen.getByText('Click me')).toBeInTheDocument();
    });

    it('calls onClick when clicked', async () => {
      const user = userEvent.setup();
      const onClick = vi.fn();

      render(<TouchButton onClick={onClick}>Click me</TouchButton>);

      const button = screen.getByText('Click me');
      await user.click(button);

      expect(onClick).toHaveBeenCalledTimes(1);
    });

    it('renders with primary variant by default', () => {
      const { container } = render(<TouchButton>Button</TouchButton>);
      expect(container.querySelector('.bg-green-600')).toBeInTheDocument();
    });

    it('renders with secondary variant', () => {
      const { container } = render(
        <TouchButton variant="secondary">Button</TouchButton>
      );
      expect(container.querySelector('.bg-green-100')).toBeInTheDocument();
    });

    it('renders with outline variant', () => {
      const { container } = render(
        <TouchButton variant="outline">Button</TouchButton>
      );
      expect(container.querySelector('.border-2')).toBeInTheDocument();
    });

    it('applies custom className', () => {
      const { container } = render(
        <TouchButton className="custom-class">Button</TouchButton>
      );
      expect(container.firstChild).toHaveClass('custom-class');
    });
  });

  describe('MobileListItem', () => {
    it('renders title', () => {
      render(<MobileListItem title="Item Title" />);
      expect(screen.getByText('Item Title')).toBeInTheDocument();
    });

    it('renders subtitle when provided', () => {
      render(<MobileListItem title="Title" subtitle="Subtitle text" />);
      expect(screen.getByText('Subtitle text')).toBeInTheDocument();
    });

    it('renders icon when provided', () => {
      const { container } = render(
        <MobileListItem title="Title" icon={<Home />} />
      );
      expect(container.querySelector('svg')).toBeInTheDocument();
    });

    it('calls onClick when clicked', async () => {
      const user = userEvent.setup();
      const onClick = vi.fn();

      render(<MobileListItem title="Title" onClick={onClick} />);

      const item = screen.getByText('Title');
      await user.click(item);

      expect(onClick).toHaveBeenCalledTimes(1);
    });

    it('renders rightContent when provided', () => {
      render(
        <MobileListItem
          title="Title"
          rightContent={<div>Right Content</div>}
        />
      );
      expect(screen.getByText('Right Content')).toBeInTheDocument();
    });

    it('shows chevron when onClick provided and no rightContent', () => {
      const { container } = render(
        <MobileListItem title="Title" onClick={vi.fn()} />
      );
      expect(container.querySelector('svg')).toBeInTheDocument();
    });
  });

  describe('MobileTabBar', () => {
    const tabs = [
      { id: 'home', label: 'Home', icon: <Home /> },
      { id: 'settings', label: 'Settings', icon: <Settings /> },
    ];

    it('renders all tabs', () => {
      render(<MobileTabBar tabs={tabs} activeTab="home" onChange={vi.fn()} />);
      expect(screen.getByText('Home')).toBeInTheDocument();
      expect(screen.getByText('Settings')).toBeInTheDocument();
    });

    it('highlights active tab', () => {
      const { container } = render(
        <MobileTabBar tabs={tabs} activeTab="home" onChange={vi.fn()} />
      );
      const homeButton = screen.getByText('Home').closest('button');
      expect(homeButton).toHaveClass('text-green-600');
    });

    it('calls onChange when tab clicked', async () => {
      const user = userEvent.setup();
      const onChange = vi.fn();

      render(<MobileTabBar tabs={tabs} activeTab="home" onChange={onChange} />);

      const settingsButton = screen.getByText('Settings');
      await user.click(settingsButton);

      expect(onChange).toHaveBeenCalledWith('settings');
    });

    it('renders tab icons', () => {
      const { container } = render(
        <MobileTabBar tabs={tabs} activeTab="home" onChange={vi.fn()} />
      );
      const icons = container.querySelectorAll('svg');
      expect(icons.length).toBeGreaterThan(0);
    });
  });

  describe('SafeAreaView', () => {
    it('renders children', () => {
      render(
        <SafeAreaView>
          <div>Safe content</div>
        </SafeAreaView>
      );
      expect(screen.getByText('Safe content')).toBeInTheDocument();
    });

    it('applies safe area classes', () => {
      const { container } = render(
        <SafeAreaView>
          <div>Content</div>
        </SafeAreaView>
      );
      expect(container.firstChild).toHaveClass('safe-area-top');
      expect(container.firstChild).toHaveClass('safe-area-bottom');
    });

    it('applies custom className', () => {
      const { container } = render(
        <SafeAreaView className="custom-class">
          <div>Content</div>
        </SafeAreaView>
      );
      expect(container.firstChild).toHaveClass('custom-class');
    });
  });

  describe('FloatingActionButton', () => {
    it('renders with icon', () => {
      const { container } = render(
        <FloatingActionButton onClick={vi.fn()} icon={<Home />} />
      );
      expect(container.querySelector('svg')).toBeInTheDocument();
    });

    it('renders label when provided', () => {
      render(
        <FloatingActionButton
          onClick={vi.fn()}
          icon={<Home />}
          label="Add"
        />
      );
      expect(screen.getByText('Add')).toBeInTheDocument();
    });

    it('calls onClick when clicked', async () => {
      const user = userEvent.setup();
      const onClick = vi.fn();

      const { container } = render(
        <FloatingActionButton onClick={onClick} icon={<Home />} />
      );

      const button = container.querySelector('button');
      if (button) {
        await user.click(button);
        expect(onClick).toHaveBeenCalledTimes(1);
      }
    });
  });

  describe('SwipeableCard', () => {
    it('renders children', () => {
      render(
        <SwipeableCard>
          <div>Card content</div>
        </SwipeableCard>
      );
      expect(screen.getByText('Card content')).toBeInTheDocument();
    });

    it('applies draggable styles', () => {
      const { container } = render(
        <SwipeableCard>
          <div>Content</div>
        </SwipeableCard>
      );
      expect(container.firstChild).toHaveClass('cursor-grab');
    });
  });
});
