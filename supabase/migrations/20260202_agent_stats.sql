-- Agent Stats System (RPG/Tamagotchi style)
-- No tokens needed - all SQL triggers and calculations

-- 1. Agent Stats Table
CREATE TABLE IF NOT EXISTS agent_stats (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  agent_id TEXT UNIQUE NOT NULL,
  
  -- XP & Level
  xp INTEGER DEFAULT 0,
  level INTEGER DEFAULT 1,
  
  -- Activity tracking
  tasks_completed INTEGER DEFAULT 0,
  tasks_failed INTEGER DEFAULT 0,
  total_tasks INTEGER DEFAULT 0,
  
  -- Streaks
  current_streak INTEGER DEFAULT 0,
  best_streak INTEGER DEFAULT 0,
  last_active_at TIMESTAMPTZ DEFAULT NOW(),
  
  -- Mood (calculated based on activity)
  mood TEXT DEFAULT 'idle' CHECK (mood IN ('happy', 'working', 'idle', 'sleeping', 'frustrated')),
  
  -- Specializations (JSON array of tags they're good at)
  specializations JSONB DEFAULT '[]'::jsonb,
  
  -- Achievements (JSON array of achievement IDs)
  achievements JSONB DEFAULT '[]'::jsonb,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Achievements Table
CREATE TABLE IF NOT EXISTS achievements (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  icon TEXT DEFAULT '🏆',
  xp_reward INTEGER DEFAULT 10,
  condition_type TEXT NOT NULL, -- 'tasks_completed', 'streak', 'level', 'custom'
  condition_value INTEGER DEFAULT 1
);

-- 3. Insert default achievements
INSERT INTO achievements (id, name, description, icon, xp_reward, condition_type, condition_value) VALUES
  ('first_task', 'First Steps', 'Complete your first task', '🎯', 10, 'tasks_completed', 1),
  ('task_10', 'Getting Started', 'Complete 10 tasks', '⭐', 25, 'tasks_completed', 10),
  ('task_50', 'Workhorse', 'Complete 50 tasks', '🐴', 50, 'tasks_completed', 50),
  ('task_100', 'Century', 'Complete 100 tasks', '💯', 100, 'tasks_completed', 100),
  ('streak_3', 'On Fire', '3 day streak', '🔥', 15, 'streak', 3),
  ('streak_7', 'Week Warrior', '7 day streak', '⚔️', 30, 'streak', 7),
  ('streak_30', 'Monthly Master', '30 day streak', '👑', 100, 'streak', 30),
  ('level_5', 'Apprentice', 'Reach level 5', '📗', 20, 'level', 5),
  ('level_10', 'Journeyman', 'Reach level 10', '📘', 50, 'level', 10),
  ('level_25', 'Expert', 'Reach level 25', '📕', 100, 'level', 25)
ON CONFLICT (id) DO NOTHING;

-- 4. Function to calculate level from XP
CREATE OR REPLACE FUNCTION calculate_level(xp_amount INTEGER)
RETURNS INTEGER AS $$
BEGIN
  -- Level formula: level = floor(sqrt(xp / 10)) + 1
  -- Level 1: 0-9 XP, Level 2: 10-39 XP, Level 3: 40-89 XP, etc.
  RETURN FLOOR(SQRT(xp_amount::float / 10)) + 1;
END;
$$ LANGUAGE plpgsql;

-- 5. Function to calculate mood based on activity
CREATE OR REPLACE FUNCTION calculate_mood(last_active TIMESTAMPTZ, has_blocked_tasks BOOLEAN)
RETURNS TEXT AS $$
DECLARE
  hours_since_active FLOAT;
BEGIN
  hours_since_active := EXTRACT(EPOCH FROM (NOW() - last_active)) / 3600;
  
  IF has_blocked_tasks THEN
    RETURN 'frustrated';
  ELSIF hours_since_active < 1 THEN
    RETURN 'working';
  ELSIF hours_since_active < 4 THEN
    RETURN 'happy';
  ELSIF hours_since_active < 24 THEN
    RETURN 'idle';
  ELSE
    RETURN 'sleeping';
  END IF;
END;
$$ LANGUAGE plpgsql;

-- 6. Function to update agent stats when task is completed
CREATE OR REPLACE FUNCTION update_agent_stats_on_task()
RETURNS TRIGGER AS $$
DECLARE
  agent_record RECORD;
  new_xp INTEGER;
  xp_earned INTEGER;
BEGIN
  -- Only trigger when task status changes to 'done'
  IF NEW.status = 'done' AND (OLD.status IS NULL OR OLD.status != 'done') THEN
    -- Get assignees for this task
    FOR agent_record IN 
      SELECT agent_id FROM task_assignees WHERE task_id = NEW.id
    LOOP
      -- Calculate XP based on priority
      xp_earned := CASE NEW.priority
        WHEN 'urgent' THEN 25
        WHEN 'high' THEN 15
        WHEN 'medium' THEN 10
        ELSE 5
      END;
      
      -- Upsert agent stats
      INSERT INTO agent_stats (agent_id, xp, tasks_completed, total_tasks, last_active_at)
      VALUES (agent_record.agent_id, xp_earned, 1, 1, NOW())
      ON CONFLICT (agent_id) DO UPDATE SET
        xp = agent_stats.xp + xp_earned,
        tasks_completed = agent_stats.tasks_completed + 1,
        total_tasks = agent_stats.total_tasks + 1,
        level = calculate_level(agent_stats.xp + xp_earned),
        last_active_at = NOW(),
        current_streak = CASE 
          WHEN agent_stats.last_active_at::date = CURRENT_DATE - 1 
          THEN agent_stats.current_streak + 1
          WHEN agent_stats.last_active_at::date = CURRENT_DATE
          THEN agent_stats.current_streak
          ELSE 1
        END,
        updated_at = NOW();
      
      -- Update best streak if needed
      UPDATE agent_stats 
      SET best_streak = current_streak 
      WHERE agent_id = agent_record.agent_id 
        AND current_streak > best_streak;
    END LOOP;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 7. Create trigger on tasks table
DROP TRIGGER IF EXISTS task_completion_stats ON tasks;
CREATE TRIGGER task_completion_stats
  AFTER UPDATE ON tasks
  FOR EACH ROW
  EXECUTE FUNCTION update_agent_stats_on_task();

-- 8. Function to update moods (called by cron)
CREATE OR REPLACE FUNCTION update_all_agent_moods()
RETURNS void AS $$
DECLARE
  agent_record RECORD;
  has_blocked BOOLEAN;
BEGIN
  FOR agent_record IN SELECT * FROM agent_stats
  LOOP
    -- Check if agent has blocked tasks
    SELECT EXISTS(
      SELECT 1 FROM tasks t
      JOIN task_assignees ta ON t.id = ta.task_id
      WHERE ta.agent_id = agent_record.agent_id AND t.status = 'blocked'
    ) INTO has_blocked;
    
    UPDATE agent_stats 
    SET mood = calculate_mood(last_active_at, has_blocked),
        updated_at = NOW()
    WHERE agent_id = agent_record.agent_id;
  END LOOP;
END;
$$ LANGUAGE plpgsql;

-- 9. Initialize stats for existing agents
INSERT INTO agent_stats (agent_id) VALUES
  ('hoyuelo'),
  ('franky'),
  ('frieren'),
  ('maomao'),
  ('nanami'),
  ('reigen'),
  ('rimuru'),
  ('robin')
ON CONFLICT (agent_id) DO NOTHING;

-- 10. Enable RLS
ALTER TABLE agent_stats ENABLE ROW LEVEL SECURITY;
ALTER TABLE achievements ENABLE ROW LEVEL SECURITY;

-- Allow read access
CREATE POLICY "Allow read agent_stats" ON agent_stats FOR SELECT USING (true);
CREATE POLICY "Allow read achievements" ON achievements FOR SELECT USING (true);

-- Allow updates (for the system)
CREATE POLICY "Allow update agent_stats" ON agent_stats FOR UPDATE USING (true);
CREATE POLICY "Allow insert agent_stats" ON agent_stats FOR INSERT WITH CHECK (true);
