-- Create petrol_readings table
CREATE TABLE IF NOT EXISTS public.petrol_readings (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  start_kms DECIMAL(10,2) NOT NULL,
  end_kms DECIMAL(10,2) NOT NULL,
  kms_run DECIMAL(10,2) GENERATED ALWAYS AS (end_kms - start_kms) STORED,
  petrol_amount DECIMAL(10,2) NOT NULL,
  cost_per_liter DECIMAL(10,2) NOT NULL,
  total_cost DECIMAL(10,2) GENERATED ALWAYS AS (petrol_amount * cost_per_liter) STORED,
  reading_date DATE NOT NULL DEFAULT CURRENT_DATE,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Create eb_readings table
CREATE TABLE IF NOT EXISTS public.eb_readings (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  start_units DECIMAL(10,2) NOT NULL,
  end_units DECIMAL(10,2) NOT NULL,
  units_consumed DECIMAL(10,2) GENERATED ALWAYS AS (end_units - start_units) STORED,
  total_cost DECIMAL(10,2) NOT NULL,
  reading_date DATE NOT NULL DEFAULT CURRENT_DATE,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Enable Row Level Security
ALTER TABLE public.petrol_readings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.eb_readings ENABLE ROW LEVEL SECURITY;

-- Create policies for petrol_readings
CREATE POLICY "Users can view their own petrol readings" 
ON public.petrol_readings 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own petrol readings" 
ON public.petrol_readings 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own petrol readings" 
ON public.petrol_readings 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own petrol readings" 
ON public.petrol_readings 
FOR DELETE 
USING (auth.uid() = user_id);

-- Create policies for eb_readings
CREATE POLICY "Users can view their own eb readings" 
ON public.eb_readings 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own eb readings" 
ON public.eb_readings 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own eb readings" 
ON public.eb_readings 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own eb readings" 
ON public.eb_readings 
FOR DELETE 
USING (auth.uid() = user_id);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_petrol_readings_user_id ON public.petrol_readings(user_id);
CREATE INDEX IF NOT EXISTS idx_petrol_readings_date ON public.petrol_readings(reading_date);
CREATE INDEX IF NOT EXISTS idx_eb_readings_user_id ON public.eb_readings(user_id);
CREATE INDEX IF NOT EXISTS idx_eb_readings_date ON public.eb_readings(reading_date);

-- Create triggers for automatic timestamp updates
CREATE TRIGGER update_petrol_readings_updated_at
BEFORE UPDATE ON public.petrol_readings
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_eb_readings_updated_at
BEFORE UPDATE ON public.eb_readings
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Create function to calculate EB cost based on slabs
CREATE OR REPLACE FUNCTION calculate_eb_cost(units_consumed DECIMAL)
RETURNS DECIMAL
LANGUAGE plpgsql
AS $$
DECLARE
  total_cost DECIMAL := 0;
  remaining_units DECIMAL := units_consumed;
BEGIN
  -- First 100 units free (under subsidized scheme)
  IF remaining_units > 100 THEN
    remaining_units := remaining_units - 100;
  ELSE
    RETURN 0; -- All units are free
  END IF;
  
  -- Next 100 units (101-200) at ₹4.95 per kWh
  IF remaining_units > 100 THEN
    total_cost := total_cost + (100 * 4.95);
    remaining_units := remaining_units - 100;
  ELSE
    total_cost := total_cost + (remaining_units * 4.95);
    RETURN total_cost;
  END IF;
  
  -- Next 50 units (201-250) at ₹6.65 per kWh
  IF remaining_units > 50 THEN
    total_cost := total_cost + (50 * 6.65);
    remaining_units := remaining_units - 50;
  ELSE
    total_cost := total_cost + (remaining_units * 6.65);
    RETURN total_cost;
  END IF;
  
  -- Next 50 units (251-300) at ₹8.80 per kWh
  IF remaining_units > 50 THEN
    total_cost := total_cost + (50 * 8.80);
    remaining_units := remaining_units - 50;
  ELSE
    total_cost := total_cost + (remaining_units * 8.80);
    RETURN total_cost;
  END IF;
  
  -- Next 100 units (301-400) at ₹9.95 per kWh
  IF remaining_units > 100 THEN
    total_cost := total_cost + (100 * 9.95);
    remaining_units := remaining_units - 100;
  ELSE
    total_cost := total_cost + (remaining_units * 9.95);
    RETURN total_cost;
  END IF;
  
  -- Next 100 units (401-500) at ₹11.05 per kWh
  IF remaining_units > 100 THEN
    total_cost := total_cost + (100 * 11.05);
    remaining_units := remaining_units - 100;
  ELSE
    total_cost := total_cost + (remaining_units * 11.05);
    RETURN total_cost;
  END IF;
  
  -- Above 500 units at ₹12.15 per kWh
  total_cost := total_cost + (remaining_units * 12.15);
  
  RETURN total_cost;
END;
$$;