# Supabase Setup Guide for Hermes Dashboard

Complete setup instructions for integrating Supabase backend with the Hermes Dashboard.

## Prerequisites

- Supabase account (free tier is sufficient)
- Existing Supabase project with ID: `fizqphhtbdnvywvmtkyl`
- Node.js and npm installed

## Step 1: Get Your Supabase Credentials

1. Go to [https://supabase.com/dashboard](https://supabase.com/dashboard)
2. Navigate to your project: `fizqphhtbdnvywvmtkyl`
3. Go to **Settings** → **API**
4. Copy the following information:
   - **Project URL**: `https://fizqphhtbdnvywvmtkyl.supabase.co`
   - **anon/public key**: Found under "Project API keys"

## Step 2: Configure Environment Variables

1. Open `.env.local` in the project root
2. Replace the placeholders with your actual credentials:

```bash
VITE_SUPABASE_URL=https://fizqphhtbdnvywvmtkyl.supabase.co
VITE_SUPABASE_ANON_KEY=your_actual_anon_key_here
```

3. Save the file

## Step 3: Import Database Schema

There are two ways to import the database schema:

### Option A: Using Supabase Dashboard (Recommended)

1. Go to [https://supabase.com/dashboard/project/fizqphhtbdnvywvmtkyl/sql/editor](https://supabase.com/dashboard/project/fizqphhtbdnvywvmtkyl/sql/editor)
2. Click "New Query"
3. Copy the entire contents of `supabase/schema.sql`
4. Paste it into the SQL editor
5. Click "Run" to execute

This will create all required tables, indexes, RLS policies, and triggers.

### Option B: Using Supabase CLI

If you have the Supabase CLI installed:

```bash
supabase db push --db-url "postgresql://postgres:[YOUR-PASSWORD]@db.fizqphhtbdnvywvmtkyl.supabase.co:5432/postgres" < supabase/schema.sql
```

## Step 4: Enable Email Authentication

1. Go to **Authentication** → **Providers** in your Supabase dashboard
2. Click on **Email**
3. Ensure "Enable Email provider" is toggled ON
4. Configure email settings if needed (Supabase provides default email sending)

## Step 5: Create Test User

### Option A: Via Supabase Dashboard

1. Go to **Authentication** → **Users**
2. Click "Add User"
3. Create a user with email and password
4. The user will be automatically created and sent a confirmation email

### Option B: Via the Login Page

1. Start your development server: `npm run dev`
2. Navigate to `http://localhost:8080/login`
3. Click "Sign Up"
4. Enter an email and password
5. Follow the confirmation email sent by Supabase

## Step 6: Verify Database Setup

Run the following checks in your Supabase SQL editor:

```sql
-- Check if tables exist
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
ORDER BY table_name;
```

Expected output:
- memory
- settings
- sessions
- tasks
- tool_executions
- cron_jobs

```sql
-- Check if RLS is enabled
SELECT tablename, rowsecurity 
FROM pg_tables 
WHERE schemaname = 'public';
```

All tables should have `rowsecurity = true`.

## Step 7: Test the Integration

1. Start the development server:
   ```bash
   npm run dev
   ```

2. Open your browser to `http://localhost:8080`

3. You should be redirected to the login page

4. Sign in with your test credentials

5. Once authenticated, you should see the dashboard

## Database Schema Overview

### Tables Created:

1. **sessions**: Stores agent session data
   - id, user_id, key, title, started_at, finished_at, status, etc.

2. **tasks**: Task management data
   - id, user_id, session_id, title, status, priority, tags, etc.

3. **cron_jobs**: Scheduled job information
   - id, user_id, job_id, name, schedule, enabled, last_run_at, etc.

4. **memory**: Agent memory entries
   - id, user_id, target, action, content, etc.

5. **tool_executions**: Tool execution history
   - id, user_id, session_id, tool_name, parameters, status, etc.

6. **settings**: User settings and preferences
   - id, user_id, config, theme, notifications_enabled, etc.

### Security Features:

- **Row Level Security (RLS)**: Each table has RLS enabled
- **User Isolation**: Users can only access their own data
- **Automatic Timestamps**: created_at and updated_at managed via triggers
- **Foreign Key Constraints**: Data integrity enforced

## Troubleshooting

### Issue: "Missing Supabase environment variables"

**Solution**: 
- Make sure `.env.local` exists in the project root
- Verify both `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` are set
- Restart the dev server after adding/changing environment variables

### Issue: "Invalid API key"

**Solution**:
- Double-check you're using the **anon/public key**, not the service_role key
- Ensure you copied the entire key without any extra spaces

### Issue: "Table not found" error

**Solution**:
- Run the schema import again (Step 3)
- Check the Supabase SQL editor for any error messages during import
- Verify all tables were created in the Table Editor

### Issue: "Permission denied" errors

**Solution**:
- Verify RLS policies were created during schema import
- Check that the policies allow users to access their own data
- Ensure you're authenticated when making API calls

### Issue: Email confirmation not working

**Solution**:
- Check Supabase dashboard → Authentication → Email settings
- Verify email provider is working (default should work)
- Check spam folder for confirmation email
- Disable email confirmation for testing (not recommended for production)

## API Usage Examples

### Working with Sessions

```typescript
import { api } from './lib/api';

// List all sessions
const sessions = await api.sessions.list();

// Create a new session
const newSession = await api.sessions.create({
  user_id: userId,
  key: 'session-key-123',
  title: 'Research Project',
  status: 'active',
});

// Update session status
const updated = await api.sessions.update(sessionId, {
  status: 'completed',
  finished_at: new Date().toISOString(),
});
```

### Working with Tasks

```typescript
// List all tasks
const tasks = await api.tasks.list();

// Filter by status
const pendingTasks = await api.tasks.filterByStatus('pending');

// Create a task
const newTask = await api.tasks.create({
  user_id: userId,
  title: 'Complete dashboard',
  description: 'Finish the Supabase integration',
  status: 'pending',
  priority: 'high',
});
```

### Real-time Subscriptions

```typescript
import { api } from './lib/api';

// Subscribe to task changes
const subscription = api.realtime.onTasksChange((payload) => {
  console.log('Task changed:', payload);
  // Update your UI here
});

// Cleanup on unmount
return () => subscription.unsubscribe();
```

## Next Steps

After completing Supabase setup:

1. **Update Pages**: Replace local storage with Supabase API calls
2. **Add Real-time Features**: Implement live updates using subscriptions
3. **Test CRUD Operations**: Verify all database operations work correctly
4. **Error Handling**: Add proper error handling for database operations
5. **Performance**: Optimize queries and add caching where needed

## Security Best Practices

1. **Never expose service_role key**: Only use anon/public key in frontend
2. **Enable RLS**: Keep RLS enabled on all tables
3. **User-specific data**: Ensure all queries filter by `user_id`
4. **Validate inputs**: Always validate data before database operations
5. **Use environment variables**: Never hardcode credentials

## Resources

- [Supabase Documentation](https://supabase.com/docs)
- [Supabase JavaScript Client](https://supabase.com/docs/reference/javascript)
- [Row Level Security Guide](https://supabase.com/docs/guides/auth/row-level-security)
- [Realtime Subscriptions](https://supabase.com/docs/guides/realtime)

---

**Setup Status**: ✅ Schema Created | ⏳ Pending: Credentials & User Setup

For questions or issues, check the troubleshooting section above.