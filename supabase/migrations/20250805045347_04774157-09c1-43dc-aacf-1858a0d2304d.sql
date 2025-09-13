-- Add CIBIL score field to profiles table
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS cibil_score INTEGER CHECK (cibil_score >= 300 AND cibil_score <= 900),
ADD COLUMN IF NOT EXISTS cibil_last_updated TIMESTAMP WITH TIME ZONE DEFAULT NULL;

-- Add comment for documentation
COMMENT ON COLUMN public.profiles.cibil_score IS 'CIBIL credit score range: 300-900';
COMMENT ON COLUMN public.profiles.cibil_last_updated IS 'Last time CIBIL score was updated';