import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
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

async function loadCertificateTemplate(): Promise<string> {
  try {
    // In a real deployment, you might want to fetch this from a URL or store it as a constant
    // For now, we'll return the template as a string
    const templateResponse = await fetch('https://raw.githubusercontent.com/your-repo/certificate-template.html');
    if (templateResponse.ok) {
      return await templateResponse.text();
    }
  } catch (error) {
    console.log('Could not fetch external template, using embedded template');
  }
  
  // Fallback to embedded template
  return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Certificate of Origin - Ibeno Local Government</title>
    <style>
        @import url('https://fonts.googleapis.com/css2?family=Dancing+Script:wght@400;700&family=Times+New+Roman:wght@400;700&display=swap');
        
        @page {
            size: A4;
            margin: 0;
        }
        
        body {
            margin: 0;
            padding: 0;
            font-family: 'Times New Roman', serif;
            background: white;
            width: 210mm;
            height: 297mm;
            position: relative;
            display: flex;
            justify-content: center;
            align-items: center;
        }
        
        .certificate-container {
            width: 190mm;
            height: 270mm;
            position: relative;
            background: white;
            border: 12px solid #0B7B3E;
            padding: 20mm;
            box-sizing: border-box;
        }
        
        .inner-content {
            position: relative;
            z-index: 2;
            height: 100%;
            background: white;
            padding: 15mm;
            border: 2px solid #0B7B3E;
            border-radius: 4px;
        }
        
        .header {
            text-align: center;
            margin-bottom: 15mm;
            position: relative;
        }
        
        .header h1 {
            font-size: 24pt;
            font-weight: bold;
            color: #0B7B3E;
            margin: 0;
            text-transform: uppercase;
            letter-spacing: 3px;
            line-height: 1.2;
        }
        
        .header .state {
            font-size: 14pt;
            color: #0B7B3E;
            margin: 2mm 0;
            font-weight: bold;
            text-transform: uppercase;
        }
        
        .header .location {
            font-size: 11pt;
            color: #000;
            margin: 1mm 0;
        }
        
        .refs {
            display: flex;
            justify-content: space-between;
            margin: 8mm 0;
            font-size: 11pt;
        }
        
        .date-section {
            text-align: right;
            margin: 8mm 0;
            font-size: 11pt;
        }
        
        .cert-number {
            text-align: center;
            font-size: 18pt;
            font-weight: bold;
            color: #000;
            margin: 5mm 0;
            letter-spacing: 2px;
        }
        
        .title {
            text-align: center;
            font-family: 'Dancing Script', cursive;
            font-size: 36pt;
            font-weight: 700;
            color: #1E90FF;
            margin: 8mm 0;
            text-shadow: 1px 1px 2px rgba(0,0,0,0.1);
        }
        
        .content {
            font-size: 12pt;
            line-height: 1.8;
            text-align: justify;
            margin: 10mm 0;
            color: #000;
        }
        
        .bearer-info {
            margin: 8mm 0;
            line-height: 2.2;
        }
        
        .bearer-name, .location-info {
            border-bottom: 2px dotted #000;
            display: inline-block;
            text-align: center;
            font-weight: bold;
            text-transform: uppercase;
            padding: 1mm 3mm;
            min-width: 60mm;
        }
        
        .signature-section {
            position: absolute;
            bottom: 15mm;
            right: 20mm;
            text-align: center;
            width: 50mm;
        }
        
        .signature-box {
            width: 45mm;
            height: 20mm;
            border: 2px solid #000;
            margin-bottom: 3mm;
            background: white;
        }
        
        .signature-text {
            font-size: 10pt;
            line-height: 1.3;
        }
        
        .red-seal {
            position: absolute;
            bottom: 15mm;
            left: 20mm;
            width: 25mm;
            height: 25mm;
            background: radial-gradient(circle, #FF0000 0%, #CC0000 70%, #AA0000 100%);
            border-radius: 50%;
            border: 3px solid #AA0000;
            box-shadow: 0 0 10px rgba(255,0,0,0.5);
        }
        
        .qr-code-section {
            position: absolute;
            bottom: 50mm;
            right: 20mm;
            width: 25mm;
            height: 25mm;
            border: 1px solid #ccc;
            background: white;
            display: flex;
            align-items: center;
            justify-content: center;
        }
        
        .qr-code-section img {
            width: 95%;
            height: 95%;
            object-fit: contain;
        }
    </style>
</head>
<body>
    <div class="certificate-container">
        <div class="inner-content">
            <div class="header">
                <h1>Ibeno Local Government</h1>
                <div class="state">Akwa Ibom State</div>
                <div class="location">Ibeno Secretariat,</div>
                <div class="location">Upenekang Town</div>
            </div>
            
            <div class="refs">
                <div>Our Ref: <strong>{{ourRef}}</strong></div>
                <div>Your Ref: <strong>{{yourRef}}</strong></div>
            </div>
            
            <div class="date-section">
                <strong>{{date}}</strong>
            </div>
            
            <div class="cert-number">{{certificateNumber}}</div>
            
            <div class="title">Certificate of Origin</div>
            
            <div class="content">
                <div style="text-align: center; margin-bottom: 8mm; font-weight: bold;">
                    This is to formally certify that:
                </div>
                
                <div class="bearer-info">
                    The bearer <span class="bearer-name">{{bearerName}}</span>
                </div>
                
                <div class="bearer-info">
                    is a native of <span class="location-info">{{nativeOf}}</span> in
                </div>
                
                <div class="bearer-info">
                    <span class="location-info">{{village}}</span> Village, and recognized indigene of Ibeno
                </div>
                
                <div class="bearer-info">
                    Local Government Area, Akwa Ibom State.
                </div>
                
                <div style="margin-top: 8mm; text-align: justify; line-height: 1.6;">
                    The bearer is therefore entitled to all the rights, recognition, and assistance 
                    that come with being a native of this esteemed locality.
                </div>
            </div>
            
            <div class="qr-code-section">
                <img src="{{qrCode}}" alt="QR Code for Certificate Verification" />
            </div>
            
            <div class="red-seal"></div>
            
            <div class="signature-section">
                <div class="signature-box"></div>
                <div class="signature-text">
                    <div style="font-weight: bold; margin-bottom: 1mm;">Executive Chairman</div>
                    <div style="font-size: 9pt; color: #0B7B3E; font-weight: bold;">Ibeno Local Government</div>
                </div>
            </div>
        </div>
    </div>
</body>
</html>`;
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const certificateData: CertificateData = await req.json();

    // First, generate QR code using QR Server API directly
    const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${encodeURIComponent(certificateData.qrCodeData)}&format=png`;
    
    const qrResponse = await fetch(qrUrl);
    
    if (!qrResponse.ok) {
      throw new Error('Failed to generate QR code from external service');
    }

    const qrImageBuffer = await qrResponse.arrayBuffer();
    const base64QR = btoa(String.fromCharCode(...new Uint8Array(qrImageBuffer)));
    const qrCode = `data:image/png;base64,${base64QR}`;

    // Load the certificate template
    const template = await loadCertificateTemplate();

    // Format the date for display
    const dateFormatted = new Date(certificateData.dateIssued).toLocaleDateString('en-GB', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });

    // Replace template placeholders with actual data
    const certificateHTML = template
      .replace(/{{ourRef}}/g, certificateData.ourRef)
      .replace(/{{yourRef}}/g, certificateData.yourRef)
      .replace(/{{date}}/g, dateFormatted)
      .replace(/{{certificateNumber}}/g, certificateData.certificateNumber)
      .replace(/{{bearerName}}/g, certificateData.bearerName)
      .replace(/{{nativeOf}}/g, certificateData.nativeOf)
      .replace(/{{village}}/g, certificateData.village)
      .replace(/{{qrCode}}/g, qrCode);

    return new Response(
      JSON.stringify({ 
        html: certificateHTML,
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