import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Content-Security-Policy': "default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; object-src 'none';",
};

interface CertificateData {
  ourRef: string;
  yourRef: string;
  dateIssued: string;
  certificateNumber: string;
  bearerName: string;
  nativeOf: string;
  village: string;
  qrCodeData: string;
}

// Input validation and sanitization functions
function sanitizeInput(input: string): string {
  if (typeof input !== 'string') {
    throw new Error('Input must be a string');
  }
  
  // Remove HTML tags and encode special characters
  return input
    .replace(/[<>]/g, '') // Remove < and > to prevent HTML injection
    .replace(/[&]/g, '&amp;') // Encode ampersands
    .replace(/['"]/g, '') // Remove quotes to prevent attribute injection
    .trim()
    .substring(0, 100); // Limit length
}

function validateCertificateData(data: any): CertificateData {
  if (!data || typeof data !== 'object') {
    throw new Error('Invalid certificate data');
  }

  const requiredFields = ['ourRef', 'yourRef', 'dateIssued', 'certificateNumber', 'bearerName', 'nativeOf', 'village', 'qrCodeData'];
  
  for (const field of requiredFields) {
    if (!data[field] || typeof data[field] !== 'string') {
      throw new Error(`Missing or invalid field: ${field}`);
    }
  }

  // Validate date format
  const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
  if (!dateRegex.test(data.dateIssued)) {
    throw new Error('Invalid date format. Expected YYYY-MM-DD');
  }

  // Validate certificate number format
  const certRegex = /^IBN\d{2}\s\d{4}$/;
  if (!certRegex.test(data.certificateNumber)) {
    throw new Error('Invalid certificate number format');
  }

  // Validate name lengths
  if (data.bearerName.length < 2 || data.bearerName.length > 100) {
    throw new Error('Bearer name must be between 2 and 100 characters');
  }

  if (data.nativeOf.length < 2 || data.nativeOf.length > 100) {
    throw new Error('Native of must be between 2 and 100 characters');
  }

  if (data.village.length < 2 || data.village.length > 100) {
    throw new Error('Village must be between 2 and 100 characters');
  }

  return {
    ourRef: sanitizeInput(data.ourRef),
    yourRef: sanitizeInput(data.yourRef),
    dateIssued: data.dateIssued,
    certificateNumber: sanitizeInput(data.certificateNumber),
    bearerName: sanitizeInput(data.bearerName),
    nativeOf: sanitizeInput(data.nativeOf),
    village: sanitizeInput(data.village),
    qrCodeData: data.qrCodeData // QR code data should be URL - validate separately
  };
}

async function loadCertificateTemplate(): Promise<string> {
  try {
    // Load the template from the public directory
    const templateUrl = 'https://557629bc-0000-4938-a16a-c09dbf780ca6.lovableproject.com/certificate-template.html';
    const templateResponse = await fetch(templateUrl);
    if (!templateResponse.ok) {
      throw new Error(`Failed to fetch template: ${templateResponse.statusText}`);
    }
    return await templateResponse.text();
  } catch (error) {
    console.error('Error loading certificate template:', error);
    throw new Error('Failed to load certificate template');
  }
}

async function loadLogoAsBase64(): Promise<string> {
  try {
    // Load the logo from the public directory
    const logoUrl = 'https://557629bc-0000-4938-a16a-c09dbf780ca6.lovableproject.com/logo.png';
    const logoResponse = await fetch(logoUrl);
    if (!logoResponse.ok) {
      throw new Error(`Failed to fetch logo: ${logoResponse.statusText}`);
    }
    const logoBuffer = await logoResponse.arrayBuffer();
    const base64Logo = btoa(String.fromCharCode(...new Uint8Array(logoBuffer)));
    return base64Logo;
  } catch (error) {
    console.error('Error loading logo:', error);
    throw new Error('Failed to load logo');
  }
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const rawData = await req.json();
    
    // Validate and sanitize input data
    const certificateData: CertificateData = validateCertificateData(rawData);

    // Validate QR code URL
    try {
      new URL(certificateData.qrCodeData);
    } catch {
      throw new Error('Invalid QR code URL');
    }

    // Generate QR code using QR Server API
    const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${encodeURIComponent(certificateData.qrCodeData)}&format=png`;
    const qrResponse = await fetch(qrUrl);
    
    if (!qrResponse.ok) {
      throw new Error('Failed to generate QR code from external service');
    }

    const qrImageBuffer = await qrResponse.arrayBuffer();
    const base64QR = btoa(String.fromCharCode(...new Uint8Array(qrImageBuffer)));
    const qrCode = `data:image/png;base64,${base64QR}`;

    // Load certificate template and logo
    const template = await loadCertificateTemplate();
    const logoBase64 = await loadLogoAsBase64();

    // Format the date for display
    const dateFormatted = new Date(certificateData.dateIssued).toLocaleDateString('en-GB', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });

    // Create QR code img tag for proper insertion
    const qrCodeImg = `<img src="${qrCode}" alt="QR Code for Certificate Verification" style="width: 100%; height: 100%; object-fit: contain;" />`;
    
    // Replace template placeholders with actual data using safe HTML replacement
    const certificateHTML = template
      .replace(/{{ourRef}}/g, certificateData.ourRef)
      .replace(/{{yourRef}}/g, certificateData.yourRef)
      .replace(/{{date}}/g, dateFormatted)
      .replace(/{{certificateNumber}}/g, certificateData.certificateNumber)
      .replace(/{{full_name}}/g, certificateData.bearerName)
      .replace(/{{clan}}/g, certificateData.nativeOf)
      .replace(/{{village}}/g, certificateData.village)
      .replace(/{{qrCode}}/g, qrCodeImg)
      .replace(/{{logoBase64}}/g, logoBase64);

    // Initialize Supabase client for storage
    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
    
    let htmlUrl = null;
    let pdfUrl = null;
    
    if (supabaseUrl && supabaseServiceKey) {
      const supabase = createClient(supabaseUrl, supabaseServiceKey);
      
      try {
        // Save HTML file to storage
        const htmlFileName = `certificate_${certificateData.certificateNumber.replace(/\s/g, '_')}.html`;
        const htmlFilePath = `${new Date().getFullYear()}/${htmlFileName}`;
        
        const { data: htmlUploadData, error: htmlUploadError } = await supabase.storage
          .from('certificates')
          .upload(htmlFilePath, new Blob([certificateHTML], { type: 'text/html' }), {
            contentType: 'text/html',
            upsert: true
          });

        if (htmlUploadError) {
          console.error('HTML storage upload error:', htmlUploadError);
        } else {
          // Get public URL for HTML
          const { data: htmlUrlData } = supabase.storage
            .from('certificates')
            .getPublicUrl(htmlFilePath);
          
          htmlUrl = htmlUrlData.publicUrl;
          console.log('Certificate HTML saved to storage:', htmlUrl);
        }

        // Generate PDF using HTMLCSStoImage API
        try {
          const response = await fetch('https://htmlcsstoimage.com/demo_run', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              html: certificateHTML,
              css: '',
              google_fonts: 'Georgia',
              format: 'pdf',
              width: 595,
              height: 842,
              device_scale_factor: 2,
              render_when_ready: false,
              viewport_width: 595,
              viewport_height: 842
            })
          });

          if (response.ok) {
            const result = await response.json();
            if (result.url) {
              // Download the generated PDF
              const pdfResponse = await fetch(result.url);
              if (pdfResponse.ok) {
                const pdfBuffer = await pdfResponse.arrayBuffer();
                
                // Save PDF to storage
                const pdfFileName = `certificate_${certificateData.certificateNumber.replace(/\s/g, '_')}.pdf`;
                const pdfFilePath = `${new Date().getFullYear()}/${pdfFileName}`;
                
                const { data: pdfUploadData, error: pdfUploadError } = await supabase.storage
                  .from('certificates')
                  .upload(pdfFilePath, new Blob([pdfBuffer], { type: 'application/pdf' }), {
                    contentType: 'application/pdf',
                    upsert: true
                  });

                if (pdfUploadError) {
                  console.error('PDF storage upload error:', pdfUploadError);
                } else {
                  // Get public URL for PDF
                  const { data: pdfUrlData } = supabase.storage
                    .from('certificates')
                    .getPublicUrl(pdfFilePath);
                  
                  pdfUrl = pdfUrlData.publicUrl;
                  console.log('Certificate PDF saved to storage:', pdfUrl);
                }
              }
            }
          }
        } catch (pdfError) {
          console.error('PDF generation failed:', pdfError);
        }
      } catch (storageError) {
        console.error('Storage operation failed:', storageError);
      }
    }

    return new Response(
      JSON.stringify({ 
        html: certificateHTML,
        htmlUrl,
        pdfUrl,
        qrCode,
        certificateNumber: certificateData.certificateNumber,
        success: true
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  } catch (error) {
    console.error('Error generating certificate:', error);
    return new Response(
      JSON.stringify({ error: 'Failed to generate certificate', details: error.message }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});
