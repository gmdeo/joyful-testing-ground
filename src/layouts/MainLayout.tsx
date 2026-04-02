import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { 
  LayoutDashboard, 
  MessageSquare, 
  CheckSquare, 
  Clock, 
  Brain, 
  Wrench, 
  Plug, 
  Settings,
  Menu,
  X,
  Bell
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { cn } from '@/lib/utils';
import { appRoutes, type RouteConfig } from '@/router';

// ============================================================================
// MAIN LAYOUT WITH SIDEBAR NAVIGATION
// Applies code-ninja patterns: 
// - Type-safe component interfaces
// - Context management
// - Performance optimized rendering
// ============================================================================

interface MainLayoutProps {
  children?: React.ReactNode;
}

/**
 * Navigation Item Component
 * Type-safe navigation with active state management
 */
const NavItem = ({ 
  route, 
  isActive 
}: { 
  route: RouteConfig; 
  isActive: boolean;
}) => {
  const Icon = getIconForRoute(route.icon);

  return (
    <Link
      to={route.path}
      className={cn(
        'flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-all',
        isActive
          ? 'bg-primary text-primary-foreground shadow-md'
          : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground'
      )}
    >
      {Icon && <Icon className="h-4 w-4" />}
      {route.title}
    </Link>
  );
};

/**
 * Icon Lookup Function
 * Maps route icon names to Lucide components
 */
const getIconForRoute = (iconName?: string): React.ComponentType<{ className?: string }> => {
  const icons: Record<string, React.ComponentType<{ className?: string }> | null> = {
    LayoutDashboard,
    MessageSquare,
    CheckSquare,
    Clock,
    Brain,
    Wrench,
    Plug,
    Settings,
    Menu,
    X,
    Bell,
  };

  return icons[iconName || ''] || LayoutDashboard;
};

/**
 * Sidebar Component
 * Responsive navigation sidebar
 */
const Sidebar = ({ className }: { className?: string }) => {
  const location = useLocation();
  const currentPath = location.pathname;

  return (
    <div className={cn('flex h-full flex-col border-r bg-background', className)}>
      {/* Logo / Brand */}
      <div className="flex h-16 items-center border-b px-4">
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
            <span className="text-primary-foreground font-bold">H</span>
          </div>
          <span className="font-bold text-lg">Hermes</span>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto p-4 space-y-1">
        <div className="mb-4 px-3 text-xs font-semibold text-muted-foreground">
          Main
        </div>
        {appRoutes.slice(0, 5).map(route => (
          <NavItem
            key={route.path}
            route={route}
            isActive={currentPath === route.path}
          />
        ))}

        <div className="mb-4 mt-6 px-3 text-xs font-semibold text-muted-foreground">
          System
        </div>
        {appRoutes.slice(5).map(route => (
          <NavItem
            key={route.path}
            route={route}
            isActive={currentPath === route.path}
          />
        ))}
      </nav>

      {/* User Info / Quick Actions */}
      <div className="border-t p-4">
        <div className="flex items-center gap-3 rounded-lg bg-accent p-3">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary">
            <span className="text-primary-foreground text-xs font-semibold">GM</span>
          </div>
          <div className="flex-1 overflow-hidden">
            <div className="truncate text-sm font-medium">gmdeo</div>
            <div className="truncate text-xs text-muted-foreground">
              Admin
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

/**
 * Header Component
 * Top header with search, notifications, and user actions
 */
const Header = () => {
  return (
    <header className="flex h-16 items-center justify-between border-b bg-background px-4">
      <div className="flex items-center gap-4">
        <MobileNav />
        <h1 className="text-lg font-semibold">Dashboard</h1>
      </div>

      <div className="flex items-center gap-2">
        <Button variant="ghost" size="icon">
          <Bell className="h-4 w-4" />
        </Button>
        <Button variant="outline" size="sm">
          New Session
        </Button>
      </div>
    </header>
  );
};

/**
 * Mobile Navigation Component
 */
const MobileNav = () => {
  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button variant="ghost" size="icon" className="md:hidden">
          <Menu className="h-5 w-5" />
        </Button>
      </SheetTrigger>
      <SheetContent side="left" className="p-0">
        <Sidebar className="border-0" />
      </SheetContent>
    </Sheet>
  );
};

/**
 * Main Layout Component
 */
export const MainLayout: React.FC<MainLayoutProps> = ({ children }) => {
  return (
    <div className="flex min-h-screen bg-background">
      {/* Desktop Sidebar */}
      <aside className="hidden w-64 border-r md:block">
        <Sidebar />
      </aside>

      {/* Main Content Area */}
      <div className="flex flex-col flex-1">
        <Header />
        <main className="flex-1 overflow-auto p-4 md:p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default MainLayout;