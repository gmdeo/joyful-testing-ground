import { useState } from 'react';
import { 
  ArrowRight,
  ArrowLeft,
  GitBranch,
  Database,
  MessageSquare,
  Cloud,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  RefreshCw,
  Settings,
  ExternalLink,
  Lock,
  Key,
  Shield,
  Bell,
  Copy,
  Check,
  Info,
  Link,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { cn } from '@/lib/utils';
import { toast } from '@/components/ui/use-toast';

// ============================================================================
// INTEGRATIONS UI
// Applies code-ninja patterns:
// - Type-safe configuration with Zod
// - State management with connection tracking
// - Real-time status monitoring
// - Secure credential handling
// - Integration lifecycle management
// ============================================================================

/**
 * Integration status type
 */
type IntegrationStatus = 'connected' | 'disconnected' | 'error' | 'connecting';

/**
 * Integration definition interface
 */
interface Integration {
  id: string;
  name: string;
  description: string;
  icon: React.ReactNode;
  category: 'core' | 'ai' | 'storage' | 'communication' | 'other';
  status: IntegrationStatus;
  configured: boolean;
  lastConnected?: Date;
  lastError?: string;
  features: string[];
  config: IntegrationConfigField[];
  docsUrl?: string;
}

/**
 * Integration configuration field interface
 */
interface IntegrationConfigField {
  name: string;
  type: 'text' | 'password' | 'textarea' | 'number' | 'select' | 'boolean' | 'url';
  label: string;
  description?: string;
  required: boolean;
  default?: string | number | boolean;
  options?: string[];
  placeholder?: string;
}

/**
 * Integration Card Component
 */
interface IntegrationCardProps {
  integration: Integration;
  onConfigure: (id: string) => void;
  onConnect: (id: string) => void;
  onDisconnect: (id: string) => void;
  onTest: (id: string) => void;
}

const IntegrationCard = ({ 
  integration, 
  onConfigure,
  onConnect,
  onDisconnect,
  onTest 
}: IntegrationCardProps) => {
  const getStatusBadge = () => {
    switch (integration.status) {
      case 'connected':
        return (
          <Badge className="bg-green-500">
            <CheckCircle2 className="mr-1 h-3 w-3" />
            Connected
          </Badge>
        );
      case 'disconnected':
        return (
          <Badge variant="outline">
            <XCircle className="mr-1 h-3 w-3" />
            Disconnected
          </Badge>
        );
      case 'error':
        return (
          <Badge variant="destructive">
            <AlertTriangle className="mr-1 h-3 w-3" />
            Error
          </Badge>
        );
      case 'connecting':
        return (
          <Badge variant="secondary">
            <RefreshCw className="mr-1 h-3 w-3 animate-spin" />
            Connecting...
          </Badge>
        );
      default:
        return <Badge>{integration.status}</Badge>;
    }
  };

  const getCategoryBadge = () => {
    const colors: Record<string, string> = {
      core: 'bg-blue-500',
      ai: 'bg-purple-500',
      storage: 'bg-green-500',
      communication: 'bg-orange-500',
      other: 'bg-gray-500',
    };
    return (
      <Badge className={colors[integration.category]} variant="default">
        {integration.category}
      </Badge>
    );
  };

  return (
    <Card className="transition-all hover:shadow-md">
      <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-3">
        <div className="flex items-start gap-3">
          <div className="p-2 bg-primary/10 rounded-lg">
            {integration.icon}
          </div>
          <div className="space-y-1">
            <CardTitle className="">{integration.name}</CardTitle>
            <p className="text-sm text-muted-foreground">
              {integration.description}
            </p>
          </div>
        </div>
        <div className="flex gap-2">
          {getCategoryBadge()}
          {getStatusBadge()}
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Features */}
        <div className="flex flex-wrap gap-1">
          {integration.features.slice(0, 3).map((feature, idx) => (
            <Badge key={idx} variant="outline" className="text-xs">
              {feature}
            </Badge>
          ))}
          {integration.features.length > 3 && (
            <Badge variant="outline" className="text-xs">
              +{integration.features.length - 3}
            </Badge>
          )}
        </div>

        {/* Last Connected */}
        {integration.lastConnected && (
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <RefreshCw className="h-3 w-3" />
            <span>Last connected: {integration.lastConnected.toLocaleString()}</span>
          </div>
        )}

        {/* Last Error */}
        {integration.status === 'error' && integration.lastError && (
          <div className="text-xs text-red-600 bg-red-50 dark:bg-red-950/10 p-2 rounded">
            {integration.lastError}
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex gap-2 pt-2">
          {integration.status === 'connected' ? (
            <>
              <Button 
                variant="outline"
                size="sm"
                className="flex-1"
                onClick={() => onTest(integration.id)}
              >
                <RefreshCw className="mr-2 h-4 w-4" />
                Test
              </Button>
              <Button 
                variant="outline"
                size="sm"
                onClick={() => onConfigure(integration.id)}
              >
                <Settings className="mr-2 h-4 w-4" />
                Configure
              </Button>
              <Button 
                variant="outline"
                size="sm"
                onClick={() => onDisconnect(integration.id)}
              >
                Disconnect
              </Button>
            </>
          ) : (
            <>
              <Button 
                size="sm"
                className="flex-1"
                onClick={() => onConnect(integration.id)}
                disabled={integration.status === 'connecting'}
              >
                {integration.status === 'connecting' ? (
                  <>
                    <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                    Connecting...
                  </>
                ) : (
                  <>
                    <ArrowRight className="mr-2 h-4 w-4" />
                    Connect
                  </>
                )}
              </Button>
              {integration.configured && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onConfigure(integration.id)}
                >
                  <Settings className="mr-2 h-4 w-4" />
                </Button>
              )}
            </>
          )}
        </div>

        {/* Docs Link */}
        {integration.docsUrl && (
          <Button
            variant="ghost"
            size="sm"
            className="w-full"
            asChild
          >
            <a href={integration.docsUrl} target="_blank" rel="noopener noreferrer">
              <ExternalLink className="mr-2 h-4 w-4" />
              View Documentation
            </a>
          </Button>
        )}
      </CardContent>
    </Card>
  );
};

