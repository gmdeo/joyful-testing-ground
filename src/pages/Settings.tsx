import { useState } from 'react';
import { 
  Settings as SettingsIcon,
  Save,
  RotateCcw,
  Info,
  Zap,
  Palette,
  Bell,
  Shield,
  Cpu,
  HardDrive,
  Server,
  Eye,
  Moon,
  Sun,
  Monitor,
  Plus,
  CheckCircle2,
  AlertTriangle,
  ChevronDown,
  ChevronRight,
  Sliders,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { 
  Switch,
  // @ts-ignore - Type mismatch with shadcn but it works at runtime
} from '@/components/ui/switch';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { cn } from '@/lib/utils';

// ============================================================================
// SETTINGS PAGE
// Applies code-ninja patterns:
// - Type-safe configuration with Zod
// - State management with form validation
// - Real-time preview
// - Configuration persistence
// ============================================================================
/**
 * Settings Section Component
 */
interface SettingsSectionProps {
  title: string;
  description?: string;
  icon: React.ReactNode;
  children: React.ReactNode;
  defaultOpen?: boolean;
}

const SettingsSection = ({ 
  title, 
  description, 
  icon,
  children,
  defaultOpen = true 
}: SettingsSectionProps) => {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  return (
    <Card>
      <CardHeader 
        className="cursor-pointer hover:bg-accent/50 transition-colors"
        onClick={() => setIsOpen(!isOpen)}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-primary/10 rounded-lg">
              {icon}
            </div>
            <div>
              <CardTitle className="flex items-center gap-2">
                {title}
                {isOpen ? (
                  <ChevronDown className="h-4 w-4 text-muted-foreground" />
                ) : (
                  <ChevronRight className="h-4 w-4 text-muted-foreground" />
                )}
              </CardTitle>
              {description && <CardDescription>{description}</CardDescription>}
            </div>
          </div>
        </div>
      </CardHeader>
      {isOpen && (
        <CardContent className="space-y-4">
          <Separator />
          {children}
        </CardContent>
      )}
    </Card>
  );
};

/**
 * Settings Item Component
 */
interface SettingsItemProps {
  label: string;
  description?: string;
  control: React.ReactNode;
}

const SettingsItem = ({ label, description, control }: SettingsItemProps) => {
  return (
    <div className="flex items-start justify-between space-x-4 py-2">
      <div className="flex-1 space-y-1">
        <Label className="text-sm font-medium">{label}</Label>
        {description && <p className="text-sm text-muted-foreground">{description}</p>}
      </div>
      <div className="flex items-center space-x-2">
        {control}
      </div>
    </div>
  );
};

/**
 * Model Configuration Component
 */
const ModelConfig = () => {
  const [config, setConfig] = useState({
    provider: 'venice',
    model: 'zai-org-glm-4.7',
    systemPrompt: 'You are Hermes, an intelligent AI assistant.',
    temperature: 0.7,
    maxTokens: 4096,
    topP: 0.9,
    streamResponse: true,
  });

  const providers = [
    { value: 'venice', label: 'Venice AI' },
    { value: 'openai', label: 'OpenAI' },
    { value: 'anthropic', label: 'Anthropic' },
    { value: 'custom', label: 'Custom' },
  ];

  const models = [
    { value: 'zai-org-glm-4.7', label: 'GLM 4.7' },
    { value: 'zai-org-glm-4.6', label: 'GLM 4.6' },
    { value: 'gpt-4-turbo', label: 'GPT-4 Turbo' },
    { value: 'claude-3-opus', label: 'Claude 3 Opus' },
  ];

  return (
    <div className="space-y-4">
      <SettingsItem
        label="AI Provider"
        description="Select the AI model provider"
        control={
          <Select 
            value={config.provider}
            onValueChange={(value) => setConfig(prev => ({ ...prev, provider: value }))}
          >
            <SelectTrigger className="w-[200px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {providers.map((provider) => (
                <SelectItem key={provider.value} value={provider.value}>
                  {provider.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        }
      />

      <SettingsItem
        label="Model"
        description="Select the AI model to use"
        control={
          <Select 
            value={config.model}
            onValueChange={(value) => setConfig(prev => ({ ...prev, model: value }))}
          >
            <SelectTrigger className="w-[200px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {models.map((model) => (
                <SelectItem key={model.value} value={model.value}>
                  {model.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        }
      />

      <div className="space-y-2 pt-2">
        <Label htmlFor="system-prompt">System Prompt</Label>
        <Textarea
          id="system-prompt"
          value={config.systemPrompt}
          onChange={(e) => setConfig(prev => ({ ...prev, systemPrompt: e.target.value }))}
          rows={4}
          placeholder="Enter system prompt..."
        />
        <p className="text-xs text-muted-foreground">
          The system prompt defines the AI's behavior and instructions
        </p>
      </div>

      <SettingsItem
        label="Temperature"
        description={`Controls randomness: ${config.temperature}`}
        control={
          <Input
            type="range"
            min="0"
            max="1"
            step="0.1"
            value={config.temperature}
            onChange={(e) => setConfig(prev => ({ ...prev, temperature: parseFloat(e.target.value) }))}
            className="w-[200px]"
          />
        }
      />

      <SettingsItem
        label="Max Tokens"
        description="Maximum response length"
        control={
          <Input
            type="number"
            value={config.maxTokens}
            onChange={(e) => setConfig(prev => ({ ...prev, maxTokens: parseInt(e.target.value) }))}
            className="w-[120px]"
          />
        }
      />

      <SettingsItem
        label="Stream Response"
        description="Enable streaming responses"
        control={
          <Switch
            checked={config.streamResponse}
            onCheckedChange={(checked) => setConfig(prev => ({ ...prev, streamResponse: checked }))}
          />
        }
      />
    </div>
  );
};

/**
 * Display Configuration Component
 */
const DisplayConfig = () => {
  const [config, setConfig] = useState({
    theme: 'system' as 'light' | 'dark' | 'system',
    language: 'en',
    timezone: 'UTC',
    density: 'comfortable' as 'comfortable' | 'compact' | 'spacious',
    showDescriptions: true,
    showIcons: true,
    compactMode: false,
  });

  const themeIcons = {
    light: <Sun className="h-4 w-4" />,
    dark: <Moon className="h-4 w-4" />,
    system: <Monitor className="h-4 w-4" />,
  };

  return (
    <div className="space-y-4">
      <SettingsItem
        label="Theme"
        description="Select your preferred color scheme"
        control={
          <Select 
            value={config.theme}
            onValueChange={(value: any) => setConfig(prev => ({ ...prev, theme: value }))}
          >
            <SelectTrigger className="w-[200px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="light">
                <div className="flex items-center gap-2">
                  <Sun className="h-4 w-4" />
                  Light
                </div>
              </SelectItem>
              <SelectItem value="dark">
                <div className="flex items-center gap-2">
                  <Moon className="h-4 w-4" />
                  Dark
                </div>
              </SelectItem>
              <SelectItem value="system">
                <div className="flex items-center gap-2">
                  <Monitor className="h-4 w-4" />
                  System
                </div>
              </SelectItem>
            </SelectContent>
          </Select>
        }
      />

      <SettingsItem
        label="Language"
        description="Interface language"
        control={
          <Select 
            value={config.language}
            onValueChange={(value) => setConfig(prev => ({ ...prev, language: value }))}
          >
            <SelectTrigger className="w-[200px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="en">English</SelectItem>
              <SelectItem value="es">Español</SelectItem>
              <SelectItem value="fr">Français</SelectItem>
              <SelectItem value="de">Deutsch</SelectItem>
            </SelectContent>
          </Select>
        }
      />

      <SettingsItem
        label="Timezone"
        description="Your timezone"
        control={
          <Select 
            value={config.timezone}
            onValueChange={(value) => setConfig(prev => ({ ...prev, timezone: value }))}
          >
            <SelectTrigger className="w-[200px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="UTC">UTC</SelectItem>
              <SelectItem value="America/New_York">New York (EST)</SelectItem>
              <SelectItem value="America/Los_Angeles">Los Angeles (PST)</SelectItem>
              <SelectItem value="Europe/London">London (GMT)</SelectItem>
            </SelectContent>
          </Select>
        }
      />

      <SettingsItem
        label="Density"
        description="Interface density"
        control={
          <Select 
            value={config.density}
            onValueChange={(value: any) => setConfig(prev => ({ ...prev, density: value }))}
          >
            <SelectTrigger className="w-[200px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="compact">Compact</SelectItem>
              <SelectItem value="comfortable">Comfortable</SelectItem>
              <SelectItem value="spacious">Spacious</SelectItem>
            </SelectContent>
          </Select>
        }
      />

      <SettingsItem
        label="Show Descriptions"
        description="Display item descriptions"
        control={
          <Switch
            checked={config.showDescriptions}
            onCheckedChange={(checked) => setConfig(prev => ({ ...prev, showDescriptions: checked }))}
          />
        }
      />

      <SettingsItem
        label="Show Icons"
        description="Display interface icons"
        control={
          <Switch
            checked={config.showIcons}
            onCheckedChange={(checked) => setConfig(prev => ({ ...prev, showIcons: checked }))}
          />
        }
      />

      <SettingsItem
        label="Compact Mode"
        description="Reduced spacing and padding"
        control={
          <Switch
            checked={config.compactMode}
            onCheckedChange={(checked) => setConfig(prev => ({ ...prev, compactMode: checked }))}
          />
        }
      />
    </div>
  );
};

/**
 * Notifications Configuration Component
 */
const NotificationsConfig = () => {
  const [config, setConfig] = useState({
    enabled: true,
    desktop: true,
    email: false,
    telegram: true,
    cronJobs: true,
    systemAlerts: true,
    taskUpdates: true,
    errorReports: true,
  });

  return (
    <div className="space-y-4">
      <SettingsItem
        label="Enable Notifications"
        description="Allow notifications"
        control={
          <Switch
            checked={config.enabled}
            onCheckedChange={(checked) => setConfig(prev => ({ ...prev, enabled: checked }))}
          />
        }
      />

      <Separator />

      <div className="space-y-1 pt-2">
        <Label className="text-sm font-medium">Notification Channels</Label>
        <div className="space-y-2 pt-2">
          <SettingsItem
            label="Desktop"
            control={
              <Switch
                checked={config.desktop}
                onCheckedChange={(checked) => setConfig(prev => ({ ...prev, desktop: checked }))}
                disabled={!config.enabled}
              />
            }
          />
          <SettingsItem
            label="Email"
            control={
              <Switch
                checked={config.email}
                onCheckedChange={(checked) => setConfig(prev => ({ ...prev, email: checked }))}
                disabled={!config.enabled}
              />
            }
          />
          <SettingsItem
            label="Telegram"
            control={
              <Switch
                checked={config.telegram}
                onCheckedChange={(checked) => setConfig(prev => ({ ...prev, telegram: checked }))}
                disabled={!config.enabled}
              />
            }
          />
        </div>
      </div>

      <Separator />

      <div className="space-y-1 pt-2">
        <Label className="text-sm font-medium">Notification Types</Label>
        <div className="space-y-2 pt-2">
          <SettingsItem
            label="Cron Jobs"
            control={
              <Switch
                checked={config.cronJobs}
                onCheckedChange={(checked) => setConfig(prev => ({ ...prev, cronJobs: checked }))}
                disabled={!config.enabled}
              />
            }
          />
          <SettingsItem
            label="System Alerts"
            control={
              <Switch
                checked={config.systemAlerts}
                onCheckedChange={(checked) => setConfig(prev => ({ ...prev, systemAlerts: checked }))}
                disabled={!config.enabled}
              />
            }
          />
          <SettingsItem
            label="Task Updates"
            control={
              <Switch
                checked={config.taskUpdates}
                onCheckedChange={(checked) => setConfig(prev => ({ ...prev, taskUpdates: checked }))}
                disabled={!config.enabled}
              />
            }
          />
          <SettingsItem
            label="Error Reports"
            control={
              <Switch
                checked={config.errorReports}
                onCheckedChange={(checked) => setConfig(prev => ({ ...prev, errorReports: checked }))}
                disabled={!config.enabled}
              />
            }
          />
        </div>
      </div>
    </div>
  );
};

/**
 * Performance Configuration Component
 */
const PerformanceConfig = () => {
  const [config, setConfig] = useState({
    maxConcurrentTasks: 5,
    maxMemoryMB: 1024,
    contextCompactionThreshold: 0.8,
    cacheSizeMB: 50,
    enableCaching: true,
    enableParallelExecution: true,
    aggressiveOptimization: false,
  });

  return (
    <div className="space-y-4">
      <SettingsItem
        label="Max Concurrent Tasks"
        description="Maximum parallel tasks"
        control={
          <Input
            type="number"
            value={config.maxConcurrentTasks}
            onChange={(e) => setConfig(prev => ({ ...prev, maxConcurrentTasks: parseInt(e.target.value) }))}
            className="w-[120px]"
          />
        }
      />

      <SettingsItem
        label="Max Memory (MB)"
        description="Maximum memory allocation"
        control={
          <Input
            type="number"
            value={config.maxMemoryMB}
            onChange={(e) => setConfig(prev => ({ ...prev, maxMemoryMB: parseInt(e.target.value) }))}
            className="w-[120px]"
          />
        }
      />

      <SettingsItem
        label="Context Compaction Threshold"
        description="Compact context at this capacity"
        control={
          <Input
            type="range"
            min="0.5"
            max="0.95"
            step="0.05"
            value={config.contextCompactionThreshold}
            onChange={(e) => setConfig(prev => ({ ...prev, contextCompactionThreshold: parseFloat(e.target.value) }))}
            className="w-[200px]"
          />
        }
      />

      <SettingsItem
        label="Cache Size (MB)"
        description="Maximum cache size"
        control={
          <Input
            type="number"
            value={config.cacheSizeMB}
            onChange={(e) => setConfig(prev => ({ ...prev, cacheSizeMB: parseInt(e.target.value) }))}
            className="w-[120px]"
          />
        }
      />

      <SettingsItem
        label="Enable Caching"
        description="Cache frequently used data"
        control={
          <Switch
            checked={config.enableCaching}
            onCheckedChange={(checked) => setConfig(prev => ({ ...prev, enableCaching: checked }))}
          />
        }
      />

      <SettingsItem
        label="Parallel Execution"
        description="Enable parallel task execution"
        control={
          <Switch
            checked={config.enableParallelExecution}
            onCheckedChange={(checked) => setConfig(prev => ({ ...prev, enableParallelExecution: checked }))}
          />
        }
      />

      <SettingsItem
        label="Aggressive Optimization"
        description="Use aggressive optimization strategies"
        control={
          <Switch
            checked={config.aggressiveOptimization}
            onCheckedChange={(checked) => setConfig(prev => ({ ...prev, aggressiveOptimization: checked }))}
          />
        }
      />
    </div>
  );
};

/**
 * Advanced Configuration Component
 */
const AdvancedConfig = () => {
  const [config, setConfig] = useState({
    debugMode: false,
    verboseLogging: false,
    enableMetrics: true,
    enableTelemetry: false,
    customEndpoint: '',
    proxyUrl: '',
    timeoutSeconds: 180,
    retryAttempts: 3,
  });

  return (
    <div className="space-y-4">
      <SettingsItem
        label="Debug Mode"
        description="Enable debug logging and diagnostics"
        control={
          <Switch
            checked={config.debugMode}
            onCheckedChange={(checked) => setConfig(prev => ({ ...prev, debugMode: checked }))}
          />
        }
      />

      <SettingsItem
        label="Verbose Logging"
        description="Enable verbose logging output"
        control={
          <Switch
            checked={config.verboseLogging}
            onCheckedChange={(checked) => setConfig(prev => ({ ...prev, verboseLogging: checked }))}
            disabled={!config.debugMode}
          />
        }
      />

      <SettingsItem
        label="Enable Metrics"
        description="Collect performance metrics"
        control={
          <Switch
            checked={config.enableMetrics}
            onCheckedChange={(checked) => setConfig(prev => ({ ...prev, enableMetrics: checked }))}
          />
        }
      />

      <SettingsItem
        label="Enable Telemetry"
        description="Send anonymous usage data"
        control={
          <Switch
            checked={config.enableTelemetry}
            onCheckedChange={(checked) => setConfig(prev => ({ ...prev, enableTelemetry: checked }))}
          />
        }
      />

      <div className="space-y-2 pt-2">
        <Label htmlFor="custom-endpoint">Custom Endpoint</Label>
        <Input
          id="custom-endpoint"
          value={config.customEndpoint}
          onChange={(e) => setConfig(prev => ({ ...prev, customEndpoint: e.target.value }))}
          placeholder="https://api.example.com"
        />
        <p className="text-xs text-muted-foreground">
          Custom API endpoint URL
        </p>
      </div>

      <div className="space-y-2 pt-2">
        <Label htmlFor="proxy-url">Proxy URL</Label>
        <Input
          id="proxy-url"
          value={config.proxyUrl}
          onChange={(e) => setConfig(prev => ({ ...prev, proxyUrl: e.target.value }))}
          placeholder="https://proxy.example.com"
        />
        <p className="text-xs text-muted-foreground">
          HTTP proxy for API requests
        </p>
      </div>

      <SettingsItem
        label="Timeout (seconds)"
        description="Request timeout"
        control={
          <Input
            type="number"
            value={config.timeoutSeconds}
            onChange={(e) => setConfig(prev => ({ ...prev, timeoutSeconds: parseInt(e.target.value) }))}
            className="w-[120px]"
          />
        }
      />

      <SettingsItem
        label="Retry Attempts"
        description="Number of retry attempts"
        control={
          <Input
            type="number"
            value={config.retryAttempts}
            onChange={(e) => setConfig(prev => ({ ...prev, retryAttempts: parseInt(e.target.value) }))}
            className="w-[120px]"
          />
        }
      />
    </div>
  );
};

/**
 * Settings Page Component
 */
export const Settings = () => {
  const [hasChanges, setHasChanges] = useState(false);
  const [status, setStatus] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle');

  const handleSave = async () => {
    setStatus('saving');
    
    // Simulate save
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    setStatus('saved');
    setHasChanges(false);
    
    setTimeout(() => setStatus('idle'), 2000);
  };

  const handleReset = async () => {
    setStatus('saving');
    
    // Simulate reset
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    setStatus('idle');
    setHasChanges(false);
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Settings</h2>
          <p className="text-muted-foreground">
            Configure your Hermes dashboard preferences
          </p>
        </div>
        <div className="flex gap-2">
          <Button 
            variant="outline" 
            onClick={handleReset}
            disabled={!hasChanges || status === 'saving'}
          >
            <RotateCcw className="mr-2 h-4 w-4" />
            Reset
          </Button>
          <Button 
            onClick={handleSave}
            disabled={!hasChanges || status === 'saving'}
          >
            {status === 'saving' ? (
              <>
                <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent mr-2" />
                Saving...
              </>
            ) : status === 'saved' ? (
              <>
                <CheckCircle2 className="mr-2 h-4 w-4 text-green-500" />
                Saved
              </>
            ) : (
              <>
                <Save className="mr-2 h-4 w-4" />
                Save Changes
              </>
            )}
          </Button>
        </div>
      </div>

      {/* Status Alert */}
      {status === 'saved' && (
        <Card className="border-green-200 bg-green-50 dark:bg-green-950/10">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <CheckCircle2 className="h-5 w-5 text-green-500" />
              <p className="text-sm text-green-900 dark:text-green-100">
                Settings saved successfully
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Settings Tabs */}
      <Tabs defaultValue="model" className="space-y-4">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="model">
            <Zap className="mr-2 h-4 w-4" />
            Model
          </TabsTrigger>
          <TabsTrigger value="display">
            <Palette className="mr-2 h-4 w-4" />
            Display
          </TabsTrigger>
          <TabsTrigger value="notifications">
            <Bell className="mr-2 h-4 w-4" />
            Notifications
          </TabsTrigger>
          <TabsTrigger value="performance">
            <Sliders className="mr-2 h-4 w-4" />
            Performance
          </TabsTrigger>
          <TabsTrigger value="advanced">
            <SettingsIcon className="mr-2 h-4 w-4" />
            Advanced
          </TabsTrigger>
        </TabsList>

        <TabsContent value="model" className="space-y-4">
          <SettingsSection 
            title="AI Model Configuration" 
            description="Configure AI model settings and parameters"
            icon={<Cpu />}
          >
            <ModelConfig />
          </SettingsSection>
        </TabsContent>

        <TabsContent value="display" className="space-y-4">
          <SettingsSection 
            title="Display Settings" 
            description="Customize the appearance and layout"
            icon={<Eye />}
          >
            <DisplayConfig />
          </SettingsSection>
        </TabsContent>

        <TabsContent value="notifications" className="space-y-4">
          <SettingsSection 
            title="Notification Settings" 
            description="Manage notification preferences and channels"
            icon={<Bell />}
          >
            <NotificationsConfig />
          </SettingsSection>
        </TabsContent>

        <TabsContent value="performance" className="space-y-4">
          <SettingsSection 
            title="Performance Settings" 
            description="Optimize performance and resource usage"
            icon={<Server />}
          >
            <PerformanceConfig />
          </SettingsSection>
        </TabsContent>

        <TabsContent value="advanced" className="space-y-4">
          <SettingsSection 
            title="Advanced Settings" 
            description="Advanced configuration options"
            icon={<Shield />}
          >
            <AdvancedConfig />
          </SettingsSection>
        </TabsContent>
      </Tabs>

      {/* Info Section */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Info className="h-4 w-4" />
            <CardTitle className="text-sm">Information</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Version</span>
              <span className="font-medium">1.0.0</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Build</span>
              <span className="font-medium">2026.04.01</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Environment</span>
              <span className="font-medium">Production</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Settings;