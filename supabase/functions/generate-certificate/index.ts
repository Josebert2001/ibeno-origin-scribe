import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.53.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface CertificateRequest {
  ourRef: string;
  yourRef: string;
  dateIssued: string;
  certificateNumber: string;
  bearerName: string;
  nativeOf: string;
  village: string;
  qrCodeData: string;
  passportPhoto?: string;
}

interface TemplateData {
  ourRef: string;
  yourRef: string;
  dateIssued: string;
  certificateNumber: string;
  bearerName: string;
  nativeOf: string;
  village: string;
  qrCodeData: string;
  logoBase64: string;
  passportPhoto?: string;
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log('🚀 Certificate generation request started:', {
      timestamp: new Date().toISOString(),
      client_id: req.headers.get('x-forwarded-for'),
      method: req.method
    });

    if (req.method !== 'POST') {
      console.error('❌ Invalid method:', req.method);
      return new Response(JSON.stringify({ error: 'Method not allowed' }), {
        status: 405,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const body = await req.json();
    console.log('📝 Certificate generation request:', {
      timestamp: new Date().toISOString(),
      client_id: req.headers.get('x-forwarded-for'),
      bearer_name: body.bearerName
    });

    const {
      ourRef,
      yourRef,
      dateIssued,
      certificateNumber,
      bearerName,
      nativeOf,
      village,
      qrCodeData,
      passportPhoto
    }: CertificateRequest = body;

    // Validate required fields
    if (!ourRef || !yourRef || !dateIssued || !certificateNumber || !bearerName || !nativeOf || !village || !qrCodeData) {
      console.error('❌ Missing required fields:', { ourRef, yourRef, dateIssued, certificateNumber, bearerName, nativeOf, village, qrCodeData });
      return new Response(JSON.stringify({ error: 'Missing required fields' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    console.log('✅ Starting certificate generation process...');

    // Generate QR code
    console.log('🔄 Generating QR code...');
    let qrCodeBase64;
    try {
      const qrResponse = await fetch('https://api.qrserver.com/v1/create-qr-code/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: `data=${encodeURIComponent(qrCodeData)}&size=150x150&format=png`
      });

      if (!qrResponse.ok) {
        throw new Error(`QR code generation failed: ${qrResponse.statusText}`);
      }

      const qrBuffer = await qrResponse.arrayBuffer();
      const qrBytes = new Uint8Array(qrBuffer);
      let qrBinary = '';
      const chunkSize = 8192;
      
      for (let i = 0; i < qrBytes.length; i += chunkSize) {
        const chunk = qrBytes.slice(i, i + chunkSize);
        qrBinary += String.fromCharCode.apply(null, Array.from(chunk));
      }
      
      qrCodeBase64 = `data:image/png;base64,${btoa(qrBinary)}`;
      console.log('✅ QR code generated successfully');
    } catch (error) {
      console.error('❌ QR code generation failed:', error);
      qrCodeBase64 = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg=='; // 1x1 transparent PNG
    }

    // Load certificate template
    console.log('🔄 Loading certificate template...');
    let templateHTML;
    try {
      templateHTML = await loadCertificateTemplate();
      console.log('✅ Template loaded successfully, length:', templateHTML.length);
    } catch (error) {
      console.error('❌ Failed to load template from storage, using embedded template:', error);
      templateHTML = getEmbeddedTemplate();
      console.log('✅ Using embedded template, length:', templateHTML.length);
    }

    // Load logo
    console.log('🔄 Loading logo...');
    let logoBase64;
    try {
      logoBase64 = await loadLogo();
      console.log('✅ Logo loaded successfully');
    } catch (error) {
      console.error('❌ Logo loading failed:', error);
      logoBase64 = getDefaultLogoBase64();
      console.log('✅ Using default logo');
    }

    // Populate the template
    console.log('🔄 Populating template with data...');
    try {
      const populatedHTML = populateTemplate(templateHTML, {
        ourRef,
        yourRef,
        dateIssued,
        certificateNumber,
        bearerName,
        nativeOf,
        village,
        qrCodeData: qrCodeBase64,
        logoBase64,
        passportPhoto
      });
      console.log('✅ Template populated successfully, final length:', populatedHTML.length);

      // Check if the template contains border styling
      const hasBorder = populatedHTML.includes('border:') || populatedHTML.includes('border-');
      console.log('🎨 Template border check:', hasBorder ? 'Border styling found' : 'No border styling found');

      // Save to storage if available
      console.log('🔄 Attempting to save to Supabase Storage...');
      let htmlUrl = null;
      let pdfUrl = null;
      
      try {
        const supabaseUrl = Deno.env.get('SUPABASE_URL');
        const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
        
        if (supabaseUrl && supabaseKey) {
          const supabase = createClient(supabaseUrl, supabaseKey);
          const filename = `certificate_${certificateNumber.replace(/\s+/g, '_')}`;
          
          // Save HTML
          const { data: htmlData, error: htmlError } = await supabase.storage
            .from('certificates')
            .upload(`2025/${filename}.html`, populatedHTML, {
              contentType: 'text/html',
              upsert: true
            });
          
          if (htmlError) {
            console.error('❌ HTML storage error:', htmlError);
          } else {
            htmlUrl = `${supabaseUrl}/storage/v1/object/public/certificates/2025/${filename}.html`;
            console.log('✅ Certificate HTML saved to storage:', htmlUrl);
          }
        } else {
          console.warn('⚠️ Supabase storage not configured');
        }
      } catch (storageError) {
        console.error('❌ Storage operation failed:', storageError);
      }

      console.log('🎉 Certificate generation completed successfully');
      return new Response(JSON.stringify({
        success: true,
        html: populatedHTML,
        htmlUrl,
        pdfUrl,
        qrCode: qrCodeBase64,
        certificateNumber,
        debug: {
          templateLength: populatedHTML.length,
          hasBorder,
          timestamp: new Date().toISOString()
        }
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
      
    } catch (templateError) {
      console.error('❌ Template population failed:', templateError);
      throw new Error(`Template processing failed: ${templateError.message}`);
    }

  } catch (error) {
    console.error('💥 Certificate generation error:', {
      message: error.message,
      stack: error.stack,
      timestamp: new Date().toISOString()
    });
    return new Response(JSON.stringify({ 
      error: error.message || 'Failed to generate certificate',
      details: error.stack || 'No stack trace available',
      timestamp: new Date().toISOString()
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});

// Function to load certificate template from Supabase Storage
async function loadCertificateTemplate(): Promise<string> {
  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    
    if (!supabaseUrl) {
      throw new Error('SUPABASE_URL not configured');
    }
    
    // Try to load from public bucket
    const templateUrl = `${supabaseUrl}/storage/v1/object/public/static-assets/certificate-template.html`;
    const response = await fetch(templateUrl);
    
    if (!response.ok) {
      throw new Error(`Template fetch failed: ${response.statusText}`);
    }
    
    return await response.text();
  } catch (error) {
    console.error('Template loading error:', error);
    throw error;
  }
}

// Function to load logo from storage
async function loadLogo(): Promise<string> {
  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    let logoUrl;
    
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
        .certificate-container { 
            width: 176mm; 
            height: 250mm; 
            background: #ffffff; 
            position: relative; 
            margin: 0 auto; 
            padding: 15mm; 
            box-sizing: border-box; 
            font-family: 'Georgia', serif; 
            display: flex; 
            flex-direction: column; 
            overflow: hidden;
            border: 6px solid #00A859;
        }
        .security-background { position: absolute; top: 0; left: 0; right: 0; bottom: 0; background-image: repeating-linear-gradient(45deg, transparent, transparent 80px, rgba(0, 166, 80, 0.02) 80px, rgba(0, 166, 80, 0.02) 160px), repeating-linear-gradient(-45deg, transparent, transparent 60px, rgba(0, 174, 239, 0.015) 60px, rgba(0, 174, 239, 0.015) 120px); z-index: 0; }
        .header { text-align: center; margin-bottom: 15px; position: relative; z-index: 2; padding-top: 5px; }
        .header h1 { font-size: 34px; font-family: 'Arial Black', 'Impact', sans-serif; font-weight: 1000; color: #00a650; letter-spacing: 1px; margin: 0 0 15px 0; padding: 0 5px; text-shadow: 2px 2px 3px rgba(0,0,0,0.15); white-space: nowrap; width: 100%; text-transform: uppercase; -webkit-text-stroke: 1.5px #00a650; }
        .header h2 { font-size: 20px; color: #2c3e50; font-weight: 600; margin-bottom: 12px; letter-spacing: 1.5px; }
        .header-line { width: 200px; height: 3px; background: linear-gradient(90deg, #00a650, #00aeef, #00a650); margin: 10px auto 15px auto; border-radius: 2px; }
        .reference-section { display: grid; grid-template-columns: 1fr auto 1fr; gap: 15px; align-items: center; margin-bottom: 15px; font-size: 13px; position: relative; z-index: 2; padding: 0 10px; }
        .left-refs { text-align: left; display: flex; flex-direction: column; align-items: center; justify-content: center; }
        .left-refs p { margin-bottom: 6px; font-weight: 500; color: #2c3e50; }
        .left-refs .ref-label { font-weight: 600; color: #00a650; font-size: 15px; }
        .center-seal { text-align: center; justify-self: center; }
        .government-seal { width: 120px; height: 120px; border-radius: 50%; display: flex; align-items: center; justify-content: center; margin: 0 auto 6px auto; position: relative; background: #ffffff; box-shadow: 0 4px 15px rgba(0,0,0,0.15); border: 4px solid #00a650; padding: 4px; overflow: hidden; }
        .seal-motto { font-size: 12px; font-weight: bold; color: #a60000; margin-top: 6px; letter-spacing: 0.5px; }
        .right-info { text-align: right; padding-top: 10px; }
        .right-info p { margin-bottom: 4px; color: #2c3e50; }
        .right-info .address-line { font-size: 12px; color: #666; }
        .right-info .date-line { font-weight: 600; color: #00a650; margin-top: 6px; font-size: 12px; }
        .title { font-size: 32px; color: #00aeef; margin: 15px 0 20px; font-family: 'Georgia', serif; font-style: italic; position: relative; z-index: 2; text-shadow: 2px 2px 4px rgba(0,0,0,0.1); font-weight: bold; text-align: center; letter-spacing: 1px; }
        .content { font-size: 20px; line-height: 1.8; text-align: justify; margin: 5px auto; position: relative; z-index: 2; background: rgba(255,255,255,0.9); padding: 15px 25px; border-radius: 8px; box-shadow: 0 3px 10px rgba(0,0,0,0.1); flex-grow: 0; font-family: 'Georgia', serif; width: fit-content; max-width: 95%; min-width: 80%; }
        .content-text { text-align: justify; font-family: 'Georgia', serif; display: flex; flex-direction: column; gap: 15px; }
        .content-text p { margin: 0; color: #2c3e50; text-align: justify; font-family: 'Georgia', serif; padding: 0 5px; }
        .content-text p strong { color: #00a650; font-size: 20px; letter-spacing: 0.5px; font-weight: bold; text-decoration: underline; font-family: 'Georgia', serif; }
        .passport-photo { width: 120px; height: 150px; border: 3px solid #00a650; border-radius: 8px; box-shadow: 0 4px 12px rgba(0,0,0,0.2); overflow: hidden; background: rgba(255,255,255,0.95); display: flex; align-items: center; justify-content: center; margin: 5px auto; }
        .passport-photo img { width: 100%; height: 100%; object-fit: cover; }
        .passport-placeholder { color: #666; font-size: 12px; text-align: center; padding: 10px; }
        .footer { margin-top: auto; position: relative; z-index: 2; margin-bottom: 10px; }
        .footer-content { display: flex; justify-content: space-between; align-items: flex-end; width: 100%; padding: 0 15px; gap: 15px; }
        .signature { text-align: center; background: rgba(255,255,255,0.95); padding: 12px 20px; border-radius: 8px; box-shadow: 0 4px 12px rgba(0,0,0,0.15); font-size: 13px; font-weight: 600; flex-shrink: 0; min-width: 180px; }
        .signature::before { content: ''; display: block; border-bottom: 2px dotted #2c3e50; height: 40px; margin-bottom: 8px; }
        .qr-code { width: 110px; height: 110px; border: 2px solid #00a650; display: flex; align-items: center; justify-content: center; font-size: 10px; color: #00a650; background: rgba(255,255,255,0.95); z-index: 2; border-radius: 6px; box-shadow: 0 4px 12px rgba(0,0,0,0.15); text-align: center; flex-shrink: 0; }
        .watermark { position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%) rotate(-30deg); font-size: 42px; color: rgba(0, 166, 80, 0.08); font-weight: bold; z-index: 0; white-space: nowrap; letter-spacing: 2px; width: 100%; text-align: center; overflow: hidden; }
        .security-microtext { position: absolute; font-size: 4px; color: rgba(0, 166, 80, 0.3); font-weight: bold; line-height: 1; letter-spacing: 0.5px; z-index: 1; }
        .microtext-top { top: 30px; left: 30px; right: 30px; text-align: center; }
        .microtext-bottom { bottom: 30px; left: 30px; right: 30px; text-align: center; }
        .microtext-left { left: 20px; top: 50%; transform: rotate(-90deg); transform-origin: left center; }
        .microtext-right { right: 20px; top: 50%; transform: rotate(90deg); transform-origin: right center; }
    </style>
</head>
<body>
    <div class="certificate-container">
        <div class="security-background"></div>
        <div class="watermark">IBENO LOCAL GOVERNMENT</div>
        
        <div class="security-microtext microtext-top">ABASI ULOK-ULOK AYE AYE•ABASI ULOK-ULOK AYE AYE•ABASI ULOK-ULOK AYE AYE</div>
        <div class="security-microtext microtext-bottom">ABASI ULOK-ULOK AYE AYE•ABASI ULOK-ULOK AYE AYE•ABASI ULOK-ULOK AYE AYE</div>
        <div class="security-microtext microtext-left">ABASI ULOK-ULOK AYE AYE•ABASI ULOK-ULOK AYE AYE•ABASI ULOK-ULOK AYE AYE</div>
        <div class="security-microtext microtext-right">ABASI ULOK-ULOK AYE AYE•ABASI ULOK-ULOK AYE AYE•ABASI ULOK-ULOK AYE AYE</div>
        
        <div class="header">
            <h1>IBENO LOCAL GOVERNMENT</h1>
            <h2>AKWA IBOM STATE</h2>
            <div class="header-line"></div>
        </div>
        
        <div class="reference-section">
            <div class="left-refs">
                <div class="passport-photo" id="passport_photo_placeholder">
                    <div class="passport-placeholder">Passport<br>Photo</div>
                </div>
            </div>
            <div class="center-seal">
                <div class="government-seal">
                    <img id="logo_placeholder" src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==" alt="Ibeno Local Government Logo" style="width: 100%; height: 100%; object-fit: contain; border-radius: 50%;" />
                </div>
                <div class="seal-motto">UNITY AND LABOUR!</div>
            </div>
            <div class="right-info">
                <p class="ref-label">Our Ref:</p>
                <p id="our_ref">REF-NUMBER</p>
                <p class="ref-label">Your Ref:</p>
                <p id="your_ref">YOUR-REF</p>
                <p class="address-line">Local Government Secretariat</p>
                <p class="address-line">Upenekang Town</p>
                <p class="address-line">Ibeno Local Government Area</p>
                <p class="address-line">Akwa Ibom State</p>
                <p class="date-line" id="date">DATE</p>
                <p><span class="ref-label">Cert. No:</span> <span id="certificate_number">CERT-NUMBER</span></p>
            </div>
        </div>
        
        <div class="title">Certificate of Origin</div>
        <div class="content">
            <div class="content-text">
                <p>This is to formally certify that:</p>
                <p>The bearer <strong id="bearer_name">BEARER_NAME</strong> is a native of Ekpuk <strong id="native_of">NATIVE_OF</strong> in <strong id="village">VILLAGE</strong> Village, and a recognized indigene of Ibeno Local Government Area, Akwa Ibom State.</p>
                <p>The bearer is therefore entitled to all the rights, recognition, and assistance that come with being a native of this esteemed locality.</p>
            </div>
        </div>
        
        <div class="footer">
            <div class="footer-content">
                <div class="qr-code" id="qr_code_placeholder">
                    QR Code for Verification
                </div>
                <div class="signature">
                    HON. SUNDAY FRIDAY ADIAKPAN<br>
                    EXECUTIVE CHAIRMAN<br>
                    IBENO L.G.A.
                </div>
            </div>
        </div>
    </div>
</body>
</html>`;
}

function populateTemplate(template: string, data: TemplateData): string {
  let result = template;
  
  // Replace placeholders with actual data
  result = result.replace(/REF-NUMBER/g, data.ourRef);
  result = result.replace(/YOUR-REF/g, data.yourRef);
  result = result.replace(/DATE/g, formatDate(data.dateIssued));
  result = result.replace(/CERT-NUMBER/g, data.certificateNumber);
  result = result.replace(/BEARER_NAME/g, data.bearerName);
  result = result.replace(/NATIVE_OF/g, data.nativeOf);
  result = result.replace(/VILLAGE/g, data.village);
  
  // Replace element content using getElementById placeholders
  result = result.replace(/<span id="our_ref"[^>]*>.*?<\/span>/g, `<span id="our_ref">${data.ourRef}</span>`);
  result = result.replace(/<span id="your_ref"[^>]*>.*?<\/span>/g, `<span id="your_ref">${data.yourRef}</span>`);
  result = result.replace(/<span id="certificate_number"[^>]*>.*?<\/span>/g, `<span id="certificate_number">${data.certificateNumber}</span>`);
  result = result.replace(/<strong id="bearer_name"[^>]*>.*?<\/strong>/g, `<strong id="bearer_name">${data.bearerName}</strong>`);
  result = result.replace(/<strong id="native_of"[^>]*>.*?<\/strong>/g, `<strong id="native_of">${data.nativeOf}</strong>`);
  result = result.replace(/<strong id="village"[^>]*>.*?<\/strong>/g, `<strong id="village">${data.village}</strong>`);
  result = result.replace(/<p id="date"[^>]*>.*?<\/p>/g, `<p class="date-line" id="date">${formatDate(data.dateIssued)}</p>`);
  
  // Replace logo
  if (data.logoBase64) {
    result = result.replace(/src="[^"]*" alt="Ibeno Local Government Logo"/, `src="data:image/png;base64,${data.logoBase64}" alt="Ibeno Local Government Logo"`);
  }
  
  // Replace QR code
  if (data.qrCodeData) {
    result = result.replace(/<div class="qr-code"[^>]*>.*?<\/div>/g, 
      `<div class="qr-code" id="qr_code_placeholder"><img src="${data.qrCodeData}" alt="QR Code for Certificate Verification" style="width: 100%; height: 100%; object-fit: contain;" /></div>`);
  }
  
  // Replace passport photo if provided
  if (data.passportPhoto) {
    result = result.replace(/<div class="passport-photo"[^>]*>.*?<\/div>/g,
      `<div class="passport-photo" id="passport_photo_placeholder"><img src="${data.passportPhoto}" alt="Passport Photo" style="width: 100%; height: 100%; object-fit: cover;" /></div>`);
  }
  
  return result;
}

function formatDate(dateString: string): string {
  try {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-GB', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
  } catch (error) {
    return dateString;
  }
}

function getDefaultLogoBase64(): string {
  // A simple placeholder logo (1x1 transparent PNG)
  return 'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==';
}