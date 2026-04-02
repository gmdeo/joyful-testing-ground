/**
 * Hermes CLI Wrapper Utilities
 * Executes Hermes CLI commands and parses output
 */

const { execSync, spawn } = require('child_process');
const { promisify } = require('util');
const execAsync = promisify(require('child_process').exec);

const HERMES_CLI = process.env.HERMES_CLI || '/home/mm/.local/bin/hermes';

/**
 * Execute Hermes CLI command and return parsed output
 */
async function executeHermesCommand(command, options = {}) {
  try {
    const { stdout, stderr } = await execAsync(
      `${HERMES_CLI} ${command}`,
      {
        encoding: 'utf8',
        maxBuffer: 10 * 1024 * 1024, // 10MB buffer for large outputs
        timeout: options.timeout || 30000, // 30 second default timeout
        ...options
      }
    );

    if (stderr && options.verbose) {
      console.log(`Hermes CLI stderr: ${stderr}`);
    }

    return {
      success: true,
      stdout: stdout.trim(),
      stderr: stderr?.trim()
    };
  } catch (error) {
    console.error(`Hermes CLI error for command: ${command}`);
    console.error(`Error: ${error.message}`);

    return {
      success: false,
      error: error.message,
      stderr: error.stderr?.trim()
    };
  }
}

/**
 * Get Hermes status
 */
async function getStatus() {
  const result = await executeHermesCommand('status');

  if (!result.success) {
    throw new Error(`Failed to get status: ${result.error}`);
  }

  return parseStatus(result.stdout);
}

/**
 * Get active sessions
 */
async function getSessions(limit = 20) {
  const result = await executeHermesCommand(`sessions list --limit ${limit}`);

  if (!result.success) {
    throw new Error(`Failed to get sessions: ${result.error}`);
  }

  return parseSessions(result.stdout);
}

/**
 * Get session details
 */
async function getSessionDetails(sessionId) {
  const result = await executeHermesCommand(`sessions browse --session ${sessionId}`);

  if (!result.success) {
    throw new Error(`Failed to get session details: ${result.error}`);
  }

  return parseSessionDetails(result.stdout);
}

/**
 * Delete a session
 */
async function deleteSession(sessionId) {
  const result = await executeHermesCommand(`sessions delete ${sessionId} --confirm`);

  if (!result.success) {
    throw new Error(`Failed to delete session: ${result.error}`);
  }

  return { success: true, sessionId };
}

/**
 * Rename a session
 */
async function renameSession(sessionId, newName) {
  const result = await executeHermesCommand(`sessions rename ${sessionId} "${newName}"`);

  if (!result.success) {
    throw new Error(`Failed to rename session: ${result.error}`);
  }

  return { success: true, sessionId, name: newName };
}

/**
 * Get cron jobs
 */
async function getCronJobs() {
  const result = await executeHermesCommand('cron list');

  if (!result.success) {
    throw new Error(`Failed to get cron jobs: ${result.error}`);
  }

  return parseCronJobs(result.stdout);
}

/**
 * Create a cron job
 */
async function createCronJob(config) {
  const {
    name,
    schedule,
    repeat,
    prompt,
    skills = [],
    deliver = 'origin',
    action = 'create'
  } = config;

  const skillsArg = skills.length > 0 ? `--skills "${skills.join(',')}"` : '';
  const repeatArg = repeat ? `--repeat ${repeat}` : '';
  const deliverArg = deliver ? `--deliver ${deliver}` : '';

  const command = `cron ${action} --name "${name}" --schedule "${schedule}" ${repeatArg} ${deliverArg} ${skillsArg} "${prompt}"`;

  const result = await executeHermesCommand(command);

  if (!result.success) {
    throw new Error(`Failed to create cron job: ${result.error}`);
  }

  return parseCronJobCreated(result.stdout);
}

/**
 * Edit a cron job
 */
async function editCronJob(jobId, updates) {
  const updatesArray = [];

  if (updates.name) updatesArray.push(`--name "${updates.name}"`);
  if (updates.schedule) updatesArray.push(`--schedule "${updates.schedule}"`);
  if (updates.prompt) updatesArray.push(`--prompt "${updates.prompt}"`);
  if (updates.deliver) updatesArray.push(`--deliver "${updates.deliver}"`);
  if (updates.repeat) updatesArray.push(`--repeat ${updates.repeat}`);

  const command = `cron update ${jobId} ${updatesArray.join(' ')}`;

  const result = await executeHermesCommand(command);

  if (!result.success) {
    throw new Error(`Failed to edit cron job: ${result.error}`);
  }

  return { success: true, jobId, updates };
}

/**
 * Pause a cron job
 */
async function pauseCronJob(jobId) {
  const result = await executeHermesCommand(`cron pause ${jobId}`);

  if (!result.success) {
    throw new Error(`Failed to pause cron job: ${result.error}`);
  }

  return { success: true, jobId, status: 'paused' };
}

/**
 * Resume a cron job
 */