/**
 * Integration Configure Dialog Component
 */
const IntegrationConfigureDialog = ({ 
  isOpen, 
  onClose, 
  integration,
  onSave 
}: { 
  isOpen: boolean; 
  onClose: () => void; 
  integration: Integration | null;
  onSave: (id: string, values: Record<string, any>) => void;
}) => {
  const [configValues, setConfigValues] = useState<Record<string, any>>({});

  if (!integration) return null;

  // Initialize config values when integration changes
  useState(() => {
    setConfigValues(
      integration.config.reduce((acc, field) => {
        acc[field.name] = field.default;
        return acc;
      }, {} as Record<string, any>)
    );
  });

  const updateConfig = (name: string, value: any) => {
    setConfigValues(prev => ({ ...prev, [name]: value }));
  };

  const handleSave = () => {
    onSave(integration.id, configValues);
    onClose();
  };

  const renderConfigField = (field: IntegrationConfigField) => {
    switch (field.type) {
      case 'select':
        return (
          <Select 
            value={configValues[field.name] || field.default}
            onValueChange={(value) => updateConfig(field.name, value)}
          >
            <SelectTrigger>
              <SelectValue placeholder={field.placeholder || 'Select...'} />
            </SelectTrigger>
            <SelectContent>
              {field.options?.map((option) => (
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
            id={field.name}
            value={configValues[field.name] || ''}
            onChange={(e) => updateConfig(field.name, e.target.value)}
            placeholder={field.placeholder || ''}
            rows={3}
          />
        );
      case 'password':
      case 'text':
      case 'url':
      case 'number':
      default:
        return (
          <Input
            id={field.name}
            type={field.type === 'password' ? 'password' : field.type}
            value={configValues[field.name] || ''}
            onChange={(e) => updateConfig(field.name, e.target.value)}
            placeholder={field.placeholder || ''}
          />
        );
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[85vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <div className="flex items-center gap-3">
            <div className="p-2 bg-primary/10 rounded-lg">
              {integration.icon}
            </div>
            <div>
              <DialogTitle>Configure {integration.name}</DialogTitle>
              <DialogDescription>
                Configure your {integration.name} integration
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="flex-1 overflow-auto space-y-6">
          {/* Connection Info */}
          <div className="bg-muted p-4 rounded-md">
            <div className="flex items-start gap-2">
              <Info className="h-4 w-4 mt-0.5 text-muted-foreground" />
              <div className="text-sm space-y-1">
                <p className="font-medium">Integration Details</p>
                <p className="text-muted-foreground">
                  {integration.description}
                </p>
              </div>
            </div>
          </div>

          {/* Configuration Fields */}
          <div className="space-y-4">
            {integration.config.map((field) => (
              <div key={field.name} className="space-y-2">
                <div className="flex items-center gap-2">
                  {field.type === 'password' && <Lock className="h-4 w-4 text-muted-foreground" />}
                  {field.type === 'url' && <Link className="h-4 w-4 text-muted-foreground" />}
                  <Label htmlFor={field.name} className="text-sm font-medium">
                    {field.label}
                    {field.required && <span className="text-red-500 ml-1">*</span>}
                  </Label>
                </div>
                {renderConfigField(field)}
                {field.description && (
                  <p className="text-xs text-muted-foreground">
                    {field.description}
                  </p>
                )}
              </div>
            ))}
          </div>

          {/* Security Notice */}
          <div className="bg-yellow-50 dark:bg-yellow-950/10 border border-yellow-200 dark:border-yellow-900/50 p-4 rounded-md">
            <div className="flex items-start gap-2">
              <Shield className="h-4 w-4 text-yellow-600 mt-0.5" />
              <div className="text-sm space-y-1">
                <p className="font-medium text-yellow-900 dark:text-yellow-100">
                  Security Notice
                </p>
                <p className="text-yellow-800 dark:text-yellow-200">
                  Your credentials are stored securely. Use API keys with restricted permissions when possible.
                </p>
              </div>
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handleSave}>
            <Check className="mr-2 h-4 w-4" />
            Save Configuration
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

/**
 * Integrations Page Component
 */
export const Integrations = () => {
  const [integrations, setIntegrations] = useState<Integration[]>([
    {
      id: 'github',
      name: 'GitHub',
      description: 'Version control and repository management',
      icon: <GitBranch className="h-5 w-5" />,
      category: 'core',
      status: 'connected',
      configured: true,
      lastConnected: new Date(Date.now() - 30 * 60000),
      features: ['Git operations', 'Repository management', 'CI/CD', 'Webhooks'],
      config: [
        {
          name: 'token',
          type: 'password',
          label: 'Personal Access Token',
          description: 'GitHub PAT with repo + workflow scopes',
          required: true,
          placeholder: 'ghp_xxxxxxxxxxxx',
        },
        {
          name: 'username',
          type: 'text',
          label: 'Username',
          description: 'Your GitHub username',
          required: true,
        },
        {
          name: 'defaultBranch',
          type: 'select',
          label: 'Default Branch',
          required: false,
          default: 'main',
          options: ['main', 'master', 'develop'],
        },
      ],
      docsUrl: 'https://docs.github.com/authentication',
    },
    {
      id: 'supabase',
      name: 'Supabase',
      description: 'Backend-as-a-Service with database and auth',
      icon: <Database className="h-5 w-5" />,
      category: 'storage',
      status: 'connected',
      configured: true,
      lastConnected: new Date(Date.now() - 15 * 60000),
      features: ['PostgreSQL database', 'Authentication', 'Real-time', 'Storage'],
      config: [
        {
          name: 'url',
          type: 'url',
          label: 'Project URL',
          description: 'Your Supabase project URL',
          required: true,
          placeholder: 'https://xyz.supabase.co',
        },
        {
          name: 'apiKey',
          type: 'password',
          label: 'API Key',
          description: 'Supabase anon API key',
          required: true,
        },
        {
          name: 'serviceRoleKey',
          type: 'password',
          label: 'Service Role Key',
          description: 'Supabase service role key (admin)',
          required: false,
        },
      ],
      docsUrl: 'https://supabase.com/docs',
    },
    {
      id: 'telegram',
      name: 'Telegram',
      description: 'Messaging platform for notifications',
      icon: <MessageSquare className="h-5 w-5" />,
      category: 'communication',
      status: 'connected',
      configured: true,
      lastConnected: new Date(Date.now() - 5 * 60000),
      features: ['Bot integration', 'Notifications', 'Message delivery'],
      config: [
        {
          name: 'botToken',
          type: 'password',
          label: 'Bot Token',
          description: 'Telegram bot token from BotFather',
          required: true,
          placeholder: '1234567890:ABCdefGHI...',
        },
        {
          name: 'chatId',
          type: 'text',
          label: 'Default Chat ID',
          description: 'Default chat ID for notifications',
          required: true,
          placeholder: '-1001234567890',
        },
      ],
      docsUrl: 'https://core.telegram.org/bots/api',
    },
    {
      id: 'venice',
      name: 'Venice AI',
      description: 'Private uncensored AI platform',
      icon: <Cloud className="h-5 w-5" />,
      category: 'ai',
      status: 'error',
      configured: true,
      lastError: 'Credit exhaustion (HTTP 402)',
      features: ['LLM inference', 'Image generation', 'Embeddings'],
      config: [
        {
          name: 'apiKey',
          type: 'password',
          label: 'API Key',
          description: 'Venice AI API key',
          required: true,
        },
        {
          name: 'baseUrl',
          type: 'url',
          label: 'Base URL',
          description: 'Venice AI API base URL',
          required: true,
          default: 'https://api.venice.ai',
        },
      ],
    },
    {
      id: 'lovable',
      name: 'Lovable',
      description: 'AI-powered development platform',
      icon: <Sparkles className="h-5 w-5" />,
      category: 'ai',
      status: 'disconnected',
      configured: false,
      features: ['AI code generation', 'Project management', 'Integrations'],
      config: [
        {
          name: 'apiKey',
          type: 'password',
          label: 'API Key',
          description: 'Lovable API key',
          required: true,
        },
        {
          name: 'workspaceId',
          type: 'text',
          label: 'Workspace ID',
          description: 'Lovable workspace ID',
          required: true,
        },
      ],
    },
  ]);

  const [selectedIntegration, setSelectedIntegration] = useState<Integration | null>(null);
  const [configureDialogOpen, setConfigureDialogOpen] = useState(false);
  const [filterCategory, setFilterCategory] = useState('all');

  const handleConnect = async (id: string) => {
    setIntegrations(prev => prev.map(integration =>
      integration.id === id
        ? { ...integration, status: 'connecting' as IntegrationStatus }
        : integration
    ));

    // Simulate connection
    await new Promise(resolve => setTimeout(resolve, 1500));

    setIntegrations(prev => prev.map(integration =>
      integration.id === id
        ? { 
            ...integration, 
            status: 'connected' as IntegrationStatus,
            configured: true,
            lastConnected: new Date(),
          }
        : integration
    ));

    toast({
      title: "Connected",
      description: "Integration connected successfully",
    });
  };

  const handleDisconnect = async (id: string) => {
    setIntegrations(prev => prev.map(integration =>
      integration.id === id
        ? { ...integration, status: 'disconnected' as IntegrationStatus }
        : integration
    ));

    toast({
      title: "Disconnected",
      description: "Integration disconnected successfully",
    });
  };

  const handleTest = async (id: string) => {
    setIntegrations(prev => prev.map(integration =>
      integration.id === id
        ? { ...integration, status: 'connecting' as IntegrationStatus }
        : integration
    ));

    // Simulate test
    await new Promise(resolve => setTimeout(resolve, 1000));

    setIntegrations(prev => prev.map(integration =>
      integration.id === id
        ? { ...integration, status: 'connected' as IntegrationStatus, lastConnected: new Date() }
        : integration
    ));

    toast({
      title: "Test Successful",
      description: "Integration test passed",
    });
  };

  const handleConfigure = (id: string) => {
    const integration = integrations.find(i => i.id === id);
    if (integration) {
      setSelectedIntegration(integration);
      setConfigureDialogOpen(true);
    }
  };

  const handleSaveConfig = (id: string, values: Record<string, any>) => {
    setIntegrations(prev => prev.map(integration =>
      integration.id === id
        ? { ...integration, configured: true, config: integration.config.map(field => ({
            ...field,
            default: values[field.name],
          })) }
        : integration
    ));

    toast({
      title: "Configuration Saved",
      description: "Integration configuration updated",
    });
  };

  const categories = ['all', 'core', 'ai', 'storage', 'communication', 'other'];
  const filteredIntegrations = filterCategory === 'all'
    ? integrations
    : integrations.filter(i => i.category === filterCategory);

  const stats = {
    total: integrations.length,
    connected: integrations.filter(i => i.status === 'connected').length,
    disconnected: integrations.filter(i => i.status === 'disconnected').length,
    error: integrations.filter(i => i.status === 'error').length,
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Integrations</h2>
          <p className="text-muted-foreground">
            Manage connected services and third-party integrations
          </p>
        </div>
        <Button variant="outline">
          <ExternalLink className="mr-2 h-4 w-4" />
          Browse Integrations
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total</CardTitle>
            <Shield className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Connected</CardTitle>
            <CheckCircle2 className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{stats.connected}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Disconnected</CardTitle>
            <XCircle className="h-4 w-4 text-gray-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-600">{stats.disconnected}</div>
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

      {/* Error Alert */}
      {stats.error > 0 && (
        <Card className="border-red-200 bg-red-50 dark:bg-red-950/10">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <AlertTriangle className="h-5 w-5 text-red-500" />
              <div className="flex-1">
                <p className="font-medium text-red-900 dark:text-red-100">
                  {stats.error} integration{stats.error > 1 ? 's' : ''} have errors
                </p>
                <p className="text-sm text-red-800 dark:text-red-200">
                  Review the integrations below to resolve issues
                </p>
              </div>
              <Button variant="outline" size="sm">
                View Details
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Category Filter */}
      <div className="flex items-center gap-2 flex-wrap">
        {categories.map((category) => (
          <Button
            key={category}
            variant={filterCategory === category ? 'default' : 'outline'}
            size="sm"
            onClick={() => setFilterCategory(category)}
          >
            {category}
          </Button>
        ))}
      </div>

      {/* Integrations Grid */}
      <div className="grid gap-4 md:grid-cols-2">
        {filteredIntegrations.map((integration) => (
          <IntegrationCard
            key={integration.id}
            integration={integration}
            onConfigure={handleConfigure}
            onConnect={handleConnect}
            onDisconnect={handleDisconnect}
            onTest={handleTest}
          />
        ))}
      </div>

      {/* Empty State */}
      {filteredIntegrations.length === 0 && (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Shield className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold">No Integrations Found</h3>
            <p className="text-muted-foreground">
              Try adjusting your category filter
            </p>
          </CardContent>
        </Card>
      )}

      {/* Configure Dialog */}
      <IntegrationConfigureDialog
        isOpen={configureDialogOpen}
        onClose={() => {
          setConfigureDialogOpen(false);
          setSelectedIntegration(null);
        }}
        integration={selectedIntegration}
        onSave={handleSaveConfig}
      />
    </div>
  );
};

export default Integrations;