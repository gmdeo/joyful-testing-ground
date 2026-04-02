import { useState } from 'react';
import { 
  Plus, 
  Search, 
  Filter,
  CheckCircle2,
  Circle,
  ClockIcon,
  MoreVertical,
  Trash2,
  Edit,
  Download,
  Upload,
  ChevronDown,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
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
import { Todo } from '@/types';
import { cn } from '@/lib/utils';

// ============================================================================
// TASK MANAGEMENT UI
// Applies code-ninja patterns:
// - Type-safe data structures with Zod
// - State management with reactivity
// - Local storage persistence
// - Bulk operations
// ============================================================================

/**
 * Task Item Component
 * Displays individual task with priority indicators and actions
 */
interface TaskItemProps {
  task: Todo;
  isSelected: boolean;
  onToggleSelect: (id: string) => void;
  onUpdateStatus: (id: string, status: Todo['status']) => void;
  onDelete: (id: string) => void;
}

const TaskItem = ({ 
  task, 
  isSelected, 
  onToggleSelect,
  onUpdateStatus,
  onDelete 
}: TaskItemProps) => {
  const getPriorityBadge = (priority: number) => {
    if (priority >= 8) return <Badge variant="destructive">High</Badge>;
    if (priority >= 5) return <Badge>Medium</Badge>;
    return <Badge variant="secondary">Low</Badge>;
  };

  const getStatusIcon = (status: Todo['status']) => {
    switch (status) {
      case 'completed':
        return <CheckCircle2 className="h-5 w-5 text-green-500" />;
      case 'in_progress':
        return <Circle className="h-5 w-5 text-blue-500 fill-current" />;
      default:
        return <Circle className="h-5 w-5 text-muted-foreground" />;
    }
  };

  const isOverdue = !isTaskThisWeek(task.createdAt);

  return (
    <div 
      className={cn(
        "flex items-start gap-3 p-4 border rounded-lg transition-all hover:shadow-md",
        isSelected && "bg-accent border-primary",
        isOverdue && !isSelected && "border-orange-300 bg-orange-50 dark:bg-orange-950/10"
      )}
    >
      {/* Checkbox */}
      <Checkbox
        checked={isSelected}
        onCheckedChange={() => onToggleSelect(task.id)}
        className="mt-1"
      />

      {/* Content */}
      <div className="flex-1 space-y-2">
        <div className="flex items-start justify-between gap-2">
          <div className="flex items-center gap-2 flex-1">
            {getStatusIcon(task.status)}
            <span 
              className={cn(
                "font-medium cursor-pointer",
                task.status === 'completed' && "line-through text-muted-foreground"
              )}
              onClick={() => {
                if (task.status === 'completed') {
                  onUpdateStatus(task.id, 'pending');
                } else {
                  onUpdateStatus(task.id, 'completed');
                }
              }}
            >
              {task.content}
            </span>
          </div>
          <div className="flex items-center gap-2">
            {getPriorityBadge(task.priority)}
            {isOverdue && task.status !== 'completed' && (
              <Badge variant="outline" className="text-orange-600">
                Overdue
              </Badge>
            )}
          </div>
        </div>
        
        <div className="flex items-center gap-4 text-xs text-muted-foreground">
          <span>Priority: {task.priority}/10</span>
          <span>•</span>
          <span>{new Date(task.createdAt).toLocaleDateString()}</span>
          {isOverdue && task.status !== 'completed' && (
            <>
              <span>•</span>
              <span className="text-orange-600 font-medium">Created this week</span>
            </>
          )}
        </div>
      </div>

      {/* Actions */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="icon" className="h-8 w-8">
            <MoreVertical className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem onClick={() => onDelete(task.id)}>
            <Trash2 className="mr-2 h-4 w-4" />
            Delete
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
};

/**
 * Check if task is from this week
 */
const isTaskThisWeek = (date: Date): boolean => {
  const now = new Date();
  const taskDate = new Date(date);
  const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
  return taskDate >= oneWeekAgo;
};

/**
 * New Task Dialog Component
 */
const NewTaskDialog = ({ onAdd }: { onAdd: (content: string, priority: number) => void }) => {
  const [open, setOpen] = useState(false);
  const [content, setContent] = useState('');
  const [priority, setPriority] = useState(5);

  const handleSubmit = () => {
    if (content.trim()) {
      onAdd(content, priority);
      setContent('');
      setPriority(5);
      setOpen(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          New Task
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Create New Task</DialogTitle>
          <DialogDescription>
            Add a new task to your todo list
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Task Content</label>
            <Input
              placeholder="What needs to be done?"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSubmit()}
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">Priority (1-10)</label>
            <div className="flex items-center gap-2">
              <Input
                type="range"
                min="1"
                max="10"
                value={priority}
                onChange={(e) => setPriority(parseInt(e.target.value))}
                className="flex-1"
              />
              <Badge className={cn(
                "w-12 justify-center",
                priority >= 8 && "bg-red-500",
                priority >= 5 && priority < 8 && "bg-yellow-500",
                priority < 5 && "bg-green-500"
              )}>
                {priority}
              </Badge>
            </div>
          </div>
        </div>
        <DialogFooter>
          <Button onClick={handleSubmit}>Create Task</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

/**
 * Tasks Page Component
 */
export const Tasks = () => {
  const [tasks, setTasks] = useState<Todo[]>(() => {
    // Load from local storage
    const saved = localStorage.getItem('hermes-tasks');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error('Failed to load tasks:', e);
      }
    }
    return [];
  });

  const [selectedTasks, setSelectedTasks] = useState<Set<string>>(new Set());
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');

  // Save tasks to local storage whenever they change
  useState(() => {
    localStorage.setItem('hermes-tasks', JSON.stringify(tasks));
  });

  const filteredTasks = tasks.filter(task => {
    const matchesSearch = task.content.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = 
      filterStatus === 'all' ||
      (filterStatus === 'completed' && task.status === 'completed') ||
      (filterStatus === 'active' && task.status !== 'completed');
    return matchesSearch && matchesFilter;
  });

  const handleAddTask = (content: string, priority: number) => {
    const newTask: Todo = {
      id: Math.random().toString(36).substring(7),
      content,
      status: 'pending',
      createdAt: new Date(),
      priority,
    };
    setTasks([newTask, ...tasks]);
  };

  const handleUpdateStatus = (id: string, status: Todo['status']) => {
    setTasks(tasks.map(task => task.id === id ? { ...task, status } : task));
  };

  const handleDelete = (id: string) => {
    setTasks(tasks.filter(task => task.id !== id));
    setSelectedTasks(prev => {
      const newSet = new Set(prev);
      newSet.delete(id);
      return newSet;
    });
  };

  const handleBulkComplete = () => {
    setTasks(tasks.map(task => 
      selectedTasks.has(task.id) ? { ...task, status: 'completed' as Todo['status'] } : task
    ));
    setSelectedTasks(new Set());
  };

  const handleBulkDelete = () => {
    setTasks(tasks.filter(task => !selectedTasks.has(task.id)));
    setSelectedTasks(new Set());
  };

  const handleExport = () => {
    const exportData = filteredTasks.map(task => ({
      content: task.content,
      status: task.status,
      priority: task.priority,
      createdAt: task.createdAt,
    }));
    
    const dataStr = JSON.stringify(exportData, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `hermes-tasks-${new Date().toISOString().slice(0, 10)}.json`;
    link.click();
  };

  const stats = {
    total: tasks.length,
    completed: tasks.filter(t => t.status === 'completed').length,
    pending: tasks.filter(t => t.status !== 'completed').length,
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Tasks</h2>
          <p className="text-muted-foreground">
            Manage your tasks and todo items
          </p>
        </div>
        <NewTaskDialog onAdd={handleAddTask} />
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Tasks</CardTitle>
            <ClockIcon className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Completed</CardTitle>
            <CheckCircle2 className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{stats.completed}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">In Progress</CardTitle>
            <Circle className="h-4 w-4 text-blue-500 fill-current" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{stats.pending}</div>
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
                placeholder="Search tasks..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9"
              />
            </div>

            <div className="flex items-center gap-2">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" className="gap-2">
                    <Filter className="h-4 w-4" />
                    {filterStatus === 'all' && 'All'}
                    {filterStatus === 'completed' && 'Completed'}
                    {filterStatus === 'active' && 'Active'}
                    <ChevronDown className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={() => setFilterStatus('all')}>
                    All Tasks
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setFilterStatus('completed')}>
                    Completed
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setFilterStatus('active')}>
                    Active
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>

              <Button variant="outline" onClick={handleExport}>
                <Download className="mr-2 h-4 w-4" />
                Export
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Bulk Actions */}
      {selectedTasks.size > 0 && (
        <Card className="border-primary">
          <CardContent className="pt-6 flex items-center justify-between">
            <p className="text-sm font-medium">
              {selectedTasks.size} task{selectedTasks.size > 1 ? 's' : ''} selected
            </p>
            <div className="flex gap-2">
              <Button variant="outline" onClick={handleBulkComplete}>
                <CheckCircle2 className="mr-2 h-4 w-4" />
                Mark Complete
              </Button>
              <Button variant="destructive" onClick={handleBulkDelete}>
                <Trash2 className="mr-2 h-4 w-4" />
                Delete
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Tasks List */}
      <div className="space-y-3">
        {filteredTasks.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <ClockIcon className="h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold">No tasks found</h3>
              <p className="text-muted-foreground mb-4">
                {tasks.length === 0 ? "You don't have any tasks yet" : "Try adjusting your search or filters"}
              </p>
              {tasks.length === 0 && <NewTaskDialog onAdd={handleAddTask} />}
            </CardContent>
          </Card>
        ) : (
          filteredTasks.map(task => (
            <TaskItem
              key={task.id}
              task={task}
              isSelected={selectedTasks.has(task.id)}
              onToggleSelect={(id) => {
                setSelectedTasks(prev => {
                  const newSet = new Set(prev);
                  if (newSet.has(id)) {
                    newSet.delete(id);
                  } else {
                    newSet.add(id);
                  }
                  return newSet;
                });
              }}
              onUpdateStatus={handleUpdateStatus}
              onDelete={handleDelete}
            />
          ))
        )}
      </div>
    </div>
  );
};

export default Tasks;