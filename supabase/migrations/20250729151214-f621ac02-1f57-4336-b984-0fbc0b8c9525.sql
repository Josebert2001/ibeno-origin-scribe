-- Create storage bucket for certificates
INSERT INTO storage.buckets (id, name, public) VALUES ('certificates', 'certificates', true);

-- Create storage policies for certificate files
CREATE POLICY "Anyone can view certificates"
ON storage.objects
FOR SELECT
USING (bucket_id = 'certificates');

CREATE POLICY "Authenticated users can upload certificates"
ON storage.objects
FOR INSERT
WITH CHECK (bucket_id = 'certificates' AND auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated users can update certificates"
ON storage.objects
FOR UPDATE
USING (bucket_id = 'certificates' AND auth.uid() IS NOT NULL);

-- Update certificates table to store file URLs
ALTER TABLE public.certificates 
ADD COLUMN certificate_html_url TEXT,
ADD COLUMN certificate_pdf_url TEXT;