async function resumeCronJob(jobId) {
  const result = await executeHermesCommand(`cron resume ${jobId}`);

  if (!result.success) {
    throw new Error(`Failed to resume cron job: ${result.error}`);
  }

  return { success: true, jobId, status: 'active' };
}

/**
 * Run a cron job immediately
 */
async function runCronJob(jobId) {
  const result = await executeHermesCommand(`cron run ${jobId}`);

  if (!result.success) {
    throw new Error(`Failed to run cron job: ${result.error}`);
  }

  return { success: true, jobId, executedAt: new Date().toISOString() };
}

/**
 * Delete a cron job
 */
async function deleteCronJob(jobId) {
  const result = await executeHermesCommand(`cron remove ${jobId}`);

  if (!result.success) {
    throw new Error(`Failed to delete cron job: ${result.error}`);
  }

  return { success: true, jobId };
}

/**
 * Start a new chat session
 */
async function startChat(prompt, options = {}) {
  const {
    sessionName,
    skills = [],
    model,
    provider
  } = options;

  const skillsArg = skills.length > 0 ? `--skills "${skills.join(',')}"` : '';
  const modelArg = model ? `--model "${model}"` : '';
  const providerArg = provider ? `--provider "${provider}"` : '';

  const command = `chat --prompt "${prompt}" ${skillsArg} ${modelArg} ${providerArg} --no-interactive`;

  const result = await executeHermesCommand(command, { timeout: 60000 }); // 60 second timeout for chat

  if (!result.success) {
    throw new Error(`Failed to start chat: ${result.error}`);
  }

  return parseChatResponse(result.stdout);
}

/**
 * Send message in existing session
 */
async function sendMessage(sessionId, message) {
  // This would require more complex implementation to interact with existing sessions
  // For now, we'll create a stub
  throw new Error('sendMessage not yet implemented - requires session state management');
}

/**
 * Get memory entries
 */
async function getMemory() {
  const result = await executeHermesCommand('memory list');

  if (!result.success) {
    throw new Error(`Failed to get memory: ${result.error}`);
  }

  return parseMemory(result.stdout);
}

/**
 * Add memory entry
 */
async function addMemory(target, content, action = 'add') {
  const command = `memory --target ${target} --action ${action} "${content}"`;

  const result = await executeHermesCommand(command);

  if (!result.success) {
    throw new Error(`Failed to add memory: ${result.error}`);
  }

  return { success: true, target, content, action };
}

// ============================================================================
// PARSING FUNCTIONS
// ============================================================================

function parseStatus(output) {
  const status = {
    environment: {},
    apiKeys: {},
    authProviders: {},
    terminalBackend: {},
    messagingPlatforms: {},
    gatewayService: {},
    scheduledJobs: {},
    sessions: {}
  };

  const lines = output.split('\n');
  let currentSection = null;

  for (const line of lines) {
    const trimmed = line.trim();

    if (trimmed.startsWith('◆')) {
      currentSection = trimmed.substring(2).trim();
    } else if (currentSection && trimmed.includes('✓')) {
      const [key, value] = trimmed.split('✓').map(s => s.trim());

      switch (currentSection) {
        case 'Environment':
          if (key === 'Model') status.environment.model = value;
          if (key === 'Provider') status.environment.provider = value;
          break;
        case 'Gateway Service':
          if (key === 'Status') status.gatewayService.status = value;
          break;
        case 'Messaging Platforms':
          if (key.includes('configured')) {
            const platform = key.replace('configured', '').trim().toLowerCase();
            status.messagingPlatforms[platform] = { status: 'configured' };
          }
          break;
        case 'Scheduled Jobs':
          if (key.includes('active') || key.includes('total')) {
            status.scheduledJobs[key] = value;
          }
          break;
        case 'Sessions':
          if (key.includes('session')) {
            status.sessions[key] = value;
          }
          break;
      }
    }
  }

  return status;
}

function parseSessions(output) {
  const sessions = [];
  const lines = output.split('\n');

  // Find the data section (after the headers)
  let dataStarted = false;
  const separatorLine = '──────────────────';

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];

    // We've found the separator line, next lines are data
    if (line.includes(separatorLine) && !dataStarted) {
      dataStarted = true;
      continue;
    }

    // Skip lines before separator
    if (!dataStarted) {
      continue;
    }

    // Skip empty lines or lines with only separators
    if (!line.trim() || line.trim().startsWith('─')) {
      continue;
    }

    // Parse session line
    // Format has variable width columns, so we need to parse from the end
    const trimmed = line.trim();

    // Find the ID (last column - like "20260402_014556_a70e6f")
    const idMatch = trimmed.match(/([a-zA-Z0-9_]+)$/);
    if (!idMatch) {
      continue; // Skip if no ID found
    }

    const id = idMatch[1];

    // Find the source (second to last column - like "telegram" or "cli")
    const sourceMatch = trimmed.match(/(telegram|cli|whatsapp|discord|api)\s+[a-zA-Z0-9_]+$/);
    const source = sourceMatch ? sourceMatch[1] : 'cli';

    // Find the last active time (like "6m ago", "11m ago")
    const timeMatch = trimmed.match(/(\d+[mhd]\s+ago|now)/i);
    const lastActive = timeMatch ? timeMatch[0] : trimmed.replace(sourceMatch ? sourceMatch[0] : '', '').replace(idMatch[0], '').trim();

    // The rest is the title (first variable-width column)
    const titleParts = trimmed.split(/\s+/);
    // Remove ID, source, and last active from the end
    let titleEndIndex = trimmed.length;
    if (idMatch) {
      titleEndIndex = Math.min(titleEndIndex, trimmed.lastIndexOf(idMatch[0]));
    }
    if (sourceMatch) {
      titleEndIndex = Math.min(titleEndIndex, trimmed.lastIndexOf(sourceMatch[1]));
    }
    if (timeMatch) {
      titleEndIndex = Math.min(titleEndIndex, trimmed.toLowerCase().lastIndexOf(timeMatch[1]));
    }

    const title = trimmed.substring(0, titleEndIndex).trim();

    sessions.push({
      id,
      title: title || 'Untitled Session',
      lastActive: parseRelativeTime(lastActive),
      source
    });
  }

  return sessions;
}

