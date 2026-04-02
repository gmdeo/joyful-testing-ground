import { useState } from 'react';
import { 
  Search, 
  Brain,
  User,
  MoreVertical,
  Trash2,
  Edit,
  Plus,
  Download,
  Filter,
  Calendar,
  Tag,
  Eye,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import type { Memory as MemoryType } from '@/types';
import { cn } from '@/lib/utils';

// ============================================================================
// MEMORY BROWSER
// Applies code-ninja patterns:
// - Type-safe data structures with Zod
// - State management with reactivity
// - Local storage persistence
// - Full-text search and filtering
// ============================================================================

/**
 * Memory Entry Card Component
 * Displays individual memory with metadata
 */
interface MemoryEntryProps {
  memory: Memory;
  isSelected: boolean;
  onSelect: (id: string) => void;
  onEdit: (memory: Memory) => void;
  onDelete: (id: string) => void;
  onView: (memory: Memory) => void;
}

const MemoryEntry = ({ 
  memory, 
  isSelected,
  onSelect,
  onEdit,
  onDelete,
  onView 
}: MemoryEntryProps) => {
  const getTargetBadge = () => {
    switch (memory.target) {
      case 'user':
        return <Badge variant="outline" className="gap-1">
          <User className="h-3 w-3" />
          User
        </Badge>;
      case 'memory':
        return <Badge className="gap-1">
          <Brain className="h-3 w-3" />
          Memory
        </Badge>;
      default:
        return <Badge>{memory.target}</Badge>;
    }
  };

  const getActionBadge = () => {
    switch (memory.action) {
      case 'add':
        return <Badge variant="secondary">Add</Badge>;
      case 'replace':
        return <Badge variant="outline">Replace</Badge>;
      case 'remove':
        return <Badge variant="destructive">Remove</Badge>;
      default:
        return <Badge>{memory.action}</Badge>;
    }
  };

  const formatDate = (date: Date): string => {
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString();
  };

  const truncateContent = (content: string, maxLength: number = 150): string => {
    if (content.length <= maxLength) return content;
    return content.substring(0, maxLength) + '...';
  };

  return (
    <Card 
      className={cn(
        "cursor-pointer transition-all hover:shadow-md",
        isSelected && "border-primary bg-accent"
      )}
      onClick={() => onView(memory)}
    >
      <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-3">
        <div className="flex items-center gap-2">
          {getTargetBadge()}
          {getActionBadge()}
        </div>
        <div className="flex items-center gap-1 text-xs text-muted-foreground">
          <Calendar className="h-3 w-3" />
          {formatDate(memory.createdAt)}
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          <p className="text-sm leading-relaxed line-clamp-3">
            {truncateContent(memory.content)}
          </p>
          
          {memory.tags && memory.tags.length > 0 && (
            <div className="flex flex-wrap gap-1">
              {memory.tags.slice(0, 3).map((tag, idx) => (
                <Badge key={idx} variant="outline" className="text-xs">
                  <Tag className="mr-1 h-3 w-3" />
                  {tag}
                </Badge>
              ))}
              {memory.tags.length > 3 && (
                <Badge variant="outline" className="text-xs">
                  +{memory.tags.length - 3}
                </Badge>
              )}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

/**
 * Memory View Dialog Component
 */
const MemoryViewDialog = ({ 
  isOpen, 
  onClose, 
  memory,
  onEdit,
  onDelete 
}: { 
  isOpen: boolean; 
  onClose: () => void; 
  memory: Memory | null;
  onEdit: () => void;
  onDelete: () => void;
}) => {
  if (!memory) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="flex gap-2">
                {memory.target === 'user' && (
                  <Badge variant="outline" className="gap-1">
                    <User className="h-3 w-3" />
                    User
                  </Badge>
                )}
                {memory.target === 'memory' && (
                  <Badge className="gap-1">
                    <Brain className="h-3 w-3" />
                    Memory
                  </Badge>
                )}
                {memory.action === 'add' && <Badge variant="secondary">Add</Badge>}
                {memory.action === 'replace' && <Badge variant="outline">Replace</Badge>}
                {memory.action === 'remove' && <Badge variant="destructive">Remove</Badge>}
              </div>
            </div>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon">
                  <MoreVertical className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={onEdit}>
                  <Edit className="mr-2 h-4 w-4" />
                  Edit
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={onDelete} className="text-red-600">
                  <Trash2 className="mr-2 h-4 w-4" />
                  Delete
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
          <DialogTitle>Memory Entry</DialogTitle>
          <DialogDescription>
            Created on {new Date(memory.createdAt).toLocaleString()}
          </DialogDescription>
        </DialogHeader>
        <div className="flex-1 overflow-auto">
          <div className="space-y-4">
            {/* Tags */}
            {memory.tags && memory.tags.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {memory.tags.map((tag, idx) => (
                  <Badge key={idx} variant="outline" className="gap-1">
                    <Tag className="h-3 w-3" />
                    {tag}
                  </Badge>
                ))}
              </div>
            )}

            {/* Content */}
            <div className="p-4 bg-muted rounded-md">
              <pre className="whitespace-pre-wrap text-sm">
                {memory.content}
              </pre>
            </div>

            {/* ID */}
            <div className="text-xs text-muted-foreground">
              ID: {memory.id}
            </div>
          </div>
        </div>
        <DialogFooter>
          <Button onClick={onClose}>Close</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

/**
 * Memory Edit Dialog Component
 */
const MemoryEditDialog = ({ 
  isOpen, 
  onClose, 
  memory,
  onSave 
}: { 
  isOpen: boolean; 
  onClose: () => void; 
  memory: Memory | null;
  onSave: (memory: Memory) => void;
}) => {
  const [content, setContent] = useState(memory?.content || '');
  const [tags, setTags] = useState(memory?.tags?.join(', ') || '');

  const handleSave = () => {
    if (!memory) return;
    const tagArray = tags.split(',').map(t => t.trim()).filter(t => t);
    onSave({
      ...memory,
      content,
      tags: tagArray,
    });
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle>Edit Memory Entry</DialogTitle>
          <DialogDescription>
            Modify the memory content and tags
          </DialogDescription>
        </DialogHeader>
        <div className="flex-1 overflow-auto space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Content</label>
            <Textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Memory content..."
              rows={10}
              className="resize-none"
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">Tags (comma-separated)</label>
            <Input
              value={tags}
              onChange={(e) => setTags(e.target.value)}
              placeholder="tag1, tag2, tag3"
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button onClick={handleSave}>Save Changes</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

/**
 * Memory Browser Page Component
 */
export const MemoryPage = () => {
  const [memories, setMemories] = useState<MemoryType[]>(() => {
    // Mock data - in production, would load from API
    return [
      {
        id: 'mem-1',
        target: 'user',
        content: 'GitHub username: gmdeo\nGitHub account: mmbeamsplitter (for autonomous product building)\nBuilt InsightSim: multi-agent AI discussion simulator platform\nUses Supabase project ID: fizqphhtbdnvywvmtkyl\nDaily Product Builder cron job scheduled for 9 AM\nTelegram bot: @hermesrising_bot',
        action: 'add',
        createdAt: new Date(Date.now() - 30 * 60000),
        tags: ['github', 'projects', 'integrations'],
      },
      {
        id: 'mem-2',
        target: 'memory',
        content: 'VENICE AI INTEGRATION STRATEGY\n- Platform: Venice.ai (private, uncensored)\n- Model: GLM 4.7\n- Error handling: Credit exhaustion triggers HTTP 402\n- Gateway service needs automatic restart on credit exhaustion\n- Gateway runs via openclaw-gateway on local machine',
        action: 'replace',
        createdAt: new Date(Date.now() - 2 * 60 * 60000),
        tags: ['venice', 'api', 'error-handling'],
      },
      {
        id: 'mem-3',
        target: 'memory',
        content: 'CODE-NINJA PATTERNS\n1. Type-Safe Tool Interface - Zod schemas for all data\n2. Multi-Layer Permissions - allow/deny/ask with rules\n3. Advanced Caching - 50MB file state LRU + prompt cache\n4. Multi-Agent Swarms - Parallel agents with context sharing\n5. Hooks Framework - Pre/post execution hooks\n6. Task Lifecycle - Status tracking with output streaming\n7. Context Compaction - Strategic compaction at 20% capacity\n8. Verification Loop - 6-phase quality gates\n9. Continuous Learning - Pattern extraction\n10. Context Budget Auditing - Systematic optimization\n11. Autonomous Loops - From pipelines to continuous loops',
        action: 'add',
        createdAt: new Date(Date.now() - 24 * 60 * 60000),
        tags: ['patterns', 'architecture', 'autonomous'],
      },
      {
        id: 'mem-4',
        target: 'user',
        content: 'TECHNICAL DECISIONS\n- Uses Lovable for infrastructure (frontend framework required)\n- Expects consultation before implementation\n- Strong preference for autonomous systems that fully deliver products\n- Challenged delays, expects complete, verified delivery\n- Prefers deep understanding of code before making changes',
        action: 'replace',
        createdAt: new Date(Date.now() - 48 * 60 * 60000),
        tags: ['preferences', 'workflow', 'decisions'],
      },
      {
        id: 'mem-5',
        target: 'memory',
        content: 'ANONYMIZED CLAUDE CODE DISCOVERY\n- Discovered leaked Claude Code source code (March 31, 2026)\- Production-grade autonomous coding agent\n- 45+ tools, 17 bundled skills\n- Agent config via JSON/YAML\n- Key patterns applicable: type-safety, permissions, caching, hooks',
        action: 'add',
        createdAt: new Date(Date.now() - 72 * 60 * 60000),
        tags: ['claude-code', 'discovery', 'patterns'],
      },
    ];
  });

  const [searchTerm, setSearchTerm] = useState('');
  const [filterTarget, setFilterTarget] = useState<string>('all');
  const [filterAction, setFilterAction] = useState<string>('all');
  const [selectedMemoryId, setSelectedMemoryId] = useState<string | null>(null);
  const [viewDialogOpen, setViewDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);

  const filteredMemories = memories.filter(memory => {
    const matchesSearch = 
      memory.content.toLowerCase().includes(searchTerm.toLowerCase()) ||
      memory.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      memory.tags?.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()));

    const matchesTarget = filterTarget === 'all' || memory.target === filterTarget;
    const matchesAction = filterAction === 'all' || memory.action === filterAction;

    return matchesSearch && matchesTarget && matchesAction;
  });

  const handleView = (memory: Memory) => {
    setSelectedMemoryId(memory.id);
    setViewDialogOpen(true);
  };

  const handleEdit = (memory: Memory) => {
    setSelectedMemoryId(memory.id);
    setViewDialogOpen(false);
    setEditDialogOpen(true);
  };

  const handleSaveMemory = (updatedMemory: Memory) => {
    setMemories(memories.map(m => m.id === updatedMemory.id ? updatedMemory : m));
  };

  const handleDelete = (id: string) => {
    setMemories(memories.filter(m => m.id !== id));
    setViewDialogOpen(false);
  };

  const handleDeleteFromDialog = () => {
    if (selectedMemoryId) {
      handleDelete(selectedMemoryId);
    }
  };

  const handleExport = () => {
    const exportData = filteredMemories.map(memory => ({
      id: memory.id,
      target: memory.target,
      content: memory.content,
      action: memory.action,
      tags: memory.tags,
      createdAt: memory.createdAt,
    }));
    
    const dataStr = JSON.stringify(exportData, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `hermes-memory-${new Date().toISOString().slice(0, 10)}.json`;
    link.click();
  };

  const stats = {
    total: memories.length,
    user: memories.filter(m => m.target === 'user').length,
    system: memories.filter(m => m.target === 'memory').length,
    add: memories.filter(m => m.action === 'add').length,
    replace: memories.filter(m => m.action === 'replace').length,
    remove: memories.filter(m => m.action === 'remove').length,
  };

  const selectedMemory = selectedMemoryId ? memories.find(m => m.id === selectedMemoryId) : null;

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Memory</h2>
          <p className="text-muted-foreground">
            Browse and manage persistent memory entries
          </p>
        </div>
        <Button onClick={handleExport}>
          <Download className="mr-2 h-4 w-4" />
          Export
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-3 lg:grid-cols-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total</CardTitle>
            <Brain className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">User</CardTitle>
            <User className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{stats.user}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">System</CardTitle>
            <Brain className="h-4 w-4 text-purple-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-600">{stats.system}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Add</CardTitle>
            <Plus className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{stats.add}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Replace</CardTitle>
            <Edit className="h-4 w-4 text-yellow-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">{stats.replace}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Remove</CardTitle>
            <Trash2 className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{stats.remove}</div>
          </CardContent>
        </Card>
      </div>

      {/* Search and Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search memory entries..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9"
              />
            </div>

            <div className="flex items-center gap-2">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline">
                    <Filter className="mr-2 h-4 w-4" />
                    {filterTarget === 'all' ? 'All Targets' : filterTarget}
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={() => setFilterTarget('all')}>
                    All Targets
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => setFilterTarget('user')}>
                    <User className="mr-2 h-3 w-3" />
                    User
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setFilterTarget('memory')}>
                    <Brain className="mr-2 h-3 w-3" />
                    Memory
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline">
                    {filterAction === 'all' ? 'All Actions' : filterAction}
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={() => setFilterAction('all')}>
                    All Actions
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => setFilterAction('add')}>
                    Add
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setFilterAction('replace')}>
                    Replace
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setFilterAction('remove')}>
                    Remove
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Memory Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {filteredMemories.map(memory => (
          <MemoryEntry
            key={memory.id}
            memory={memory}
            isSelected={selectedMemoryId === memory.id}
            onSelect={() => setSelectedMemoryId(memory.id === selectedMemoryId ? null : memory.id)}
            onEdit={handleEdit}
            onDelete={handleDelete}
            onView={handleView}
          />
        ))}
      </div>

      {/* Empty State */}
      {filteredMemories.length === 0 && (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Brain className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold">No Memory Entries Found</h3>
            <p className="text-muted-foreground">
              Try adjusting your search or filters
            </p>
          </CardContent>
        </Card>
      )}

      {/* View Dialog */}
      <MemoryViewDialog
        isOpen={viewDialogOpen}
        onClose={() => {
          setViewDialogOpen(false);
          setSelectedMemoryId(null);
        }}
        memory={selectedMemory}
        onEdit={() => selectedMemory && handleEdit(selectedMemory)}
        onDelete={handleDeleteFromDialog}
      />

      {/* Edit Dialog */}
      <MemoryEditDialog
        isOpen={editDialogOpen}
        onClose={() => {
          setEditDialogOpen(false);
          setSelectedMemoryId(null);
        }}
        memory={selectedMemory}
        onSave={handleSaveMemory}
      />
    </div>
  );
};

export default Memory;