-- Enable UUID extension if not enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Profiles table linked to Supabase Auth
CREATE TABLE IF NOT EXISTS profiles (
  id UUID REFERENCES auth.users PRIMARY KEY,
  display_name TEXT,
  default_unit_system TEXT DEFAULT 'SI',
  theme TEXT DEFAULT 'light',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Create policies (checked if they exist is harder in SQL simple script, but usually fine on retry if they match)
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Users can view own profile') THEN
        CREATE POLICY "Users can view own profile" ON profiles FOR SELECT USING (auth.uid() = id);
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Users can update own profile') THEN
        CREATE POLICY "Users can update own profile" ON profiles FOR UPDATE USING (auth.uid() = id);
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Users can insert own profile') THEN
        CREATE POLICY "Users can insert own profile" ON profiles FOR INSERT WITH CHECK (auth.uid() = id);
    END IF;
END $$;

-- Problems table
CREATE TABLE IF NOT EXISTS problems (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES profiles(id),
  problem_text TEXT NOT NULL,
  problem_type TEXT NOT NULL, -- kinematics, dynamics, etc.
  input_method TEXT NOT NULL, -- form, nl, image
  is_bookmarked BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE problems ENABLE ROW LEVEL SECURITY;
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Users can view own problems') THEN
        CREATE POLICY "Users can view own problems" ON problems FOR SELECT USING (auth.uid() = user_id);
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Users can insert own problems') THEN
        CREATE POLICY "Users can insert own problems" ON problems FOR INSERT WITH CHECK (auth.uid() = user_id);
    END IF;
END $$;

-- Solutions table
CREATE TABLE IF NOT EXISTS solutions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  problem_id UUID REFERENCES problems(id) ON DELETE CASCADE,
  input_values JSONB NOT NULL,
  solution_steps JSONB NOT NULL,
  final_answer JSONB NOT NULL,
  solved_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE solutions ENABLE ROW LEVEL SECURITY;
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Users can view own solutions') THEN
        CREATE POLICY "Users can view own solutions" ON solutions FOR SELECT 
        USING (EXISTS (SELECT 1 FROM problems WHERE problems.id = solutions.problem_id AND problems.user_id = auth.uid()));
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Users can insert own solutions') THEN
        CREATE POLICY "Users can insert own solutions" ON solutions FOR INSERT 
        WITH CHECK (EXISTS (SELECT 1 FROM problems WHERE problems.id = solutions.problem_id AND problems.user_id = auth.uid()));
    END IF;
END $$;

-- Trigger to create profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (id, display_name)
  VALUES (new.id, new.raw_user_meta_data->>'display_name');
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
