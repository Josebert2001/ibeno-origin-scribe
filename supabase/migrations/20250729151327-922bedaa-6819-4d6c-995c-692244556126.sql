-- Create storage policies for certificate files (if they don't exist)
DO $$ 
BEGIN
    -- Check if policies exist before creating them
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'objects' 
        AND schemaname = 'storage' 
        AND policyname = 'Anyone can view certificates'
    ) THEN
        CREATE POLICY "Anyone can view certificates"
        ON storage.objects
        FOR SELECT
        USING (bucket_id = 'certificates');
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'objects' 
        AND schemaname = 'storage' 
        AND policyname = 'Authenticated users can upload certificates'
    ) THEN
        CREATE POLICY "Authenticated users can upload certificates"
        ON storage.objects
        FOR INSERT
        WITH CHECK (bucket_id = 'certificates' AND auth.uid() IS NOT NULL);
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'objects' 
        AND schemaname = 'storage' 
        AND policyname = 'Authenticated users can update certificates'
    ) THEN
        CREATE POLICY "Authenticated users can update certificates"
        ON storage.objects
        FOR UPDATE
        USING (bucket_id = 'certificates' AND auth.uid() IS NOT NULL);
    END IF;
END $$;

-- Update certificates table to store file URLs (if columns don't exist)
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'certificates' 
        AND column_name = 'certificate_html_url'
    ) THEN
        ALTER TABLE public.certificates ADD COLUMN certificate_html_url TEXT;
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'certificates' 
        AND column_name = 'certificate_pdf_url'
    ) THEN
        ALTER TABLE public.certificates ADD COLUMN certificate_pdf_url TEXT;
    END IF;
END $$;