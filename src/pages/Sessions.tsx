import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  MessageSquare, 
  Search,
  Filter,
  MoreVertical,
  Calendar,
  Hash,
  Clock,
  Loader2,
  RefreshCw,
  AlertCircle
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
import { bridgeApi } from '@/lib/api';
import { useToast } from '@/hooks/use-toast';

const SessionCard = ({ session, onDelete }: { session: Session; onDelete: (id: string) => void }) => {
  return (
    <Card className="transition-all hover:shadow-md">
      <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-3">
        <div className="space-y-1">
          <CardTitle className="text-base">{session.sessionId.slice(0, 12)}...</CardTitle>
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
            <DropdownMenuItem 
              className="text-red-600"
              onClick={() => onDelete(session.sessionId)}
            >
              Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
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

          <p className="line-clamp-2 text-sm text-muted-foreground">
            {session.preview}
          </p>
        </div>
      </CardContent>
    </Card>
  );
};

export const Sessions = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [sessions, setSessions] = useState<Session[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [creating, setCreating] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  const fetchSessions = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await bridgeApi.getSessions();
      // Map bridge response to Session type
      const mapped: Session[] = (Array.isArray(data) ? data : []).map((s: any) => ({
        sessionId: s.session_id || s.sessionId || s.id || 'unknown',
        model: s.model || 'glm-4.7',
        provider: s.provider || 'venice.ai',
        startedAt: new Date(s.started_at || s.startedAt || s.created_at || Date.now()),
        isActive: s.is_active ?? s.isActive ?? s.status === 'active',
        tokenUsage: s.token_usage ?? s.tokenUsage ?? 0,
        messageCount: s.message_count ?? s.messageCount ?? 0,
        tags: s.tags || [],
        preview: s.preview || s.description || s.name || 'No preview available',
      }));
      setSessions(mapped);
    } catch (err) {
      console.error('Failed to fetch sessions:', err);
      setError('Failed to load sessions from bridge. Is your local bridge running?');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSessions();
  }, []);

  const handleNewSession = () => {
    navigate('/chat');
  };

  const handleDelete = async (id: string) => {
    try {
      await bridgeApi.deleteSession(id);
      toast({ title: 'Session deleted' });
      fetchSessions();
    } catch (err) {
      toast({
        title: 'Error',
        description: 'Could not delete session.',
        variant: 'destructive',
      });
    }
  };

  const filteredSessions = sessions.filter(session =>
    session.preview.toLowerCase().includes(searchTerm.toLowerCase()) ||
    session.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase())) ||
    session.sessionId.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Sessions</h2>
          <p className="text-muted-foreground">
            Manage and browse conversation sessions
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="icon" onClick={fetchSessions} disabled={loading}>
            <RefreshCw className={cn("h-4 w-4", loading && "animate-spin")} />
          </Button>
          <Button onClick={handleNewSession} disabled={creating}>
            {creating ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <MessageSquare className="mr-2 h-4 w-4" />
            )}
            New Session
          </Button>
        </div>
      </div>

      {/* Error Banner */}
      {error && (
        <Card className="border-destructive">
          <CardContent className="flex items-center gap-3 py-4">
            <AlertCircle className="h-5 w-5 text-destructive" />
            <p className="text-sm text-destructive">{error}</p>
            <Button variant="outline" size="sm" className="ml-auto" onClick={fetchSessions}>
              Retry
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Search and Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search sessions by topic or tags..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9"
              />
            </div>
            <Button
              variant="outline"
              onClick={() => setShowFilters(!showFilters)}
              className={cn(showFilters && 'bg-accent')}
            >
              <Filter className="mr-2 h-4 w-4" />
              Filters
            </Button>
          </div>

          {showFilters && (
            <div className="mt-4 flex flex-wrap gap-2">
              <Badge variant="outline" className="cursor-pointer hover:bg-accent">Active</Badge>
              <Badge variant="outline" className="cursor-pointer hover:bg-accent">Coding</Badge>
              <Badge variant="outline" className="cursor-pointer hover:bg-accent">Research</Badge>
              <Badge variant="outline" className="cursor-pointer hover:bg-accent">Integration</Badge>
              <Badge variant="outline" className="cursor-pointer hover:bg-accent">Last 24 hours</Badge>
              <Badge variant="outline" className="cursor-pointer hover:bg-accent">Last 7 days</Badge>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Loading State */}
      {loading && (
        <div className="flex justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      )}

      {/* Sessions Grid */}
      {!loading && filteredSessions.length > 0 && (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {filteredSessions.map((session) => (
            <SessionCard key={session.sessionId} session={session} onDelete={handleDelete} />
          ))}
        </div>
      )}

      {/* Empty State */}
      {!loading && filteredSessions.length === 0 && !error && (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <MessageSquare className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold">No sessions found</h3>
            <p className="text-muted-foreground mb-4">
              {searchTerm ? 'Try adjusting your search or filters' : 'Start a new session to get going'}
            </p>
            <Button onClick={handleNewSession}>Start New Session</Button>
          </CardContent>
        </Card>
      )}

      {!loading && filteredSessions.length > 0 && (
        <div className="flex justify-center">
          <Button variant="outline">Load More Sessions</Button>
        </div>
      )}
    </div>
  );
};

export default Sessions;
