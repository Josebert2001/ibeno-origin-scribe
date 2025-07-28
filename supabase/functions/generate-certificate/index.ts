import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1';

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

    // Format the date for display
    const dateFormatted = new Date(certificateData.dateIssued).toLocaleDateString('en-GB', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });

    // Create HTML template for the certificate (pixel-perfect replication)
    const certificateHTML = `
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="UTF-8">
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
                border-image: url('data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><defs><pattern id="ornate" x="0" y="0" width="10" height="10" patternUnits="userSpaceOnUse"><circle cx="5" cy="5" r="2" fill="%230B7B3E"/><path d="M0,5 Q5,0 10,5 Q5,10 0,5" fill="none" stroke="%230B7B3E" stroke-width="1"/></pattern></defs><rect width="100" height="100" fill="url(%23ornate)"/></svg>') 12 repeat;
                padding: 20mm;
                box-sizing: border-box;
            }
            .ornate-border {
                position: absolute;
                top: 0;
                left: 0;
                right: 0;
                bottom: 0;
                border: 8px solid #0B7B3E;
                border-radius: 8px;
                background: repeating-linear-gradient(
                    0deg,
                    transparent,
                    transparent 2px,
                    #0B7B3E 2px,
                    #0B7B3E 4px
                ),
                repeating-linear-gradient(
                    90deg,
                    transparent,
                    transparent 2px,
                    #0B7B3E 2px,
                    #0B7B3E 4px
                );
                opacity: 0.3;
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
            .coat-of-arms {
                position: absolute;
                top: -5mm;
                left: 10mm;
                width: 20mm;
                height: 20mm;
                background: url('data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><circle cx="50" cy="50" r="40" fill="%23FFD700" stroke="%23000" stroke-width="2"/><text x="50" y="55" text-anchor="middle" font-size="12" font-weight="bold">NIGERIA</text></svg>') no-repeat center center;
                background-size: contain;
            }
            .govt-seal {
                position: absolute;
                top: -5mm;
                right: 10mm;
                width: 20mm;
                height: 20mm;
                background: url('data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><circle cx="50" cy="50" r="40" fill="%230B7B3E" stroke="%23000" stroke-width="2"/><text x="50" y="45" text-anchor="middle" font-size="8" font-weight="bold" fill="white">IBENO</text><text x="50" y="60" text-anchor="middle" font-size="6" fill="white">LOCAL GOVT</text></svg>') no-repeat center center;
                background-size: contain;
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
            .refs div {
                min-width: 60mm;
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
            .content .formal-text {
                text-align: center;
                margin-bottom: 8mm;
                font-weight: bold;
            }
            .bearer-info {
                margin: 8mm 0;
                line-height: 2.2;
            }
            .bearer-name {
                border-bottom: 2px dotted #000;
                min-width: 80mm;
                display: inline-block;
                text-align: center;
                font-weight: bold;
                text-transform: uppercase;
                padding: 1mm 3mm;
            }
            .location-info {
                border-bottom: 2px dotted #000;
                min-width: 60mm;
                display: inline-block;
                text-align: center;
                font-weight: bold;
                padding: 1mm 3mm;
            }
            .footer-content {
                margin-top: 8mm;
                text-align: justify;
                line-height: 1.6;
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
            .signature-name {
                font-weight: bold;
                margin-bottom: 1mm;
            }
            .signature-title {
                font-size: 9pt;
                color: #0B7B3E;
                font-weight: bold;
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
            .qr-code {
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
            .qr-code img {
                width: 95%;
                height: 95%;
                object-fit: contain;
            }
        </style>
    </head>
    <body>
        <div class="certificate-container">
            <div class="ornate-border"></div>
            <div class="inner-content">
                <div class="coat-of-arms"></div>
                <div class="govt-seal"></div>
                
                <div class="header">
                    <h1>Ibeno Local Government</h1>
                    <div class="state">Akwa Ibom State</div>
                    <div class="location">Ibeno Secretariat,</div>
                    <div class="location">Upenekang Town</div>
                </div>
                
                <div class="refs">
                    <div>Our Ref: <strong>${certificateData.ourRef}</strong></div>
                    <div>Your Ref: <strong>${certificateData.yourRef}</strong></div>
                </div>
                
                <div class="date-section">
                    <strong>${dateFormatted}</strong>
                </div>
                
                <div class="cert-number">${certificateData.certificateNumber}</div>
                
                <div class="title">Certificate of Origin</div>
                
                <div class="content">
                    <div class="formal-text">This is to formally certify that:</div>
                    
                    <div class="bearer-info">
                        The bearer <span class="bearer-name">${certificateData.bearerName}</span>
                    </div>
                    
                    <div class="bearer-info">
                        is a native of <span class="location-info">${certificateData.nativeOf}</span> in
                    </div>
                    
                    <div class="bearer-info">
                        <span class="location-info">${certificateData.village}</span> Village, and recognized indigene of Ibeno
                    </div>
                    
                    <div class="bearer-info">
                        Local Government Area, Akwa Ibom State.
                    </div>
                    
                    <div class="footer-content">
                        The bearer is therefore entitled to all the rights, recognition, and assistance 
                        that come with being a native of this esteemed locality.
                    </div>
                </div>
                
                <div class="qr-code">
                    <img src="${qrCode}" alt="QR Code" />
                </div>
                
                <div class="red-seal"></div>
                
                <div class="signature-section">
                    <div class="signature-box"></div>
                    <div class="signature-text">
                        <div class="signature-name">Executive Chairman</div>
                        <div class="signature-title">Ibeno Local Government</div>
                    </div>
                </div>
            </div>
        </div>
    </body>
    </html>
    `;

    // Return HTML template for browser-based PDF generation
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