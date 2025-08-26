# Supabase Storage Setup Guide

This guide will help you set up Supabase Storage to host static assets for the certificate generation system.

## Step 1: Create Storage Bucket

1. Go to your Supabase Dashboard
2. Navigate to **Storage** in the left sidebar
3. Click **Create a new bucket**
4. Name the bucket: `static-assets`
5. Make sure **Public bucket** is enabled
6. Click **Create bucket**

## Step 2: Upload Static Assets

### Upload Certificate Template
1. In the `static-assets` bucket, click **Upload file**
2. Select your `public/certificate-template.html` file
3. Upload it to the root of the bucket
4. The file should be accessible at: `https://[your-project-id].supabase.co/storage/v1/object/public/static-assets/certificate-template.html`

### Upload Logo
1. In the `static-assets` bucket, click **Upload file**
2. Select your `public/logo.png` file
3. Upload it to the root of the bucket
4. The file should be accessible at: `https://[your-project-id].supabase.co/storage/v1/object/public/static-assets/logo.png`

## Step 3: Verify Public Access

Test that your files are publicly accessible by visiting:
- `https://[your-project-id].supabase.co/storage/v1/object/public/static-assets/certificate-template.html`
- `https://[your-project-id].supabase.co/storage/v1/object/public/static-assets/logo.png`

Replace `[your-project-id]` with your actual Supabase project ID (found in your project URL).

## Step 4: Update Edge Function (Already Done)

The Edge Function has been updated to:
1. Try loading assets from Supabase Storage first
2. Fall back to embedded templates if Storage is unavailable
3. Provide better error handling and logging

## Step 5: Test Certificate Generation

1. Go to your admin panel
2. Try generating a certificate
3. Check the browser console for any errors
4. Verify that certificates are generated successfully

## Troubleshooting

### If assets fail to load from Storage:
1. Verify the bucket is public
2. Check that files are uploaded correctly
3. Ensure the URLs are accessible in your browser
4. The system will automatically fall back to embedded templates

### If you see 500 errors:
1. Check the Supabase Edge Function logs
2. Verify your environment variables are set correctly
3. The updated function includes better error handling and fallbacks

## Alternative: GitHub Raw Content

If you prefer not to use Supabase Storage, you can:
1. Push your files to a GitHub repository
2. Update the Edge Function URLs to use GitHub raw content URLs
3. Example: `https://raw.githubusercontent.com/username/repo/main/public/certificate-template.html`

## Benefits of This Setup

1. **Reliability**: Multiple fallback mechanisms ensure certificates can always be generated
2. **Performance**: Assets are served from CDN when using Supabase Storage
3. **Maintainability**: Easy to update templates without redeploying the Edge Function
4. **Error Handling**: Comprehensive error handling prevents 500 errors