import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Content-Security-Policy': "default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; object-src 'none';",
};

// Rate limiting map (simple in-memory for now)
const rateLimitMap = new Map<string, { count: number; resetTime: number }>();

const RATE_LIMIT = {
  maxRequests: 10, // 10 requests per window
  windowMs: 15 * 60 * 1000, // 15 minutes
};

function checkRateLimit(clientId: string): { allowed: boolean; remaining: number } {
  const now = Date.now();
  const entry = rateLimitMap.get(clientId);
  
  if (!entry || now > entry.resetTime) {
    rateLimitMap.set(clientId, { count: 1, resetTime: now + RATE_LIMIT.windowMs });
    return { allowed: true, remaining: RATE_LIMIT.maxRequests - 1 };
  }
  
  if (entry.count >= RATE_LIMIT.maxRequests) {
    return { allowed: false, remaining: 0 };
  }
  
  entry.count++;
  return { allowed: true, remaining: RATE_LIMIT.maxRequests - entry.count };
}

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
    // Load the template from Supabase Storage or fallback to GitHub raw content
    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    let templateUrl: string;
    
    if (supabaseUrl) {
      // Try Supabase Storage first
      templateUrl = `${supabaseUrl}/storage/v1/object/public/static-assets/certificate-template.html`;
    } else {
      // Fallback to a more reliable source
      templateUrl = 'https://raw.githubusercontent.com/your-repo/ibeno-origin-scribe/main/public/certificate-template.html';
    }
    
    const templateResponse = await fetch(templateUrl);
    if (!templateResponse.ok) {
      // If Supabase Storage fails, try the embedded template as fallback
      if (supabaseUrl && templateUrl.includes('supabase.co')) {
        console.warn('Supabase Storage template fetch failed, using embedded template');
        return getEmbeddedTemplate();
      }
      throw new Error(`Failed to fetch template from ${templateUrl}: ${templateResponse.statusText}`);
    }
    return await templateResponse.text();
  } catch (error) {
    console.error('Error loading certificate template:', error);
    // Final fallback to embedded template
    console.warn('Using embedded template as final fallback');
    return getEmbeddedTemplate();
  }
}

async function loadLogoAsBase64(): Promise<string> {
  try {
    // Load the logo from Supabase Storage or fallback
    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    let logoUrl: string;
    
    if (supabaseUrl) {
      // Try Supabase Storage first
      logoUrl = `${supabaseUrl}/storage/v1/object/public/static-assets/logo.png`;
    } else {
      // Fallback to a more reliable source
      logoUrl = 'https://raw.githubusercontent.com/your-repo/ibeno-origin-scribe/main/public/logo.png';
    }
    
    const logoResponse = await fetch(logoUrl);
    if (!logoResponse.ok) {
      // If Supabase Storage fails, use a default placeholder
      if (supabaseUrl && logoUrl.includes('supabase.co')) {
        console.warn('Supabase Storage logo fetch failed, using default placeholder');
        return getDefaultLogoBase64();
      }
      throw new Error(`Failed to fetch logo from ${logoUrl}: ${logoResponse.statusText}`);
    }
    const logoBuffer = await logoResponse.arrayBuffer();
    
    // Convert buffer to base64 using a more efficient method
    const bytes = new Uint8Array(logoBuffer);
    let binary = '';
    const chunkSize = 8192;
    
    for (let i = 0; i < bytes.length; i += chunkSize) {
      const chunk = bytes.slice(i, i + chunkSize);
      binary += String.fromCharCode.apply(null, Array.from(chunk));
    }
    
    const base64Logo = btoa(binary);
    return base64Logo;
  } catch (error) {
    console.error('Error loading logo:', error);
    // Final fallback to default logo
    console.warn('Using default logo as final fallback');
    return getDefaultLogoBase64();
  }
}

