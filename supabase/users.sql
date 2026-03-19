-- 用户信息表（同步自 Auth）
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 启用 RLS
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- 允许所有人查看（管理员需要）
CREATE POLICY "Allow read access to users" ON users
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "Allow anon read access to users" ON users
  FOR SELECT TO anon USING (true);

-- 插入时自动填充（通过 Trigger）
-- 先授权
GRANT ALL ON users TO anon, authenticated;

-- 创建函数自动同步新用户
CREATE OR REPLACE FUNCTION sync_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO users (id, email, created_at)
  VALUES (NEW.id, NEW.email, NOW())
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 创建 Trigger
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION sync_user();

-- 同步现有用户
INSERT INTO users (id, email, created_at)
SELECT id, email, created_at FROM auth.users
ON CONFLICT (id) DO NOTHING;
