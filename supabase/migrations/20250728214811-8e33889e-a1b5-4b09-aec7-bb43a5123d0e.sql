-- Create certificates table for storing certificate data
CREATE TABLE public.certificates (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  our_ref TEXT NOT NULL,
  your_ref TEXT NOT NULL,
  date_issued DATE NOT NULL DEFAULT CURRENT_DATE,
  certificate_number TEXT NOT NULL UNIQUE,
  bearer_name TEXT NOT NULL,
  native_of TEXT NOT NULL,
  village TEXT NOT NULL,
  qr_code_data TEXT NOT NULL,
  certificate_file_url TEXT,
  status TEXT NOT NULL DEFAULT 'valid' CHECK (status IN ('valid', 'invalid', 'expired', 'revoked')),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_by UUID REFERENCES auth.users(id)
);

-- Enable Row Level Security
ALTER TABLE public.certificates ENABLE ROW LEVEL SECURITY;

-- Create policies for certificate access
CREATE POLICY "Authenticated users can view all certificates" 
ON public.certificates 
FOR SELECT 
TO authenticated
USING (true);

CREATE POLICY "Authenticated users can create certificates" 
ON public.certificates 
FOR INSERT 
TO authenticated
WITH CHECK (auth.uid() = created_by);

CREATE POLICY "Authenticated users can update their certificates" 
ON public.certificates 
FOR UPDATE 
TO authenticated
USING (auth.uid() = created_by);

-- Create public policy for verification (no auth required)
CREATE POLICY "Public can view certificates for verification" 
ON public.certificates 
FOR SELECT 
TO anon
USING (true);

-- Create function to update timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_certificates_updated_at
BEFORE UPDATE ON public.certificates
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Create sequence for certificate numbers
CREATE SEQUENCE IF NOT EXISTS certificate_number_seq START 725 INCREMENT 1;

-- Create function to generate certificate number
CREATE OR REPLACE FUNCTION public.generate_certificate_number()
RETURNS TEXT AS $$
BEGIN
  RETURN 'PNG ' || LPAD(nextval('certificate_number_seq')::text, 6, '0') || ' 1';
END;
$$ LANGUAGE plpgsql;

-- Create function to generate reference numbers
CREATE OR REPLACE FUNCTION public.generate_our_ref()
RETURNS TEXT AS $$
BEGIN
  RETURN 'ILG/AD/G/304/' || LPAD(nextval('certificate_number_seq')::text, 4, '0');
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION public.generate_your_ref()
RETURNS TEXT AS $$
BEGIN
  RETURN 'NO1.42/' || LPAD((EXTRACT(YEAR FROM CURRENT_DATE) - 2000)::text, 2, '0');
END;
$$ LANGUAGE plpgsql;