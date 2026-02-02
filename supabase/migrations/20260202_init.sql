-- Mission Control Schema
-- Tables for AI Agent coordination dashboard

-- Agents table
CREATE TABLE IF NOT EXISTS agents (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    role TEXT NOT NULL,
    anime TEXT,
    emoji TEXT,
    avatar_url TEXT,
    level TEXT DEFAULT 'SPC' CHECK (level IN ('LEAD', 'SPC', 'INT')),
    status TEXT DEFAULT 'idle' CHECK (status IN ('idle', 'working', 'done', 'blocked')),
    current_task TEXT,
    color TEXT,
    session_key TEXT,
    last_heartbeat TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Tasks table
CREATE TABLE IF NOT EXISTS tasks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    description TEXT,
    status TEXT DEFAULT 'inbox' CHECK (status IN ('inbox', 'assigned', 'in_progress', 'review', 'done', 'blocked')),
    priority TEXT DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'urgent')),
    tags TEXT[] DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Task assignees (many-to-many)
CREATE TABLE IF NOT EXISTS task_assignees (
    task_id UUID REFERENCES tasks(id) ON DELETE CASCADE,
    agent_id TEXT REFERENCES agents(id) ON DELETE CASCADE,
    assigned_at TIMESTAMPTZ DEFAULT NOW(),
    PRIMARY KEY (task_id, agent_id)
);

-- Activities table (feed)
CREATE TABLE IF NOT EXISTS activities (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    type TEXT NOT NULL CHECK (type IN ('task_created', 'task_moved', 'task_completed', 'comment_added', 'agent_started', 'agent_finished', 'status_changed')),
    agent_id TEXT REFERENCES agents(id) ON DELETE SET NULL,
    task_id UUID REFERENCES tasks(id) ON DELETE SET NULL,
    message TEXT NOT NULL,
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Comments table
CREATE TABLE IF NOT EXISTS comments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    task_id UUID REFERENCES tasks(id) ON DELETE CASCADE,
    agent_id TEXT REFERENCES agents(id) ON DELETE SET NULL,
    content TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable realtime for all tables
ALTER PUBLICATION supabase_realtime ADD TABLE agents;
ALTER PUBLICATION supabase_realtime ADD TABLE tasks;
ALTER PUBLICATION supabase_realtime ADD TABLE activities;
ALTER PUBLICATION supabase_realtime ADD TABLE comments;

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_activities_created_at ON activities(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_activities_agent_id ON activities(agent_id);
CREATE INDEX IF NOT EXISTS idx_tasks_status ON tasks(status);
CREATE INDEX IF NOT EXISTS idx_comments_task_id ON comments(task_id);

-- RLS Policies (open for now, can restrict later)
ALTER TABLE agents ENABLE ROW LEVEL SECURITY;
ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE activities ENABLE ROW LEVEL SECURITY;
ALTER TABLE comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE task_assignees ENABLE ROW LEVEL SECURITY;

-- Allow all operations for authenticated and anon (dashboard access)
CREATE POLICY "Allow all on agents" ON agents FOR ALL USING (true);
CREATE POLICY "Allow all on tasks" ON tasks FOR ALL USING (true);
CREATE POLICY "Allow all on activities" ON activities FOR ALL USING (true);
CREATE POLICY "Allow all on comments" ON comments FOR ALL USING (true);
CREATE POLICY "Allow all on task_assignees" ON task_assignees FOR ALL USING (true);

-- Insert initial agents
INSERT INTO agents (id, name, role, anime, emoji, level, status, color) VALUES
    ('hoyuelo', 'Hoyuelo', 'Lead Coordinator', 'Mob Psycho 100', '😊', 'LEAD', 'working', '#22c55e'),
    ('reigen', 'Reigen', 'Business & Strategy', 'Mob Psycho 100', '🎩', 'SPC', 'idle', '#eab308'),
    ('robin', 'Robin', 'Research & Analysis', 'One Piece', '📚', 'SPC', 'idle', '#8b5cf6'),
    ('franky', 'Franky', 'Developer', 'One Piece', '🤖', 'SPC', 'idle', '#3b82f6'),
    ('nanami', 'Nanami', 'Project Management', 'Jujutsu Kaisen', '👔', 'SPC', 'idle', '#6366f1'),
    ('frieren', 'Frieren', 'Documentation', 'Frieren', '❄️', 'SPC', 'idle', '#06b6d4'),
    ('maomao', 'Maomao', 'Code Review', 'Apothecary Diaries', '🧪', 'SPC', 'idle', '#ec4899'),
    ('rimuru', 'Rimuru', 'UI/UX Lead', 'Slime', '🔵', 'SPC', 'done', '#0ea5e9')
ON CONFLICT (id) DO NOTHING;

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers for updated_at
CREATE TRIGGER agents_updated_at BEFORE UPDATE ON agents
    FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER tasks_updated_at BEFORE UPDATE ON tasks
    FOR EACH ROW EXECUTE FUNCTION update_updated_at();
