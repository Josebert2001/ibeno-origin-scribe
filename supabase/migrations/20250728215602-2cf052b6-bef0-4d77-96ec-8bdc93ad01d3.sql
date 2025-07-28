-- Create storage bucket for certificates
INSERT INTO storage.buckets (id, name, public) VALUES ('certificates', 'certificates', false);

-- Create policies for certificate storage
CREATE POLICY "Authenticated users can upload certificates" 
ON storage.objects 
FOR INSERT 
TO authenticated
WITH CHECK (bucket_id = 'certificates' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Authenticated users can view their certificates" 
ON storage.objects 
FOR SELECT 
TO authenticated
USING (bucket_id = 'certificates' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Public can view certificates for verification" 
ON storage.objects 
FOR SELECT 
TO anon
USING (bucket_id = 'certificates');