import { createBrowserRouter, RouterProvider, Route, Outlet } from 'react-router-dom';
import { z } from 'zod';

// ============================================================================
// ROUTE DEFINITIONS WITH TYPE SAFETY
// ============================================================================

/**
 * Route Schema - Validates route configuration
 */
const RouteSchema = z.object({
  path: z.string(),
  title: z.string(),
  component: z.string(),
  icon: z.string().optional(),
  description: z.string().optional(),
});

export type RouteConfig = z.infer<typeof RouteSchema>;

/**
 * Application Routes Configuration
 * Centralized route definitions with type safety
 */
export const appRoutes: RouteConfig[] = [
  {
    path: '/dashboard',
    title: 'Dashboard',
    component: 'Dashboard',
    icon: 'LayoutDashboard',
    description: 'Overview of sessions, tasks, and system status',
  },
  {
    path: '/chat',
    title: 'Chat',
    component: 'Chat',
    icon: 'MessageSquare',
    description: 'Chat with Hermes AI',
  },
  {
    path: '/sessions',
    title: 'Sessions',
    component: 'Sessions',
    icon: 'MessageSquare',
    description: 'Manage and browse conversation sessions',
  },
  {
    path: '/sessions/:id',
    title: 'Session Details',
    component: 'SessionDetails',
    description: 'View and manage specific session',
  },
  {
    path: '/tasks',
    title: 'Tasks',
    component: 'Tasks',
    icon: 'CheckSquare',
    description: 'Task and todo management',
  },
  {
    path: '/cron',
    title: 'Cron Jobs',
    component: 'CronJobs',
    icon: 'Clock',
    description: 'Scheduled task management',
  },
  {
    path: '/memory',
    title: 'Memory',
    component: 'Memory',
    icon: 'Brain',
    description: 'Browse and manage persistent memory',
  },
  {
    path: '/tools',
    title: 'Tools',
    component: 'Tools',
    icon: 'Wrench',
    description: 'Tool execution and management',
  },
  {
    path: '/integrations',
    title: 'Integrations',
    component: 'Integrations',
    icon: 'Plug',
    description: 'Integration management (GitHub, Telegram, Notion)',
  },
  {
    path: '/settings',
    title: 'Settings',
    component: 'Settings',
    icon: 'Settings',
    description: 'Application configuration',
  },
];

/**
 * Route Utilities
 */
export const getRouteByPath = (path: string): RouteConfig | undefined => {
  // Handle dynamic routes
  const normalizedPath = path.replace(/\/[^/]+$/, '/*');
  return appRoutes.find(route => 
    route.path === path || route.path === normalizedPath
  );
};

export const getRouteTitle = (path: string): string => {
  const route = getRouteByPath(path);
  return route?.title || 'Hermes Dashboard';
};

/**
 * Breadcrumb Configuration
 */
export interface BreadcrumbItem {
  title: string;
  path: string;
}

export const getBreadcrumbs = (path: string): BreadcrumbItem[] => {
  const segments = path.split('/').filter(Boolean);
  const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Home', path: '/' },
  ];

  let currentPath = '';
  for (const segment of segments) {
    currentPath += `/${segment}`;
    const route = getRouteByPath(currentPath);
    breadcrumbs.push({
      title: route?.title || segment,
      path: currentPath,
    });
  }

  return breadcrumbs;
};

/**
 * Navigation Guard Configuration
 * For future implementation of permission-based routing
 */
export interface NavigationGuard {
  requiredPermissions?: string[];
  allowedRoles?: string[];
  redirectOnFail?: string;
}

export const routeGuards: Record<string, NavigationGuard> = {
  '/settings': {
    requiredPermissions: ['settings:write'],
  },
  '/integrations': {
    requiredPermissions: ['integrations:read'],
  },
};

/**
 * Create typed router
 */
export const createTypedRouter = () => {
  return createBrowserRouter([
    {
      path: '/',
      element: <Outlet />,
      children: [
        { index: true, element: <div>Redirecting to dashboard...</div> },
        ...appRoutes.map(route => ({
          path: route.path,
          element: <div>{route.component} Page</div>,
        })),
      ],
    },
  ]);
};

export type AppRouter = ReturnType<typeof createTypedRouter>;