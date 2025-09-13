-- Add period field to eb_readings for bi-monthly tracking
ALTER TABLE public.eb_readings 
ADD COLUMN IF NOT EXISTS period TEXT NOT NULL DEFAULT 'Current Month';

-- Add index for period field
CREATE INDEX IF NOT EXISTS idx_eb_readings_period ON public.eb_readings(period);