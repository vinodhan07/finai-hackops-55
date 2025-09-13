-- Create comprehensive financial AI assistant database schema

-- 1. Add missing columns to profiles table
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS cibil_score INTEGER;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS cibil_last_updated TIMESTAMP WITH TIME ZONE;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS phone TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS date_of_birth DATE;

-- 2. Create financial_accounts table
CREATE TABLE public.financial_accounts (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  tenant_id TEXT NOT NULL DEFAULT gen_random_uuid()::text,
  account_name TEXT NOT NULL,
  account_type TEXT NOT NULL CHECK (account_type IN ('savings', 'checking', 'credit_card', 'investment', 'loan', 'other')),
  balance DECIMAL(12,2) NOT NULL DEFAULT 0,
  currency TEXT NOT NULL DEFAULT 'INR',
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- 3. Create savings_goals table
CREATE TABLE public.savings_goals (
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

-- 4. Create financial_goals table
CREATE TABLE public.financial_goals (
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

-- 5. Create alerts table
CREATE TABLE public.alerts (
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

-- 6. Create investments table
CREATE TABLE public.investments (
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

-- Enable RLS on all new tables
ALTER TABLE public.financial_accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.savings_goals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.financial_goals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.alerts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.investments ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for financial_accounts
CREATE POLICY "Users can view their own accounts" ON public.financial_accounts FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own accounts" ON public.financial_accounts FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own accounts" ON public.financial_accounts FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own accounts" ON public.financial_accounts FOR DELETE USING (auth.uid() = user_id);

-- Create RLS policies for savings_goals
CREATE POLICY "Users can view their own savings goals" ON public.savings_goals FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own savings goals" ON public.savings_goals FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own savings goals" ON public.savings_goals FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own savings goals" ON public.savings_goals FOR DELETE USING (auth.uid() = user_id);

-- Create RLS policies for financial_goals
CREATE POLICY "Users can view their own financial goals" ON public.financial_goals FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own financial goals" ON public.financial_goals FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own financial goals" ON public.financial_goals FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own financial goals" ON public.financial_goals FOR DELETE USING (auth.uid() = user_id);

-- Create RLS policies for alerts
CREATE POLICY "Users can view their own alerts" ON public.alerts FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own alerts" ON public.alerts FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own alerts" ON public.alerts FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own alerts" ON public.alerts FOR DELETE USING (auth.uid() = user_id);

-- Create RLS policies for investments
CREATE POLICY "Users can view their own investments" ON public.investments FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own investments" ON public.investments FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own investments" ON public.investments FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own investments" ON public.investments FOR DELETE USING (auth.uid() = user_id);

-- Create indexes for better performance
CREATE INDEX idx_financial_accounts_user_id ON public.financial_accounts(user_id);
CREATE INDEX idx_financial_accounts_tenant_id ON public.financial_accounts(tenant_id);
CREATE INDEX idx_savings_goals_user_id ON public.savings_goals(user_id);
CREATE INDEX idx_savings_goals_tenant_id ON public.savings_goals(tenant_id);
CREATE INDEX idx_financial_goals_user_id ON public.financial_goals(user_id);
CREATE INDEX idx_financial_goals_tenant_id ON public.financial_goals(tenant_id);
CREATE INDEX idx_alerts_user_id ON public.alerts(user_id);
CREATE INDEX idx_alerts_tenant_id ON public.alerts(tenant_id);
CREATE INDEX idx_alerts_is_read ON public.alerts(is_read);
CREATE INDEX idx_investments_user_id ON public.investments(user_id);
CREATE INDEX idx_investments_tenant_id ON public.investments(tenant_id);

-- Create updated_at triggers for all new tables
CREATE TRIGGER update_financial_accounts_updated_at
  BEFORE UPDATE ON public.financial_accounts
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_savings_goals_updated_at
  BEFORE UPDATE ON public.savings_goals
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_financial_goals_updated_at
  BEFORE UPDATE ON public.financial_goals
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_alerts_updated_at
  BEFORE UPDATE ON public.alerts
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_investments_updated_at
  BEFORE UPDATE ON public.investments
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();