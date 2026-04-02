import { z } from 'zod';

// ============================================================================
// TYPE-SAFE SCHEMAS WITH ZOD VALIDATION
// ============================================================================

/**
 * Session Schema - Validates session data structures
 */
export const SessionSchema = z.object({
  sessionId: z.string().uuid(),
  model: z.string(),
  provider: z.string(),
  startedAt: z.coerce.date(),
  isActive: z.boolean(),
  tokenUsage: z.number(),
  messageCount: z.number(),
  tags: z.array(z.string()),
  preview: z.string(),
});

export type Session = z.infer<typeof SessionSchema>;

/**
 * Active Tasks Schema - Real-time task tracking
 */
export const TaskSchema = z.object({
  taskId: z.string().uuid(),
  title: z.string(),
  status: z.enum(['pending', 'in_progress', 'completed', 'failed', 'killed']),
  progress: z.number().min(0).max(100),
  type: z.enum(['file_operation', 'terminal', 'web_search', 'git', 'other']),
  startedAt: z.coerce.date(),
  completedAt: z.coerce.date().optional(),
  output: z.string().optional(),
});

export type Task = z.infer<typeof TaskSchema>;

/**
 * Cron Job Schema - Scheduled task management
 */
export const CronJobSchema = z.object({
  jobId: z.string(),
  name: z.string(),
  schedule: z.string(),
  status: z.enum(['active', 'paused', 'completed', 'failed']),
  nextRunAt: z.coerce.date().optional(),
  lastRunAt: z.coerce.date().optional(),
  skills: z.array(z.string()),
  deliver: z.array(z.string()),
  repeat: z.number().optional(),
});

export type CronJob = z.infer<typeof CronJobSchema>;

/**
 * Todo Item Schema
 */
export const TodoSchema = z.object({
  id: z.string(),
  content: z.string(),
  status: z.enum(['pending', 'in_progress', 'completed', 'cancelled']),
  createdAt: z.coerce.date(),
  priority: z.number().min(0).max(10),
});

export type Todo = z.infer<typeof TodoSchema>;

/**
 * Memory Entry Schema
 */
export const MemorySchema = z.object({
  id: z.string(),
  target: z.enum(['memory', 'user']),
  content: z.string(),
  action: z.enum(['add', 'replace', 'remove']),
  createdAt: z.coerce.date(),
  tags: z.array(z.string()).optional(),
});

export type Memory = z.infer<typeof MemorySchema>;

/**
 * Tool Schema
 */
export const ToolSchema = z.object({
  name: z.string(),
  description: z.string(),
  category: z.string(),
  isConcurrencySafe: z.boolean(),
  isReadOnly: z.boolean(),
  maxResultSizeChars: z.number(),
});

export type Tool = z.infer<typeof ToolSchema>;

/**
 * Tool Execution Schema
 */
export const ToolExecutionSchema = z.object({
  executionId: z.string().uuid(),
  toolName: z.string(),
  input: z.record(z.any()),
  output: z.string().optional(),
  status: z.enum(['pending', 'running', 'completed', 'failed']),
  duration: z.number().optional(),
  timestamp: z.coerce.date(),
});

export type ToolExecution = z.infer<typeof ToolExecutionSchema>;

/**
 * Integration Status Schema
 */
export const IntegrationStatusSchema = z.object({
  name: z.string(),
  type: z.enum(['github', 'telegram', 'notion', 'email', 'discord', 'slack']),
  status: z.enum(['connected', 'disconnected', 'error']),
  lastChecked: z.coerce.date(),
  details: z.record(z.any()).optional(),
});

export type IntegrationStatus = z.infer<typeof IntegrationStatusSchema>;

/**
 * Notification Schema
 */
export const NotificationSchema = z.object({
  id: z.string().uuid(),
  type: z.enum(['success', 'info', 'warning', 'error']),
  title: z.string(),
  message: z.string(),
  timestamp: z.coerce.date(),
  read: z.boolean(),
  actionUrl: z.string().optional(),
});

export type Notification = z.infer<typeof NotificationSchema>;

/**
 * Dashboard Stats Schema
 */
export const DashboardStatsSchema = z.object({
  activeSessions: z.number(),
  activeTasks: z.number(),
  completedTasksToday: z.number(),
  scheduledJobs: z.number(),
  memoryEntries: z.number(),
  githubRepo: z.string(),
  gatewayStatus: z.enum(['online', 'offline', 'error']),
  creditsRemaining: z.number().optional(),
  tokenUsage: z.number(),
});

export type DashboardStats = z.infer<typeof DashboardStatsSchema>;

/**
 * Filter Options Schema - For filtering lists
 */
export const FilterOptionsSchema = z.object({
  search: z.string().optional(),
  status: z.array(z.string()).optional(),
  category: z.array(z.string()).optional(),
  tags: z.array(z.string()).optional(),
  dateFrom: z.coerce.date().optional(),
  dateTo: z.coerce.date().optional(),
});

export type FilterOptions = z.infer<typeof FilterOptionsSchema>;

/**
 * Pagination Schema
 */
export const PaginationSchema = z.object({
  page: z.number().min(1).default(1),
  limit: z.number().min(1).max(100).default(20),
  total: z.number().optional(),
});

export type Pagination = z.infer<typeof PaginationSchema>;

/**
 * API Response Schema - Wrapper for paginated responses
 */
export const PaginatedResponseSchema = <T extends z.ZodType>(itemSchema: T) => 
  z.object({
    data: z.array(itemSchema),
    pagination: PaginationSchema,
  });

/**
 * Dashboard Activity Schema - Timeline events
 */
export const ActivityEventSchema = z.object({
  id: z.string().uuid(),
  type: z.enum(['session', 'task', 'cron', 'git', 'file', 'other']),
  title: z.string(),
  description: z.string(),
  timestamp: z.coerce.date(),
  icon: z.string().optional(),
  color: z.string().optional(),
});

export type ActivityEvent = z.infer<typeof ActivityEventSchema>;

/**
 * Settings Schema - Application settings
 */
export const SettingsSchema = z.object({
  model: z.string().default('glm-4.7'),
  provider: z.string().default('venice.ai'),
  temperature: z.number().min(0).max(2).default(0.7),
  maxTokens: z.number().min(1).default(4000),
  theme: z.enum(['light', 'dark']).default('dark'),
  notifications: z.boolean().default(true),
  autoPush: z.boolean().default(true),
  sessionTimeout: z.number().min(1).default(3600),
});

export type Settings = z.infer<typeof SettingsSchema>;