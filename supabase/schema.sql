-- 宠物日历提醒表
CREATE TABLE IF NOT EXISTS reminders (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  type TEXT NOT NULL DEFAULT 'other',
  time TEXT NOT NULL,
  date DATE NOT NULL,
  pet_name TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 启用 RLS
ALTER TABLE reminders ENABLE ROW LEVEL SECURITY;

-- 允许所有人读取和创建（简单起见）
CREATE POLICY "Allow all access to reminders" ON reminders
  FOR ALL
  USING (true)
  WITH CHECK (true);

-- 创建索引
CREATE INDEX IF NOT EXISTS idx_reminders_date ON reminders(date);
