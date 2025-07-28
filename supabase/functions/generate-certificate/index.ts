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

    // First, generate QR code
    const qrResponse = await fetch(`${req.url.split('/functions')[0]}/functions/v1/generate-qr-code`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': req.headers.get('Authorization') || '',
      },
      body: JSON.stringify({ text: certificateData.qrCodeData, size: 150 })
    });

    if (!qrResponse.ok) {
      throw new Error('Failed to generate QR code');
    }

    const { qrCode } = await qrResponse.json();

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
            @page {
                size: A4;
                margin: 0;
            }
            body {
                margin: 0;
                padding: 20px;
                font-family: 'Times New Roman', serif;
                background: white;
                width: 794px;
                height: 1123px;
                position: relative;
                background-image: url('data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" width="794" height="1123"><defs><pattern id="border" x="0" y="0" width="20" height="20" patternUnits="userSpaceOnUse"><rect width="20" height="20" fill="none" stroke="%23228B22" stroke-width="2"/></pattern></defs><rect width="794" height="1123" fill="url(%23border)" opacity="0.1"/></svg>');
            }
            .certificate-container {
                border: 8px solid #228B22;
                border-radius: 15px;
                padding: 40px;
                height: calc(100% - 80px);
                position: relative;
                background: white;
            }
            .header {
                text-align: center;
                margin-bottom: 30px;
            }
            .header h1 {
                font-size: 28px;
                font-weight: bold;
                color: #228B22;
                margin: 0;
                text-transform: uppercase;
                letter-spacing: 2px;
            }
            .header .state {
                font-size: 16px;
                color: #228B22;
                margin: 5px 0;
                font-weight: bold;
            }
            .header .motto {
                font-size: 14px;
                color: #228B22;
                font-style: italic;
                margin: 10px 0;
            }
            .refs {
                display: flex;
                justify-content: space-between;
                margin: 20px 0;
                font-size: 14px;
            }
            .date-number {
                text-align: center;
                margin: 30px 0;
            }
            .date {
                font-size: 16px;
                margin-bottom: 20px;
            }
            .cert-number {
                font-size: 24px;
                font-weight: bold;
                color: #228B22;
                margin-bottom: 10px;
            }
            .title {
                text-align: center;
                font-size: 32px;
                font-weight: bold;
                color: #228B22;
                text-decoration: underline;
                margin: 30px 0;
                text-transform: uppercase;
            }
            .content {
                font-size: 18px;
                line-height: 2;
                text-align: center;
                margin: 40px 0;
            }
            .bearer-name {
                font-weight: bold;
                text-transform: uppercase;
                font-size: 20px;
                text-decoration: underline;
            }
            .location {
                font-weight: bold;
            }
            .signature-section {
                position: absolute;
                bottom: 60px;
                right: 60px;
                text-align: center;
            }
            .qr-code {
                position: absolute;
                bottom: 180px;
                right: 60px;
                width: 120px;
                height: 120px;
            }
            .qr-code img {
                width: 100%;
                height: 100%;
            }
            .signature-name {
                font-weight: bold;
                font-size: 16px;
                margin-top: 20px;
                border-top: 2px solid #000;
                padding-top: 5px;
            }
            .signature-title {
                font-size: 14px;
                color: #228B22;
                font-weight: bold;
            }
            .footer-motto {
                position: absolute;
                bottom: 20px;
                left: 50%;
                transform: translateX(-50%);
                font-size: 14px;
                color: #228B22;
                font-weight: bold;
                text-transform: uppercase;
            }
        </style>
    </head>
    <body>
        <div class="certificate-container">
            <div class="header">
                <h1>Ibeno Local Government</h1>
                <div class="state">Akwa Ibom State</div>
                <div>Local Government Office</div>
                <div>Upenekang Town</div>
                <div class="motto">Unity and Labour</div>
            </div>
            
            <div class="refs">
                <div>Our Ref: <strong>${certificateData.ourRef}</strong></div>
                <div>Your Ref: <strong>${certificateData.yourRef}</strong></div>
            </div>
            
            <div class="date-number">
                <div class="date">${dateFormatted}</div>
                <div class="cert-number">${certificateData.certificateNumber}</div>
            </div>
            
            <div class="title">Certificate of Origin</div>
            
            <div class="content">
                This is to Certify that<br><br>
                The bearer, <span class="bearer-name">${certificateData.bearerName}</span><br><br>
                is a native of <span class="location">${certificateData.nativeOf}</span><br><br>
                in <span class="location">${certificateData.village}</span> Village, and<br><br>
                therefore an indigene of Ibeno Local Government Area. You are please<br>
                requested to give him/her every possible assistance.
            </div>
            
            <div class="qr-code">
                <img src="${qrCode}" alt="QR Code" />
            </div>
            
            <div class="signature-section">
                <div style="width: 200px; height: 60px; border-bottom: 2px solid #000; margin-bottom: 10px;"></div>
                <div class="signature-name">JOHN TOLOM</div>
                <div class="signature-title">Executive Chairman</div>
                <div class="signature-title">Ibeno Local Government</div>
            </div>
            
            <div class="footer-motto">Unity and Labour</div>
        </div>
    </body>
    </html>
    `;

    // Convert HTML to PDF using Puppeteer via external service
    const pdfResponse = await fetch('https://api.html-pdf-node.com/pdf', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        html: certificateHTML,
        options: {
          format: 'A4',
          printBackground: true,
          margin: {
            top: '0px',
            right: '0px',
            bottom: '0px',
            left: '0px'
          }
        }
      })
    });

    if (!pdfResponse.ok) {
      // Fallback: return HTML content if PDF generation fails
      return new Response(
        JSON.stringify({ 
          html: certificateHTML,
          qrCode,
          message: 'PDF generation service unavailable, returning HTML template'
        }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }

    const pdfBuffer = await pdfResponse.arrayBuffer();
    const base64PDF = btoa(String.fromCharCode(...new Uint8Array(pdfBuffer)));

    return new Response(
      JSON.stringify({ 
        pdf: `data:application/pdf;base64,${base64PDF}`,
        html: certificateHTML,
        qrCode,
        certificateNumber: certificateData.certificateNumber
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