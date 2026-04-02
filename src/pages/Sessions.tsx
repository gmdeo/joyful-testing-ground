import { useState } from 'react';
import { 
  MessageSquare, 
  Search,
  Filter,
  MoreVertical,
  Calendar,
  Hash,
  Clock
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Session } from '@/types';
import { cn } from '@/lib/utils';

// ============================================================================
// SESSIONS MANAGEMENT PAGE
// Applies code-ninja patterns:
// - Type-safe data structures with Zod
// - State management for filtering
// - Reusable component patterns
// ============================================================================

/**
 * Session Card Component
 * Displays individual session with actions
 */
const SessionCard = ({ session }: { session: Session }) => {
  return (
    <Card className="transition-all hover:shadow-md">
      <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-3">
        <div className="space-y-1">
          <CardTitle className="text-base">{session.sessionId.slice(0, 8)}...</CardTitle>
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <Clock className="h-3 w-3" />
            {new Date(session.startedAt).toLocaleString()}
          </div>
        </div>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="h-8 w-8">
              <MoreVertical className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem>View Details</DropdownMenuItem>
            <DropdownMenuItem>Restore Session</DropdownMenuItem>
            <DropdownMenuItem className="text-red-600">Delete</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {/* Session Metadata */}
          <div className="grid grid-cols-2 gap-2 text-sm">
            <div className="flex items-center gap-1 text-muted-foreground">
              <Hash className="h-3 w-3" />
              <span>Model:</span>
            </div>
            <div className="font-medium">{session.model}</div>
            <div className="flex items-center gap-1 text-muted-foreground">
              <Calendar className="h-3 w-3" />
              <span>Provider:</span>
            </div>
            <div className="font-medium">{session.provider}</div>
          </div>

          {/* Stats */}
          <div className="flex items-center justify-between">
            <div className="flex gap-2 text-xs text-muted-foreground">
              <span>{session.tokenUsage.toLocaleString()} tokens</span>
              <span>•</span>
              <span>{session.messageCount} messages</span>
            </div>
            <Badge variant={session.isActive ? 'default' : 'secondary'}>
              {session.isActive ? 'Active' : 'Inactive'}
            </Badge>
          </div>

          {/* Preview */}
          <p className="line-clamp-2 text-sm text-muted-foreground">
            {session.preview}
          </p>
        </div>
      </CardContent>
    </Card>
  );
};

/**
 * Sessions Page Component
 */
export const Sessions = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [showFilters, setShowFilters] = useState(false);

  // Mock data - in production, fetch from API
  const sessions: Session[] = [
    {
      sessionId: 'session-' + Math.random().toString(36).substring(7),
      model: 'glm-4.7',
      provider: 'venice.ai',
      startedAt: new Date(Date.now() - 30 * 60000),
      isActive: true,
      tokenUsage: 12456,
      messageCount: 42,
      tags: ['dashboard', 'coding'],
      preview: 'Building Hermes dashboard with code-ninja patterns for production-grade autonomous coding agent management system...',
    },
    {
      sessionId: 'session-' + Math.random().toString(36).substring(7),
      model: 'glm-4.7',
      provider: 'venice.ai',
      startedAt: new Date(Date.now() - 2 * 60 * 60000),
      isActive: false,
      tokenUsage: 34521,
      messageCount: 156,
      tags: ['research', 'product-builder'],
      preview: 'Researching market trends and arXiv papers for autonomous product building system with daily scheduled cron jobs...',
    },
    {
      sessionId: 'session-' + Math.random().toString(36).substring(7),
      model: 'glm-4.7',
      provider: 'venice.ai',
      startedAt: new Date(Date.now() - 24 * 60 * 60000),
      isActive: false,
      tokenUsage: 89123,
      messageCount: 423,
      tags: ['telegram', 'integration'],
      preview: 'Setting up Telegram bot integration with Hermes gateway service for daily research delivery and notification management...',
    },
    {
      sessionId: 'session-' + Math.random().toString(36).substring(7),
      model: 'glm-4.7',
      provider: 'venice.ai',
      startedAt: new Date(Date.now() - 48 * 60 * 60000),
      isActive: false,
      tokenUsage: 56789,
      messageCount: 234,
      tags: ['github', 'deployment'],
      preview: 'Connected joyful-testing-ground repository to Lovable for Git-based development flow with automatic sync to platform...',
    },
  ];

  // Filter sessions based on search term
  const filteredSessions = sessions.filter(session =>
    session.preview.toLowerCase().includes(searchTerm.toLowerCase()) ||
    session.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Sessions</h2>
          <p className="text-muted-foreground">
            Manage and browse conversation sessions
          </p>
        </div>
        <Button>
          <MessageSquare className="mr-2 h-4 w-4" />
          New Session
        </Button>
      </div>

      {/* Search and Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            {/* Search */}
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search sessions by topic or tags..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9"
              />
            </div>

            {/* Filter Toggle */}
            <Button
              variant="outline"
              onClick={() => setShowFilters(!showFilters)}
              className={cn(showFilters && 'bg-accent')}
            >
              <Filter className="mr-2 h-4 w-4" />
              Filters
            </Button>
          </div>

          {/* Filter Options (shown when toggled) */}
          {showFilters && (
            <div className="mt-4 flex flex-wrap gap-2">
              <Badge variant="outline" className="cursor-pointer hover:bg-accent">
                Active
              </Badge>
              <Badge variant="outline" className="cursor-pointer hover:bg-accent">
                Coding
              </Badge>
              <Badge variant="outline" className="cursor-pointer hover:bg-accent">
                Research
              </Badge>
              <Badge variant="outline" className="cursor-pointer hover:bg-accent">
                Integration
              </Badge>
              <Badge variant="outline" className="cursor-pointer hover:bg-accent">
                Last 24 hours
              </Badge>
              <Badge variant="outline" className="cursor-pointer hover:bg-accent">
                Last 7 days
              </Badge>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Sessions Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {filteredSessions.map((session) => (
          <SessionCard key={session.sessionId} session={session} />
        ))}
      </div>

      {/* Empty State */}
      {filteredSessions.length === 0 && (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <MessageSquare className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold">No sessions found</h3>
            <p className="text-muted-foreground mb-4">
              Try adjusting your search or filters
            </p>
            <Button>Start New Session</Button>
          </CardContent>
        </Card>
      )}

      {/* Load More */}
      {filteredSessions.length > 0 && (
        <div className="flex justify-center">
          <Button variant="outline">Load More Sessions</Button>
        </div>
      )}
    </div>
  );
};

export default Sessions;