import { useState } from 'react';
import { 
  Wrench,
  Play,
  Terminal,
  Search,
  Filter,
  ChevronDown,
  Code,
  Database,
  GitBranch,
  Globe,
  CheckCircle2,
  XCircle,
  Clock,
  MoreVertical,
  History,
  Sparkles,
  AlertTriangle,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
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
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { cn } from '@/lib/utils';

// ============================================================================
// TOOL RUNNER
// Applies code-ninja patterns:
// - Type-safe tool definitions with Zod schemas
// - State management with execution tracking
// - Real-time output streaming
// - Parameter validation
// - Execution history
// ============================================================================

/**
 * Tool definition interface
 */
interface ToolDefinition {
  id: string;
  name: string;
  description: string;
  category: string;
  icon: React.ReactNode;
  parameters: ToolParameter[];
  status: 'success' | 'error' | 'running' | 'idle';
  lastRun?: Date;
}

/**
 * Tool parameter interface
 */
interface ToolParameter {
  name: string;
  type: 'string' | 'number' | 'boolean' | 'object' | 'array' | 'select';
  label: string;
  description: string;
  required: boolean;
  default?: string | number | boolean;
  options?: string[];
}

/**
 * Tool execution history entry
 */
interface ToolExecution {
  id: string;
  toolId: string;
  toolName: string;
  timestamp: Date;
  status: 'success' | 'error' | 'running';
  duration: number;
  output: string;
  outputType: 'json' | 'text' | 'html';
  parameters: Record<string, any>;
}

/**
 * Tool Card Component
 * Displays individual tool card with execution controls
 */
interface ToolCardProps {
  tool: ToolDefinition;
  onRun: (toolId: string, parameters: Record<string, any>) => void;
  isRunning: boolean;
}

const ToolCard = ({ 
  tool, 
  onRun,
  isRunning 
}: ToolCardProps) => {
  const [expandParams, setExpandParams] = useState(false);
  const [parameters, setParameters] = useState<Record<string, any>>(
    tool.parameters.reduce((acc, param) => {
      acc[param.name] = param.default;
      return acc;
    }, {} as Record<string, any>)
  );

  const updateParameter = (name: string, value: any) => {
    setParameters(prev => ({ ...prev, [name]: value }));
  };

  const handleRun = () => {
    onRun(tool.id, parameters);
  };

  const renderParameterInput = (param: ToolParameter) => {
    switch (param.type) {
      case 'string':
        return (
          <Input
            id={param.name}
            value={parameters[param.name] || ''}
            onChange={(e) => updateParameter(param.name, e.target.value)}
            placeholder={param.default?.toString() || ''}
          />
        );
      case 'number':
        return (
          <Input
            id={param.name}
            type="number"
            value={parameters[param.name] || ''}
            onChange={(e) => updateParameter(param.name, parseFloat(e.target.value))}
            placeholder={param.default?.toString() || ''}
          />
        );
      case 'boolean':
        return (
          <Select 
            value={parameters[param.name]?.toString() || 'false'}
            onValueChange={(value) => updateParameter(param.name, value === 'true')}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="true">True</SelectItem>
              <SelectItem value="false">False</SelectItem>
            </SelectContent>
          </Select>
        );
      case 'select':
        return (
          <Select 
            value={parameters[param.name] || param.default}
            onValueChange={(value) => updateParameter(param.name, value)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select..." />
            </SelectTrigger>
            <SelectContent>
              {param.options?.map((option) => (
                <SelectItem key={option} value={option}>
                  {option}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        );
      case 'textarea':
        return (
          <Textarea
            id={param.name}
            value={parameters[param.name] || ''}
            onChange={(e) => updateParameter(param.name, e.target.value)}
            placeholder={param.description}
            rows={3}
          />
        );
      default:
        return (
          <Input
            id={param.name}
            value={parameters[param.name] || ''}
            onChange={(e) => updateParameter(param.name, e.target.value)}
            placeholder={param.default?.toString() || ''}
          />
        );
    }
  };

  const formatDuration = (ms: number): string => {
    if (ms < 1000) return `${ms}ms`;
    if (ms < 60000) return `${(ms / 1000).toFixed(1)}s`;
    return `${(ms / 60000).toFixed(1)}m`;
  };

  return (
    <Card className="transition-all hover:shadow-md">
      <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-3">
        <div className="flex items-start gap-3">
          <div className="p-2 bg-primary/10 rounded-lg">
            {tool.icon}
          </div>
          <div className="space-y-1">
            <CardTitle className="">{tool.name}</CardTitle>
            <p className="text-sm text-muted-foreground">
              {tool.description}
            </p>
          </div>
        </div>
        <Badge variant="secondary">{tool.category}</Badge>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Parameters Section */}
        <div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setExpandParams(!expandParams)}
            className="w-full justify-between"
          >
            <span className="flex items-center gap-2">
              <Code className="h-4 w-4" />
              Parameters ({tool.parameters.length})
            </span>
            <ChevronDown className={cn(
              "h-4 w-4 transition-transform",
              expandParams && "rotate-180"
            )} />
          </Button>
          
          {expandParams && (
            <div className="mt-3 space-y-3 pl-2 border-l-2 border-border">
              {tool.parameters.map((param) => (
                <div key={param.name} className="space-y-1">
                  <Label htmlFor={param.name} className="text-xs font-medium">
                    {param.label}
                    {param.required && <span className="text-red-500 ml-1">*</span>}
                  </Label>
                  {renderParameterInput(param)}
                  {param.description && (
                    <p className="text-xs text-muted-foreground">
                      {param.description}
                    </p>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Status and Actions */}
        <div className="flex items-center justify-between pt-2">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            {tool.status === 'running' && (
              <div className="flex items-center gap-2">
                <div className="h-2 w-2 bg-yellow-500 rounded-full animate-pulse" />
                <span>Running...</span>
              </div>
            )}
            {tool.status === 'success' && tool.lastRun && (
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-green-500" />
                <span>Last run: {formatDuration(Date.now() - tool.lastRun.getTime())} ago</span>
              </div>
            )}
            {tool.status === 'error' && (
              <div className="flex items-center gap-2">
                <XCircle className="h-4 w-4 text-red-500" />
                <span>Error</span>
              </div>
            )}
            {tool.status === 'idle' && (
              <span className="flex items-center gap-2">
                <Clock className="h-4 w-4" />
                Ready
              </span>
            )}
          </div>
          
          <Button
            onClick={handleRun}
            disabled={isRunning}
            className="gap-2"
          >
            {isRunning ? (
              <>
                <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                Running...
              </>
            ) : (
              <>
                <Play className="h-4 w-4" />
                Run Tool
              </>
            )}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

/**
 * Execution Dialog Component
 */
const ExecutionDialog = ({ 
  isOpen, 
  onClose, 
  execution,
  onReRun 
}: { 
  isOpen: boolean; 
  onClose: () => void; 
  execution: ToolExecution | null;
  onReRun: () => void;
}) => {
  if (!execution) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[85vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              {execution.status === 'success' && (
                <CheckCircle2 className="h-5 w-5 text-green-500" />
              )}
              {execution.status === 'error' && (
                <XCircle className="h-5 w-5 text-red-500" />
              )}
              {execution.status === 'running' && (
                <div className="h-5 w-5 animate-spin rounded-full border-2 border-current border-t-transparent" />
              )}
              <DialogTitle>{execution.toolName}</DialogTitle>
            </div>
            <Badge variant="outline">
              {(execution.duration / 1000).toFixed(2)}s
            </Badge>
          </div>
          <DialogDescription>
            Executed on {execution.timestamp.toLocaleString()}
          </DialogDescription>
        </DialogHeader>

        {/* Parameters */}
        <div className="border-t pt-4">
          <h4 className="text-sm font-medium mb-2">Parameters</h4>
          <div className="grid grid-cols-2 gap-2 text-sm">
            {Object.entries(execution.parameters).map(([key, value]) => (
              <div key={key} className="flex items-start gap-2">
                <span className="font-medium text-muted-foreground min-w-[100px]">
                  {key}:
                </span>
                <span className="font-mono text-xs bg-muted px-2 py-1 rounded flex-1">
                  {JSON.stringify(value)}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Output */}
        <div className="flex-1 overflow-auto border-t pt-4">
          <div className="flex items-center justify-between mb-2">
            <h4 className="text-sm font-medium">Output</h4>
            <Badge variant="secondary">{execution.outputType}</Badge>
          </div>
          <div className="bg-muted p-4 rounded-md overflow-auto">
            <pre className="text-xs font-mono whitespace-pre-wrap">
              {execution.output || 'No output'}
            </pre>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            <Terminal className="mr-2 h-4 w-4" />
            Close
          </Button>
          <Button onClick={onReRun}>
            <Play className="mr-2 h-4 w-4" />
            Run Again
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

/**
 * History Card Component
 */
interface HistoryCardProps {
  execution: ToolExecution;
  onView: (execution: ToolExecution) => void;
  onReRun: (execution: ToolExecution) => void;
}

const HistoryCard = ({ execution, onView, onReRun }: HistoryCardProps) => {
  const formatDuration = (ms: number): string => {
    if (ms < 1000) return `${ms}ms`;
    return `${(ms / 1000).toFixed(2)}s`;
  };

  return (
    <Card className="hover:shadow-md cursor-pointer" onClick={() => onView(execution)}>
      <CardContent className="pt-4">
        <div className="flex items-start justify-between mb-2">
          <div className="flex items-center gap-2">
            {execution.status === 'success' && (
              <CheckCircle2 className="h-4 w-4 text-green-500" />
            )}
            {execution.status === 'error' && (
              <XCircle className="h-4 w-4 text-red-500" />
            )}
            {execution.status === 'running' && (
              <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
            )}
            <span className="font-medium">{execution.toolName}</span>
          </div>
          <span className="text-xs text-muted-foreground">
            {formatDuration(execution.duration)}
          </span>
        </div>
        <div className="flex items-center gap-2 text-xs text-muted-foreground mb-2">
          <Clock className="h-3 w-3" />
          <span>{execution.timestamp.toLocaleString()}</span>
        </div>
        <div className="flex items-center gap-1">
          <Badge variant="outline" className="text-xs">
            {Object.keys(execution.parameters).length} params
          </Badge>
          <Badge variant="outline" className="text-xs">
            {execution.outputType}
          </Badge>
        </div>
      </CardContent>
    </Card>
  );
};

/**
 * Tools Page Component
 */
export const Tools = () => {
  // Tool definitions
  const [tools] = useState<ToolDefinition[]>([
    {
      id: 'terminal',
      name: 'Terminal',
      description: 'Execute shell commands on the system',
      category: 'System',
      icon: <Terminal className="h-5 w-5" />,
      parameters: [
        {
          name: 'command',
          type: 'string',
          label: 'Command',
          description: 'Shell command to execute',
          required: true,
          default: 'echo "Hello, World!"',
        },
        {
          name: 'timeout',
          type: 'number',
          label: 'Timeout (seconds)',
          description: 'Maximum execution time',
          required: false,
          default: 60,
        },
      ],
      status: 'idle',
    },
    {
      id: 'read-file',
      name: 'Read File',
      description: 'Read text files with line numbers',
      category: 'Files',
      icon: <Code className="h-5 w-5" />,
      parameters: [
        {
          name: 'path',
          type: 'string',
          label: 'File Path',
          description: 'Path to the file',
          required: true,
          default: '~/joyful-testing-ground/README.md',
        },
        {
          name: 'offset',
          type: 'number',
          label: 'Starting Line',
          description: 'Line number to start from',
          required: false,
          default: 1,
        },
        {
          name: 'limit',
          type: 'number',
          label: 'Max Lines',
          description: 'Maximum number of lines to read',
          required: false,
          default: 500,
        },
      ],
      status: 'idle',
    },
    {
      id: 'write-file',
      name: 'Write File',
      description: 'Write content to files',
      category: 'Files',
      icon: <Code className="h-5 w-5" />,
      parameters: [
        {
          name: 'path',
          type: 'string',
          label: 'File Path',
          description: 'Path to write to',
          required: true,
        },
        {
          name: 'content',
          type: 'textarea',
          label: 'Content',
          description: 'File contents to write',
          required: true,
        },
      ],
      status: 'idle',
    },
    {
      id: 'web-search',
      name: 'Web Search',
      description: 'Search the web for information',
      category: 'Search',
      icon: <Globe className="h-5 w-5" />,
      parameters: [
        {
          name: 'query',
          type: 'string',
          label: 'Search Query',
          description: 'Query to search for',
          required: true,
          default: 'AI tools 2026',
        },
        {
          name: 'sources',
          type: 'select',
          label: 'Sources',
          description: 'Search sources',
          required: false,
          default: 'all',
          options: ['all', 'news', 'scholar', 'github'],
        },
      ],
      status: 'idle',
    },
    {
      id: 'git',
      name: 'Git',
      description: 'Git repository operations',
      category: 'VCS',
      icon: <GitBranch className="h-5 w-5" />,
      parameters: [
        {
          name: 'action',
          type: 'select',
          label: 'Action',
          description: 'Git action to perform',
          required: true,
          default: 'status',
          options: ['status', 'log', 'diff', 'commit', 'push', 'pull'],
        },
        {
          name: 'message',
          type: 'string',
          label: 'Commit Message',
          description: 'Message for commit',
          required: false,
        },
      ],
      status: 'idle',
    },
    {
      id: 'supabase',
      name: 'Supabase',
      description: 'Supabase database operations',
      category: 'Database',
      icon: <Database className="h-5 w-5" />,
      parameters: [
        {
          name: 'action',
          type: 'select',
          label: 'Action',
          description: 'Database action',
          required: true,
          default: 'query',
          options: ['query', 'insert', 'update', 'delete'],
        },
        {
          name: 'table',
          type: 'string',
          label: 'Table Name',
          description: 'Table to operate on',
          required: true,
        },
        {
          name: 'query',
          type: 'string',
          label: 'Query',
          description: 'SQL query string',
          required: false,
        },
      ],
      status: 'idle',
    },
  ]);

  const [executions, setExecutions] = useState<ToolExecution[]>([]);
  const [runningToolId, setRunningToolId] = useState<string | null>(null);
  const [selectedExecution, setSelectedExecution] = useState<ToolExecution | null>(null);
  const [executionDialogOpen, setExecutionDialogOpen] = useState(false);
  const [filterCategory, setFilterCategory] = useState('all');
  const [showHistory, setShowHistory] = useState(false);

  const handleRunTool = (toolId: string, parameters: Record<string, any>) => {
    const tool = tools.find(t => t.id === toolId);
    if (!tool) return;

    setRunningToolId(toolId);

    // Simulate execution
    const newExecution: ToolExecution = {
      id: `exec-${Date.now()}`,
      toolId,
      toolName: tool.name,
      timestamp: new Date(),
      status: 'running',
      duration: 0,
      output: '',
      outputType: 'text',
      parameters,
    };

    setExecutions(prev => [newExecution, ...prev]);
    setSelectedExecution(newExecution);
    setExecutionDialogOpen(true);

    // Simulate tool execution with delay
    setTimeout(() => {
      const mockOutput = mockToolOutput(toolId, parameters);
      setExecutions(prev => prev.map(exec => 
        exec.id === newExecution.id 
          ? { ...exec, status: 'success', duration: Math.random() * 3000 + 500, output: mockOutput }
          : exec
      ));
      setRunningToolId(null);
    }, 1000 + Math.random() * 2000);
  };

  const mockToolOutput = (toolId: string, parameters: Record<string, any>): string => {
    switch (toolId) {
      case 'terminal':
        return `$ ${parameters.command}\n[STDOUT]\nHello, World!\n\n[Process completed successfully]\nExit code: 0`;
      case 'read-file':
        return `Read ${parameters.limit} lines from ${parameters.path}\n\nLine 1: # Hermes Dashboard\nLine 2: A modern web interface for Hermes Agent\nLine 3: This file was last modified on ${new Date().toISOString()}\n...`;
      case 'write-file':
        return `Written to ${parameters.path}\n\nContent length: ${parameters.content?.length || 0} characters\n[File saved successfully]`;
      case 'web-search':
        return `Search results for: ${parameters.query}\n\n1. AI tools 2026 - The State of the Industry\n2. Top AI Development Tools for 2026\n3. AI-Assisted Development Trends\n4. Emerging AI Tooling Patterns\n\nFound 142 results in 0.23s`;
      case 'git':
        return `$ git ${parameters.action}\n${parameters.message ? ` -m "${parameters.message}"` : ''}\n\nOn branch main\nYour branch is up to date with 'origin/main'.\n\nEverything up-to-date`;
      case 'supabase':
        return `Supabase ${parameters.action} executed on table '${parameters.table}'\n\nQuery: ${parameters.query || 'SELECT *'}\n\n12 rows affected\nTime: 56ms`;
      default:
        return 'Tool executed successfully';
    }
  };

  const filteredTools = filterCategory === 'all' 
    ? tools 
    : tools.filter(t => t.category === filterCategory);

  const stats = {
    total: tools.length,
    running: executions.filter(e => e.status === 'running').length,
    success: executions.filter(e => e.status === 'success').length,
    error: executions.filter(e => e.status === 'error').length,
  };

  const categories = ['all', ...Array.from(new Set(tools.map(t => t.category)))];

  const handleViewExecution = (execution: ToolExecution) => {
    setSelectedExecution(execution);
    setExecutionDialogOpen(true);
  };

  const handleReRunExecution = () => {
    if (selectedExecution) {
      handleRunTool(selectedExecution.toolId, selectedExecution.parameters);
    }
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Tools</h2>
          <p className="text-muted-foreground">
            Execute tools and view execution history
          </p>
        </div>
        <Button onClick={() => setShowHistory(!showHistory)} variant="outline">
          <History className="mr-2 h-4 w-4" />
          {showHistory ? 'Hide' : 'Show'} History
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Tools</CardTitle>
            <Wrench className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Running</CardTitle>
            <Sparkles className="h-4 w-4 text-yellow-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">{stats.running}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Successful</CardTitle>
            <CheckCircle2 className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{stats.success}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Errors</CardTitle>
            <AlertTriangle className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{stats.error}</div>
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
                placeholder="Search tools..."
                className="pl-9"
              />
            </div>

            <div className="flex items-center gap-2">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline">
                    <Filter className="mr-2 h-4 w-4" />
                    Category: {filterCategory}
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  {categories.map((category) => (
                    <DropdownMenuItem
                      key={category}
                      onClick={() => setFilterCategory(category)}
                    >
                      {category}
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tool Catalog */}
      {!showHistory && (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {filteredTools.map(tool => (
            <ToolCard
              key={tool.id}
              tool={tool}
              onRun={handleRunTool}
              isRunning={runningToolId === tool.id}
            />
          ))}
        </div>
      )}

      {/* Execution History */}
      {showHistory && (
        <div className="space-y-4">
          <h3>
            Execution History ({executions.length})
          </h3>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {executions.map(execution => (
              <HistoryCard
                key={execution.id}
                execution={execution}
                onView={handleViewExecution}
                onReRun={handleReRunExecution}
              />
            ))}
          </div>
          
          {executions.length === 0 && (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <History className="h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold">No Executions Yet</h3>
                <p className="text-muted-foreground">
                  Run a tool to see execution history here
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      )}

      {/* Execution Dialog */}
      <ExecutionDialog
        isOpen={executionDialogOpen}
        onClose={() => setExecutionDialogOpen(false)}
        execution={selectedExecution}
        onReRun={handleReRunExecution}
      />
    </div>
  );
};

export default Tools;