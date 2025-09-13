-- Add missing columns to profiles table
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS cibil_score INTEGER;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS cibil_last_updated TIMESTAMP WITH TIME ZONE;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS phone TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS date_of_birth DATE;

-- Create savings_goals table (if not exists)
CREATE TABLE IF NOT EXISTS public.savings_goals (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  tenant_id TEXT NOT NULL DEFAULT gen_random_uuid()::text,
  title TEXT NOT NULL,
  description TEXT,
  target_amount DECIMAL(12,2) NOT NULL,
  current_amount DECIMAL(12,2) NOT NULL DEFAULT 0,
  target_date DATE,
  category TEXT NOT NULL DEFAULT 'general',
  priority TEXT NOT NULL DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high')),
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'completed', 'paused')),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create financial_goals table (if not exists)
CREATE TABLE IF NOT EXISTS public.financial_goals (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  tenant_id TEXT NOT NULL DEFAULT gen_random_uuid()::text,
  title TEXT NOT NULL,
  description TEXT,
  goal_type TEXT NOT NULL CHECK (goal_type IN ('debt_reduction', 'emergency_fund', 'retirement', 'investment', 'purchase', 'other')),
  target_amount DECIMAL(12,2),
  current_amount DECIMAL(12,2) NOT NULL DEFAULT 0,
  target_date DATE,
  priority TEXT NOT NULL DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high')),
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'completed', 'paused')),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create alerts table (if not exists)
CREATE TABLE IF NOT EXISTS public.alerts (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  tenant_id TEXT NOT NULL DEFAULT gen_random_uuid()::text,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  alert_type TEXT NOT NULL CHECK (alert_type IN ('budget_exceeded', 'bill_due', 'goal_milestone', 'low_balance', 'unusual_spending', 'other')),
  severity TEXT NOT NULL DEFAULT 'info' CHECK (severity IN ('info', 'warning', 'error', 'success')),
  is_read BOOLEAN NOT NULL DEFAULT false,
  action_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create investments table (if not exists)
CREATE TABLE IF NOT EXISTS public.investments (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  tenant_id TEXT NOT NULL DEFAULT gen_random_uuid()::text,
  investment_name TEXT NOT NULL,
  investment_type TEXT NOT NULL CHECK (investment_type IN ('stocks', 'mutual_funds', 'bonds', 'fixed_deposit', 'sip', 'crypto', 'real_estate', 'other')),
  amount_invested DECIMAL(12,2) NOT NULL,
  current_value DECIMAL(12,2) NOT NULL DEFAULT 0,
  purchase_date DATE NOT NULL,
  expected_return_rate DECIMAL(5,2),
  maturity_date DATE,
  risk_level TEXT NOT NULL DEFAULT 'medium' CHECK (risk_level IN ('low', 'medium', 'high')),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on new tables (ignore if already enabled)
ALTER TABLE public.savings_goals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.financial_goals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.alerts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.investments ENABLE ROW LEVEL SECURITY;

-- Create RLS policies (if not exist)
DO $$
BEGIN
  -- Savings goals policies
  IF NOT EXISTS (SELECT 1 FROM pg_policy WHERE policyname = 'Users can view their own savings goals' AND tablename = 'savings_goals') THEN
    EXECUTE 'CREATE POLICY "Users can view their own savings goals" ON public.savings_goals FOR SELECT USING (auth.uid() = user_id)';
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policy WHERE policyname = 'Users can insert their own savings goals' AND tablename = 'savings_goals') THEN
    EXECUTE 'CREATE POLICY "Users can insert their own savings goals" ON public.savings_goals FOR INSERT WITH CHECK (auth.uid() = user_id)';
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policy WHERE policyname = 'Users can update their own savings goals' AND tablename = 'savings_goals') THEN
    EXECUTE 'CREATE POLICY "Users can update their own savings goals" ON public.savings_goals FOR UPDATE USING (auth.uid() = user_id)';
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policy WHERE policyname = 'Users can delete their own savings goals' AND tablename = 'savings_goals') THEN
    EXECUTE 'CREATE POLICY "Users can delete their own savings goals" ON public.savings_goals FOR DELETE USING (auth.uid() = user_id)';
  END IF;

  -- Financial goals policies
  IF NOT EXISTS (SELECT 1 FROM pg_policy WHERE policyname = 'Users can view their own financial goals' AND tablename = 'financial_goals') THEN
    EXECUTE 'CREATE POLICY "Users can view their own financial goals" ON public.financial_goals FOR SELECT USING (auth.uid() = user_id)';
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policy WHERE policyname = 'Users can insert their own financial goals' AND tablename = 'financial_goals') THEN
    EXECUTE 'CREATE POLICY "Users can insert their own financial goals" ON public.financial_goals FOR INSERT WITH CHECK (auth.uid() = user_id)';
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policy WHERE policyname = 'Users can update their own financial goals' AND tablename = 'financial_goals') THEN
    EXECUTE 'CREATE POLICY "Users can update their own financial goals" ON public.financial_goals FOR UPDATE USING (auth.uid() = user_id)';
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policy WHERE policyname = 'Users can delete their own financial goals' AND tablename = 'financial_goals') THEN
    EXECUTE 'CREATE POLICY "Users can delete their own financial goals" ON public.financial_goals FOR DELETE USING (auth.uid() = user_id)';
  END IF;

  -- Alerts policies
  IF NOT EXISTS (SELECT 1 FROM pg_policy WHERE policyname = 'Users can view their own alerts' AND tablename = 'alerts') THEN
    EXECUTE 'CREATE POLICY "Users can view their own alerts" ON public.alerts FOR SELECT USING (auth.uid() = user_id)';
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policy WHERE policyname = 'Users can insert their own alerts' AND tablename = 'alerts') THEN
    EXECUTE 'CREATE POLICY "Users can insert their own alerts" ON public.alerts FOR INSERT WITH CHECK (auth.uid() = user_id)';
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policy WHERE policyname = 'Users can update their own alerts' AND tablename = 'alerts') THEN
    EXECUTE 'CREATE POLICY "Users can update their own alerts" ON public.alerts FOR UPDATE USING (auth.uid() = user_id)';
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policy WHERE policyname = 'Users can delete their own alerts' AND tablename = 'alerts') THEN
    EXECUTE 'CREATE POLICY "Users can delete their own alerts" ON public.alerts FOR DELETE USING (auth.uid() = user_id)';
  END IF;

  -- Investments policies
  IF NOT EXISTS (SELECT 1 FROM pg_policy WHERE policyname = 'Users can view their own investments' AND tablename = 'investments') THEN
    EXECUTE 'CREATE POLICY "Users can view their own investments" ON public.investments FOR SELECT USING (auth.uid() = user_id)';
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policy WHERE policyname = 'Users can insert their own investments' AND tablename = 'investments') THEN
    EXECUTE 'CREATE POLICY "Users can insert their own investments" ON public.investments FOR INSERT WITH CHECK (auth.uid() = user_id)';
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policy WHERE policyname = 'Users can update their own investments' AND tablename = 'investments') THEN
    EXECUTE 'CREATE POLICY "Users can update their own investments" ON public.investments FOR UPDATE USING (auth.uid() = user_id)';
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policy WHERE policyname = 'Users can delete their own investments' AND tablename = 'investments') THEN
    EXECUTE 'CREATE POLICY "Users can delete their own investments" ON public.investments FOR DELETE USING (auth.uid() = user_id)';
  END IF;
END
$$;