// Embedded template as fallback
function getEmbeddedTemplate(): string {
  return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Certificate of Origin</title>
    <style>
        @page { size: B5; margin: 0; }
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { font-family: 'Georgia', serif; background-color: #ffffff; width: 176mm; height: 250mm; margin: 0 auto; position: relative; overflow: hidden; padding: 0; }
        .certificate-container { width: 176mm; height: 250mm; background: #ffffff; position: relative; margin: 0 auto; padding: 15mm; box-sizing: border-box; font-family: 'Georgia', serif; display: flex; flex-direction: column; border: 10px solid #00a650; box-shadow: inset 0 0 0 4px #ffffff, inset 0 0 0 8px #00aeef, inset 0 0 0 12px #ffffff, inset 0 0 0 16px #00a650, 0 10px 30px rgba(0,0,0,0.2); overflow: hidden; }
        .header { text-align: center; margin-bottom: 20px; position: relative; z-index: 2; padding-top: 10px; }
        .header h1 { font-size: 32px; font-family: 'Arial Black', 'Impact', sans-serif; font-weight: 1000; color: #00a650; letter-spacing: 0.5px; margin: 0 0 12px 0; padding: 0 5px; text-shadow: 2px 2px 3px rgba(0,0,0,0.15); white-space: nowrap; width: 100%; text-transform: uppercase; -webkit-text-stroke: 1px #00a650; }
        .header h2 { font-size: 22px; color: #2c3e50; font-weight: 600; margin-bottom: 12px; letter-spacing: 1.5px; }
        .title { font-size: 36px; color: #00aeef; margin: 15px 0 20px; font-family: 'Georgia', serif; font-style: italic; position: relative; z-index: 2; text-shadow: 2px 2px 4px rgba(0,0,0,0.1); font-weight: bold; text-align: center; letter-spacing: 1px; }
        .content { font-size: 18px; line-height: 1.6; text-align: justify; margin: 10px 0 20px; position: relative; z-index: 2; background: rgba(255,255,255,0.9); padding: 25px 30px; border-radius: 10px; box-shadow: 0 3px 10px rgba(0,0,0,0.1); flex-grow: 1; }
        .content p { margin-bottom: 20px; color: #2c3e50; }
        .content p strong { color: #00a650; font-size: 19px; letter-spacing: 0.5px; }
        .footer { margin-top: auto; position: relative; z-index: 2; }
        .footer-content { display: flex; justify-content: space-between; align-items: flex-end; width: 100%; padding: 0 10px; }
        .signature { text-align: center; background: rgba(255,255,255,0.95); padding: 15px 20px; border-radius: 8px; box-shadow: 0 4px 12px rgba(0,0,0,0.15); font-size: 14px; font-weight: 600; flex-shrink: 0; min-width: 180px; }
        .signature::before { content: ''; display: block; border-bottom: 2px solid #2c3e50; height: 40px; margin-bottom: 8px; }
        .qr-code { width: 100px; height: 100px; border: 2px solid #00a650; display: flex; align-items: center; justify-content: center; font-size: 10px; color: #00a650; background: rgba(255,255,255,0.95); z-index: 2; border-radius: 6px; box-shadow: 0 4px 12px rgba(0,0,0,0.15); text-align: center; flex-shrink: 0; }
        .government-seal { width: 100px; height: 100px; border-radius: 50%; display: flex; align-items: center; justify-content: center; margin: 0 auto 6px auto; position: relative; background: #ffffff; box-shadow: 0 4px 15px rgba(0,0,0,0.15); border: 3px solid #00a650; padding: 4px; overflow: hidden; }
        .reference-section { display: grid; grid-template-columns: 1fr auto 1fr; gap: 15px; align-items: center; margin-bottom: 20px; font-size: 13px; position: relative; z-index: 2; padding: 0 10px; }
        .left-refs { text-align: left; }
        .left-refs p { margin-bottom: 6px; font-weight: 500; color: #2c3e50; }
        .left-refs .ref-label { font-weight: 600; color: #00a650; font-size: 15px; }
        .center-seal { text-align: center; justify-self: center; }
        .seal-motto { font-size: 10px; font-weight: bold; color: #a60000; margin-top: 4px; }
        .right-info { text-align: right; }
        .right-info p { margin-bottom: 4px; color: #2c3e50; font-weight: 500; }
        .right-info .address-line { font-size: 12px; color: #666; }
        .right-info .date-line { font-weight: 600; color: #00a650; margin-top: 6px; font-size: 12px; }
    </style>
</head>
<body>
    <div class="certificate-container">
        <div class="header">
            <h1>IBENO LOCAL GOVERNMENT</h1>
            <h2>AKWA IBOM STATE</h2>
        </div>
        <div class="reference-section">
            <div class="left-refs">
                <p><span class="ref-label">Cert. No:</span> <span>{{certificateNumber}}</span></p>
            </div>
            <div class="center-seal">
                <div class="government-seal">
                    <img src="/logo.png" alt="Ibeno Local Government Logo" style="width: 100%; height: 100%; object-fit: contain; border-radius: 50%;" />
                </div>
                <div class="seal-motto">UNITY AND LABOUR!</div>
            </div>
            <div class="right-info">
                <p class="address-line">Local Government Secretariat</p>
                <p class="address-line">Upenekang Town</p>
                <p class="address-line">Ibeno Local Government Area</p>
                <p class="address-line">Akwa Ibom State</p>
                <p class="date-line">{{date}}</p>
            </div>
        </div>
        <div class="title">Certificate of Origin</div>
        <div class="content">
            <p>This is to formally certify that:</p>
            <p>The bearer <strong>{{full_name}}</strong> is a native of Ekpuk <strong>{{clan}}</strong> in <strong>{{village}}</strong> Village, and a recognized indigene of Ibeno Local Government Area, Akwa Ibom State.</p>
            <p>The bearer is therefore entitled to all the rights, recognition, and assistance that come with being a native of this esteemed locality.</p>
        </div>
        <div class="footer">
            <div class="footer-content">
                <div class="qr-code">{{qrCode}}</div>
                <div class="signature">Executive Chairman<br>Ibeno Local Government</div>
            </div>
        </div>
    </div>
</body>
</html>`;
}

// Default logo as base64 (simple placeholder)
function getDefaultLogoBase64(): string {
  // This is a simple 1x1 transparent PNG as a fallback
  return 'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==';
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    // Rate limiting
    const clientId = req.headers.get('x-forwarded-for') || req.headers.get('x-real-ip') || 'unknown';
    const rateCheck = checkRateLimit(clientId);
    
    if (!rateCheck.allowed) {
      return new Response(
        JSON.stringify({ error: 'Rate limit exceeded. Please try again later.' }),
        { 
          status: 429, 
          headers: { 
            ...corsHeaders, 
            'Content-Type': 'application/json',
            'X-RateLimit-Remaining': '0',
            'X-RateLimit-Reset': Math.ceil((Date.now() + RATE_LIMIT.windowMs) / 1000).toString()
          } 
        }
      );
    }

    const rawData = await req.json();
    
    // Enhanced logging for monitoring
    console.log('Certificate generation request:', {
      timestamp: new Date().toISOString(),
      client_id: clientId,
      bearer_name: rawData.bearerName,
    });
    
    // Validate and sanitize input data
    const certificateData: CertificateData = validateCertificateData(rawData);

    // Validate QR code URL
    try {
      new URL(certificateData.qrCodeData);
    } catch {
      throw new Error('Invalid QR code URL');
    }

    // Generate QR code using QR Server API
    const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(certificateData.qrCodeData)}&format=png`;
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
