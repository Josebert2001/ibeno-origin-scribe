import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface QRCodeRequest {
  text: string;
  size?: number;
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { text, size = 200 }: QRCodeRequest = await req.json();

    if (!text) {
      return new Response(
        JSON.stringify({ error: 'Text parameter is required' }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    // Use QR Server API to generate QR code
    const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=${size}x${size}&data=${encodeURIComponent(text)}&format=png`;
    
    const qrResponse = await fetch(qrUrl);
    
    if (!qrResponse.ok) {
      throw new Error('Failed to generate QR code');
    }

    const qrImageBuffer = await qrResponse.arrayBuffer();
    const base64QR = btoa(String.fromCharCode(...new Uint8Array(qrImageBuffer)));

    return new Response(
      JSON.stringify({ 
        qrCode: `data:image/png;base64,${base64QR}`,
        text,
        size 
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );

  } catch (error) {
    console.error('Error generating QR code:', error);
    return new Response(
      JSON.stringify({ error: 'Failed to generate QR code', details: error.message }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});