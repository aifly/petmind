-- 成长记录表
CREATE TABLE IF NOT EXISTS growth_records (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  pet_id UUID NOT NULL REFERENCES pets(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  weight DECIMAL(5,2),
  height DECIMAL(5,2),
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 启用 RLS
ALTER TABLE growth_records ENABLE ROW LEVEL SECURITY;

-- 策略
CREATE POLICY "Users can manage own growth records" ON growth_records
  FOR ALL TO authenticated USING (
    pet_id IN (SELECT id FROM pets WHERE user_id = auth.uid())
  ) WITH CHECK (
    pet_id IN (SELECT id FROM pets WHERE user_id = auth.uid())
  );

-- 授权
GRANT ALL ON growth_records TO anon, authenticated;
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO anon, authenticated;

-- 索引
CREATE INDEX idx_growth_records_pet ON growth_records(pet_id);
CREATE INDEX idx_growth_records_date ON growth_records(date);
