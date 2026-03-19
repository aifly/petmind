-- 宠物档案表
CREATE TABLE IF NOT EXISTS pets (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  type TEXT NOT NULL DEFAULT 'dog',
  breed TEXT,
  gender TEXT,
  birth_date DATE,
  weight DECIMAL(5,2),
  photo_url TEXT,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 疫苗记录表
CREATE TABLE IF NOT EXISTS vaccines (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  pet_id UUID NOT NULL REFERENCES pets(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  date DATE NOT NULL,
  next_date DATE,
  hospital TEXT,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 启用 RLS
ALTER TABLE pets ENABLE ROW LEVEL SECURITY;
ALTER TABLE vaccines ENABLE ROW LEVEL SECURITY;

-- RLS 策略
CREATE POLICY "Users can manage own pets" ON pets
  FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can manage own vaccines" ON vaccines
  FOR ALL USING (pet_id IN (SELECT id FROM pets WHERE user_id = auth.uid()))
  WITH CHECK (pet_id IN (SELECT id FROM pets WHERE user_id = auth.uid()));

-- 索引
CREATE INDEX IF NOT EXISTS idx_pets_user_id ON pets(user_id);
CREATE INDEX IF NOT EXISTS idx_vaccines_pet_id ON vaccines(pet_id);
CREATE INDEX IF NOT EXISTS idx_vaccines_next_date ON vaccines(next_date);
