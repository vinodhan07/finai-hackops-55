-- Create a table for readings (utility meter readings like electricity, water, gas)
CREATE TABLE public.readings (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  reading_type TEXT NOT NULL, -- 'electricity', 'water', 'gas', etc.
  meter_number TEXT,
  current_reading NUMERIC NOT NULL,
  previous_reading NUMERIC DEFAULT 0,
  consumption NUMERIC GENERATED ALWAYS AS (current_reading - previous_reading) STORED,
  reading_date DATE NOT NULL DEFAULT CURRENT_DATE,
  cost_per_unit NUMERIC DEFAULT 0,
  total_cost NUMERIC GENERATED ALWAYS AS (consumption * cost_per_unit) STORED,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  tenant_id TEXT NOT NULL DEFAULT gen_random_uuid()
);

-- Enable Row Level Security
ALTER TABLE public.readings ENABLE ROW LEVEL SECURITY;

-- Create policies for user access
CREATE POLICY "Users can view their own readings" 
ON public.readings 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own readings" 
ON public.readings 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own readings" 
ON public.readings 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own readings" 
ON public.readings 
FOR DELETE 
USING (auth.uid() = user_id);

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_readings_updated_at
BEFORE UPDATE ON public.readings
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Create indexes for better performance
CREATE INDEX idx_readings_user_id ON public.readings(user_id);
CREATE INDEX idx_readings_type_date ON public.readings(user_id, reading_type, reading_date DESC);