function parseSessionDetails(output) {
  // Parse detailed session information
  return {
    messages: output.split('\n').map(line => ({
      content: line,
      timestamp: new Date()
    }))
  };
}

function parseCronJobs(output) {
  const jobs = [];

  const lines = output.split('\n');
  let currentJob = null;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const trimmed = line.trim();

    // Skip table headers and dividers
    if (trimmed.startsWith('│') || trimmed.startsWith('┌') || trimmed.startsWith('└') ||
        trimmed.startsWith('─') || trimmed === 'Scheduled Jobs' ||
        trimmed === '') {
      continue;
    }

    // Match job ID and status (e.g., "4b2cf746 [active]")
    const jobMatch = trimmed.match(/^(\w+)\s*\[(\w+)\]$/);
    if (jobMatch) {
      // If we have a current job, add it to jobs list
      if (currentJob && currentJob.id) {
        jobs.push(currentJob);
      }

      // Start a new job
      currentJob = {
        id: jobMatch[1],
        status: jobMatch[2],
        name: '',
        schedule: '',
        repeat: null,
        nextRun: null,
        deliver: 'origin',
        skills: []
      };
    } else if (trimmed && !trimmed.startsWith('│') && !trimmed.startsWith('─')) {
      // Parse job properties (e.g., "Name:      Daily Product Builder")
      const colonIndex = trimmed.indexOf(':');
      if (colonIndex > -1 && currentJob) {
        const key = trimmed.substring(0, colonIndex).trim();
        const value = trimmed.substring(colonIndex + 1).trim();

        const keyLower = key.toLowerCase();

        if (keyLower === 'name') currentJob.name = value;
        if (keyLower === 'schedule') currentJob.schedule = value;
        if (keyLower === 'repeat') {
          // Parse "∞" as infinity
          currentJob.repeat = value === '∞' ? Infinity : parseInt(value);
        }
        if (keyLower === 'next run') currentJob.nextRun = value;
        if (keyLower === 'deliver') currentJob.deliver = value;
        if (keyLower === 'skills') {
          // Parse skills list "skill1, skill2, skill3"
          if (value === '[]') {
            currentJob.skills = [];
          } else {
            currentJob.skills = value.split(',').map(s => s.trim());
          }
        }
      }
    }
  }

  // Add the last job if exists
  if (currentJob && currentJob.id) {
    jobs.push(currentJob);
  }

  return jobs;
}

function parseCronJobCreated(output) {
  // Extract job ID from output
  const idMatch = output.match(/(\w+)\s*\[.*?\]/);
  return {
    id: idMatch ? idMatch[1] : null,
    output
  };
}

function parseChatResponse(output) {
  // Parse chat response
  return {
    response: output,
    timestamp: new Date()
  };
}

function parseMemory(output) {
  // Parse memory entries
  const entries = [];

  const lines = output.split('\n');
  lines.forEach(line => {
    if (line.trim()) {
      entries.push({
        content: line.trim(),
        timestamp: new Date()
      });
    }
  });

  return entries;
}

function parseRelativeTime(timeStr) {
  // Parse relative time strings like "1m ago", "13m ago", "29m ago"
  const match = timeStr.match(/(\d+)([mhd])?\s*ago/);

  if (!match) {
    return new Date().toISOString();
  }

  const value = parseInt(match[1]);
  const unit = match[2] || 'm';

  const now = new Date();

  switch (unit) {
    case 'm':
      now.setMinutes(now.getMinutes() - value);
      break;
    case 'h':
      now.setHours(now.getHours() - value);
      break;
    case 'd':
      now.setDate(now.getDate() - value);
      break;
  }

  return now.toISOString();
}

module.exports = {
  getStatus,
  getSessions,
  getSessionDetails,
  deleteSession,
  renameSession,
  getCronJobs,
  createCronJob,
  editCronJob,
  pauseCronJob,
  resumeCronJob,
  runCronJob,
  deleteCronJob,
  startChat,
  sendMessage,
  getMemory,
  addMemory,
  executeHermesCommand
};