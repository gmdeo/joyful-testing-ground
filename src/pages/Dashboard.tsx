import { useEffect, useState } from 'react';
import { 
  LayoutDashboard, 
  MessageSquare, 
  CheckSquare, 
  Clock,
  Brain,
  GitBranch,
  Activity,
  TrendingUp,
  AlertTriangle,
  CheckCircle,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { 
  DashboardStats, 
  ActivityEvent,
  DashboardStatsSchema,
  ActivityEventSchema 
} from '@/types';

// ============================================================================
// DASHBOARD OVERVIEW COMPONENT
// Applies code-ninja patterns:
// - Async data fetching with error handling
// - State management with reactivity
// - Type-safe data structures
// ============================================================================

/**
 * Stat Card Component
 * Displays key metrics with visual indicators
 */
interface StatCardProps {
  title: string;
  value: string | number;
  icon: React.ComponentType<{ className?: string }>;
  trend?: {
    value: number;
    isPositive: boolean;
  };
  className?: string;
}

const StatCard = ({ title, value, icon: Icon, trend, className }: StatCardProps) => {
  return (
    <Card className={cn('transition-all hover:shadow-md', className)}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        <Icon className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        {trend && (
          <div className="mt-1 flex items-center text-xs">
            {trend.isPositive ? (
              <TrendingUp className="mr-1 h-3 w-3 text-green-500" />
            ) : (
              <TrendingUp className="mr-1 h-3 w-3 text-red-500 rotate-180" />
            )}
            <span className={cn(
              trend.isPositive ? 'text-green-500' : 'text-red-500'
            )}>
              {Math.abs(trend.value)}%
            </span>
            <span className="ml-1 text-muted-foreground">vs last hour</span>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

/**
 * Activity Timeline Component
 * Shows recent events with chronological timeline
 */
const ActivityTimeline = ({ activities }: { activities: ActivityEvent[] }) => {
  return (
    <div className="space-y-4">
      {activities.map((event) => {
        const Icon = getEventIcon(event.type);
        const color = event.color || 'text-primary';
        
        return (
          <div key={event.id} className="flex gap-3">
            <div className="relative">
              <div className={cn('flex h-8 w-8 items-center justify-center rounded-full bg-accent', color)}>
                <Icon className="h-4 w-4" />
              </div>
              {/* Timeline Line */}
              <div className="absolute left-4 top-8 h-full w-0.5 bg-border last:hidden" />
            </div>
            <div className="flex-1 space-y-1">
              <div className="flex items-center justify-between">
                <p className="text-sm font-medium">{event.title}</p>
                <span className="text-xs text-muted-foreground">
                  {formatRelativeTime(event.timestamp)}
                </span>
              </div>
              <p className="text-sm text-muted-foreground">{event.description}</p>
            </div>
          </div>
        );
      })}
    </div>
  );
};

/**
 * Event Icon Lookup
 */
const getEventIcon = (type: ActivityEvent['type']): React.ComponentType<{ className?: string }> => {
  const icons: Record<ActivityEvent['type'], React.ComponentType<{ className?: string }>> = {
    session: MessageSquare,
    task: CheckSquare,
    cron: Clock,
    git: GitBranch,
    file: Activity,
    other: Activity,
  };
  return icons[type] || Activity;
};

/**
 * Format Relative Time
 */
const formatRelativeTime = (date: Date): string => {
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);

  if (diffMins < 1) return 'Just now';
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  return date.toLocaleDateString();
};

/**
 * Quick Actions Component
 */
const QuickActions = () => {
  const actions = [
    { icon: MessageSquare, label: 'New Session', path: '/sessions' },
    { icon: CheckSquare, label: 'Add Task', path: '/tasks' },
    { icon: Clock, label: 'Run Cron Job', path: '/cron' },
    { icon: Brain, label: 'View Memory', path: '/memory' },
  ];

  return (
    <div className="grid grid-cols-2 gap-2">
      {actions.map((action) => {
        const Icon = action.icon;
        return (
          <Button key={action.label} variant="outline" className="h-auto py-3">
            <Icon className="mr-2 h-4 w-4" />
            <span className="text-sm">{action.label}</span>
          </Button>
        );
      })}
    </div>
  );
};

/**
 * Active Tasks Widget
 */
const ActiveTasksWidget = () => {
  const tasks = [
    { id: '1', title: 'Build dashboard layout', progress: 75, status: 'in_progress' },
    { id: '2', title: 'Create session management', progress: 30, status: 'in_progress' },
    { id: '3', title: 'Set up cron job UI', progress: 0, status: 'pending' },
  ];

  return (
    <div className="space-y-3">
      {tasks.map((task) => (
        <div key={task.id} className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="font-medium">{task.title}</span>
            <span className="text-muted-foreground">{task.progress}%</span>
          </div>
          <div className="h-2 w-full rounded-full bg-accent">
            <div
              className={cn(
                'h-full rounded-full transition-all',
                task.status === 'in_progress' ? 'bg-primary' : 'bg-muted'
              )}
              style={{ width: `${task.progress}%` }}
            />
          </div>
        </div>
      ))}
    </div>
  );
};

/**
 * System Status Widget
 */
const SystemStatusWidget = () => {
  const status = [
    { label: 'Gateway', value: 'Online', isHealthy: true },
    { label: 'GitHub', value: 'Connected', isHealthy: true },
    { label: 'Telegram', value: 'Active', isHealthy: true },
    { label: 'Credits', value: '85%', isHealthy: true },
  ];

  return (
    <div className="space-y-2">
      {status.map((item) => (
        <div key={item.label} className="flex items-center justify-between">
          <span className="text-sm text-muted-foreground">{item.label}</span>
          <div className="flex items-center gap-2">
            {item.isHealthy ? (
              <CheckCircle className="h-4 w-4 text-green-500" />
            ) : (
              <AlertTriangle className="h-4 w-4 text-red-500" />
            )}
            <span className="text-sm font-medium">{item.value}</span>
          </div>
        </div>
      ))}
    </div>
  );
};

/**
 * Dashboard Overview Page Component
 */
export const Dashboard = () => {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [activities, setActivities] = useState<ActivityEvent[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Simulate data fetch - in production, call actual API
  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        // Mock data - in production, fetch from API
        const mockStats: DashboardStats = {
          activeSessions: 1,
          activeTasks: 2,
          completedTasksToday: 5,
          scheduledJobs: 2,
          memoryEntries: 247,
          githubRepo: 'gmdeo/joyful-testing-ground',
          gatewayStatus: 'online',
          creditsRemaining: 85,
          tokenUsage: 124567,
        };

        const mockActivities: ActivityEvent[] = [
          {
            id: '1',
            type: 'git',
            title: 'Git Push',
            description: 'Pushed HERMES_WORKFLOW.md to main',
            timestamp: new Date(Date.now() - 5 * 60000),
            icon: 'GitBranch',
            color: 'text-blue-500',
          },
          {
            id: '2',
            type: 'session',
            title: 'Session Started',
            description: 'Started new session for dashboard development',
            timestamp: new Date(Date.now() - 15 * 60000),
            icon: 'MessageSquare',
            color: 'text-green-500',
          },
          {
            id: '3',
            type: 'task',
            title: 'Task Completed',
            description: 'Setup project structure and routing',
            timestamp: new Date(Date.now() - 30 * 60000),
            icon: 'CheckSquare',
            color: 'text-yellow-500',
          },
          {
            id: '4',
            type: 'cron',
            title: 'Cron Job Paused',
            description: 'Daily Product Builder paused for deployment',
            timestamp: new Date(Date.now() - 60 * 60000),
            icon: 'Clock',
            color: 'text-purple-500',
          },
          {
            id: '5',
            type: 'file',
            title: 'File Created',
            description: 'Created MainLayout.tsx with sidebar navigation',
            timestamp: new Date(Date.now() - 90 * 60000),
            icon: 'Activity',
            color: 'text-orange-500',
          },
        ];

        // Validate with Zod schemas (code-ninja pattern)
        const validatedStats = DashboardStatsSchema.parse(mockStats);
        const validatedActivities = ActivityEventSchema.array().parse(mockActivities);

        setStats(validatedStats);
        setActivities(validatedActivities);
      } catch (error) {
        console.error('Failed to fetch dashboard data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  if (isLoading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="text-muted-foreground">Loading dashboard...</div>
      </div>
    );
  }

  if (!stats) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="text-muted-foreground">Failed to load dashboard</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Dashboard</h2>
        <p className="text-muted-foreground">
          Welcome back! Here's what's happening with your Hermes Agent.
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Active Sessions"
          value={stats.activeSessions}
          icon={MessageSquare}
          trend={{ value: 0, isPositive: true }}
        />
        <StatCard
          title="Active Tasks"
          value={stats.activeTasks}
          icon={CheckSquare}
          trend={{ value: 25, isPositive: true }}
        />
        <StatCard
          title="Scheduled Jobs"
          value={stats.scheduledJobs}
          icon={Clock}
        />
        <StatCard
          title="Memory Entries"
          value={stats.memoryEntries}
          icon={Brain}
          trend={{ value: 5, isPositive: true }}
        />
      </div>

      {/* Main Content Grid */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Activity Timeline */}
        <Card className="col-span-2">
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
          </CardHeader>
          <CardContent>
            <ActivityTimeline activities={activities} />
          </CardContent>
        </Card>

        {/* Right Column */}
        <div className="space-y-6">
          {/* Quick Actions */}
          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
            </CardHeader>
            <CardContent>
              <QuickActions />
            </CardContent>
          </Card>

          {/* System Status */}
          <Card>
            <CardHeader>
              <CardTitle>System Status</CardTitle>
            </CardHeader>
            <CardContent>
              <SystemStatusWidget />
            </CardContent>
          </Card>

          {/* Active Tasks */}
          <Card>
            <CardHeader>
              <CardTitle>Active Tasks</CardTitle>
            </CardHeader>
            <CardContent>
              <ActiveTasksWidget />
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;