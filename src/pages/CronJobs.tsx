import { useState } from 'react';
import { 
  Play, 
  Pause, 
  RefreshCw,
  ClockIcon,
  MoreVertical,
  Calendar,
  GitBranch,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  Eye,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
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
import { CronJob } from '@/types';
import { cn } from '@/lib/utils';

// ============================================================================
// CRON JOB DASHBOARD
// Applies code-ninja patterns:
// - Type-safe data structures with Zod
// - State management with reactivity
// - User confirmation for critical actions
// ============================================================================

/**
 * Cron Job Card Component
 * Displays individual job with run controls and status
 */
interface CronJobCardProps {
  job: CronJob;
  onPauseResume: (jobId: string) => void;
  onRunNow: (jobId: string) => void;
  onViewOutput: (jobId: string) => void;
}

const CronJobCard = ({ 
  job, 
  onPauseResume,
  onRunNow,
  onViewOutput 
}: CronJobCardProps) => {
  const getStatusBadge = () => {
    switch (job.status) {
      case 'active':
        return <Badge className="bg-green-500">
          <CheckCircle2 className="mr-1 h-3 w-3" />
          Active
        </Badge>;
      case 'paused':
        return <Badge variant="secondary">
          <Pause className="mr-1 h-3 w-3" />
          Paused
        </Badge>;
      case 'completed':
        return <Badge variant="outline">
          Completed
        </Badge>;
      case 'failed':
        return <Badge variant="destructive">
          <XCircle className="mr-1 h-3 w-3" />
          Failed
        </Badge>;
      default:
        return <Badge>{job.status}</Badge>;
    }
  };

  const formatSchedule = (schedule: string): string => {
    // Parse cron-like schedule format
    if (schedule.includes(' ')) {
      return schedule; // It's already a cron expression
    }
    return schedule;
  };

  const formatNextRun = (date: Date | undefined): string => {
    if (!date) return 'Not scheduled';
    const now = new Date();
    const diffMs = date.getTime() - now.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 0) return 'Overdue';
    if (diffMins < 60) return `${diffMins}m from now`;
    if (diffHours < 24) return `${diffHours}h from now`;
    return `${diffDays}d from now`;
  };

  const formatLastRun = (date: Date | undefined): string => {
    if (!date) return 'Never';
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

  return (
    <Card className="transition-all hover:shadow-md">
      <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-3">
        <div className="space-y-1">
          <CardTitle className="text-base flex items-center gap-2">
            {job.name}
          </CardTitle>
          <code className="text-xs text-muted-foreground">
            {job.jobId}
          </code>
        </div>
        <div className="flex items-center gap-2">
          {getStatusBadge()}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8">
                <MoreVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => onViewOutput(job.jobId)}>
                <Eye className="mr-2 h-4 w-4" />
                View Output
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem 
                onClick={() => onPauseResume(job.jobId)}
                className="text-blue-600"
              >
                {job.status === 'active' ? (
                  <>
                    <Pause className="mr-2 h-4 w-4" />
                    Pause Job
                  </>
                ) : (
                  <>
                    <Play className="mr-2 h-4 w-4" />
                    Resume Job
                  </>
                )}
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {/* Schedule */}
          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center gap-2 text-muted-foreground">
              <ClockIcon className="h-4 w-4" />
              <span>Schedule:</span>
            </div>
            <code className="text-xs bg-accent px-2 py-1 rounded">
              {formatSchedule(job.schedule)}
            </code>
          </div>

          {/* Next Run */}
          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center gap-2 text-muted-foreground">
              <Calendar className="h-4 w-4" />
              <span>Next Run:</span>
            </div>
            <span className="font-medium">{formatNextRun(job.nextRunAt)}</span>
          </div>

          {/* Last Run */}
          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center gap-2 text-muted-foreground">
              <RefreshCw className="h-4 w-4" />
              <span>Last Run:</span>
            </div>
            <span className="font-medium">{formatLastRun(job.lastRunAt)}</span>
          </div>

          {/* Skills */}
          {job.skills.length > 0 && (
            <div className="flex flex-wrap gap-1 pt-2">
              {job.skills.map((skill, idx) => (
                <Badge key={idx} variant="outline" className="text-xs">
                  {skill}
                </Badge>
              ))}
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex gap-2 pt-2">
            <Button 
              variant="outline" 
              size="sm" 
              className="flex-1"
              onClick={() => onRunNow(job.jobId)}
              disabled={job.status === 'failed'}
            >
              <Play className="mr-2 h-4 w-4" />
              Run Now
            </Button>
            <Button 
              variant={job.status === 'active' ? 'secondary' : 'default'}
              size="sm"
              onClick={() => onPauseResume(job.jobId)}
            >
              {job.status === 'active' ? (
                <>
                  <Pause className="mr-2 h-4 w-4" />
                  Pause
                </>
              ) : (
                <>
                  <Play className="mr-2 h-4 w-4" />
                  Resume
                </>
              )}
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

/**
 * Run Output Dialog Component
 */
const RunOutputDialog = ({ 
  isOpen, 
  onClose, 
  output 
}: { 
  isOpen: boolean; 
  onClose: () => void; 
  output: string;
}) => {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl max-h-[80vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle>Job Output</DialogTitle>
          <DialogDescription>
            Console output from the last job execution
          </DialogDescription>
        </DialogHeader>
        <div className="flex-1 overflow-auto bg-muted p-4 rounded-md">
          <pre className="text-xs font-mono whitespace-pre-wrap">
            {output || 'No output available'}
          </pre>
        </div>
        <DialogFooter>
          <Button onClick={onClose}>Close</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

/**
 * Cron Jobs Page Component
 */
export const CronJobs = () => {
  const [jobs, setJobs] = useState<CronJob[]>([
    {
      jobId: '4b2cf746abc4',
      name: 'Daily Product Builder',
      schedule: '0 9 * * *',
      status: 'paused',
      nextRunAt: new Date(Date.now() + 12 * 60 * 60000),
      lastRunAt: new Date(Date.now() - 48 * 60 * 60000),
      skills: ['autonomous-product-builder', 'arxiv', 'duckduckgo-search', 'blogwatcher'],
      deliver: ['telegram', 'notion'],
      repeat: 1,
    },
    {
      jobId: '8a3de159abcd5',
      name: 'Daily Technology Research',
      schedule: '0 8 * * *',
      status: 'paused',
      nextRunAt: new Date(Date.now() + 11 * 60 * 60000),
      lastRunAt: new Date(Date.now() - 24 * 60 * 60000),
      skills: ['cutting-edge-research', 'arxiv', 'duckduckgo-search', 'blogwatcher', 'domain-intel'],
      deliver: ['telegram', 'notion'],
      repeat: 1,
    },
  ]);

  const [selectedJobId, setSelectedJobId] = useState<string | null>(null);
  const [outputDialogOpen, setOutputDialogOpen] = useState(false);
  const [runConfirmDialogOpen, setRunConfirmDialogOpen] = useState(false);

  const handlePauseResume = (jobId: string) => {
    setJobs(jobs.map(job => {
      if (job.jobId === jobId) {
        const newStatus = job.status === 'active' ? 'paused' : 'active';
        return {
          ...job,
          status: newStatus as CronJob['status'],
        };
      }
      return job;
    }));
  };

  const handleRunNow = (jobId: string) => {
    setSelectedJobId(jobId);
    setRunConfirmDialogOpen(true);
  };

  const confirmRunNow = () => {
    if (selectedJobId) {
      // In real implementation, this would call the cron API
      console.log(`Running job ${selectedJobId} now`);
      setRunConfirmDialogOpen(false);
      setSelectedJobId(null);
      
      // Simulate job update
      const job = jobs.find(j => j.jobId === selectedJobId);
      if (job) {
        setJobs(jobs.map(j => 
          j.jobId === selectedJobId 
            ? { ...j, lastRunAt: new Date() }
            : j
        ));
      }
    }
  };

  const handleViewOutput = (jobId: string) => {
    setSelectedJobId(jobId);
    setOutputDialogOpen(true);
  };

  const stats = {
    total: jobs.length,
    active: jobs.filter(j => j.status === 'active').length,
    paused: jobs.filter(j => j.status === 'paused').length,
    failed: jobs.filter(j => j.status === 'failed').length,
  };

  const selectedJob = selectedJobId ? jobs.find(j => j.jobId === selectedJobId) : null;
  const mockOutput = `[${new Date().toISOString()}] Starting job execution...
[${new Date().toISOString()}] Loading skills: ${selectedJob?.skills.join(', ')}
[${new Date().toISOString()}] Initializing research pipeline...
[${new Date().toISOString()}] Stage 1: Market trend analysis
[${new Date().toISOString()}]   Found 142 trending topics
[${new Date().toISOString()}]   Identified 27 emerging technologies
[${new Date().toISOString()}] Stage 2: Academic paper research
[${new Date().toISOString()}]   Searching arXiv for relevant papers...
[${new Date().toISOString()}]   Downloaded 8 papers for analysis
[${new Date().toISOString()}] Stage 3: Use case validation
[${new Date().toISOString()}]   Validated 12 use cases
[${new Date().toISOString()}]   Identified 3 high-priority opportunities
[${new Date().toISOString()}] Delivering results to: ${selectedJob?.deliver.join(', ')}
[${new Date().toISOString()}] Job completed successfully ✓`;

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Cron Jobs</h2>
          <p className="text-muted-foreground">
            Manage scheduled tasks and automated workflows
          </p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Jobs</CardTitle>
            <ClockIcon className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active</CardTitle>
            <CheckCircle2 className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{stats.active}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Paused</CardTitle>
            <Pause className="h-4 w-4 text-yellow-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">{stats.paused}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Failed</CardTitle>
            <AlertTriangle className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{stats.failed}</div>
          </CardContent>
        </Card>
      </div>

      {/* Scheduled Job Alerts */}
      {stats.failed > 0 && (
        <Card className="border-red-200 bg-red-50 dark:bg-red-950/10">
          <CardContent className="pt-6 flex items-center gap-3">
            <AlertTriangle className="h-5 w-5 text-red-500" />
            <p className="text-sm font-medium text-red-900 dark:text-red-100">
              {stats.failed} job{stats.failed > 1 ? 's' : ''} failed to execute. Review output for details.
            </p>
          </CardContent>
        </Card>
      )}

      {/* Jobs Grid */}
      <div className="grid gap-4 md:grid-cols-2">
        {jobs.map(job => (
          <CronJobCard
            key={job.jobId}
            job={job}
            onPauseResume={handlePauseResume}
            onRunNow={handleRunNow}
            onViewOutput={handleViewOutput}
          />
        ))}
      </div>

      {/* Empty State */}
      {jobs.length === 0 && (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <ClockIcon className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold">No Cron Jobs</h3>
            <p className="text-muted-foreground">
              You don't have any scheduled jobs configured
            </p>
          </CardContent>
        </Card>
      )}

      {/* Run Confirmation Dialog */}
      <Dialog open={runConfirmDialogOpen} onOpenChange={setRunConfirmDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Run Job Now?</DialogTitle>
            <DialogDescription>
              Are you sure you want to run <strong>{jobs.find(j => j.jobId === selectedJobId)?.name}</strong> 
              immediately? This will execute the job outside its normal schedule.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => {
              setRunConfirmDialogOpen(false);
              setSelectedJobId(null);
            }}>
              Cancel
            </Button>
            <Button onClick={confirmRunNow}>
              <Play className="mr-2 h-4 w-4" />
              Run Now
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Output Dialog */}
      <RunOutputDialog
        isOpen={outputDialogOpen}
        onClose={() => {
          setOutputDialogOpen(false);
          setSelectedJobId(null);
        }}
        output={mockOutput}
      />
    </div>
  );
};

export default CronJobs;