import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface VerifyRequestBody {
  query: string; // certificate_number or id
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { query }: VerifyRequestBody = await req.json();

    if (!query || typeof query !== 'string' || !query.trim()) {
      return new Response(
        JSON.stringify({ error: 'Query is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const serviceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

    if (!supabaseUrl || !serviceKey) {
      console.error('Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY');
      return new Response(
        JSON.stringify({ error: 'Server not configured' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const supabase = createClient(supabaseUrl, serviceKey);
    const q = query.trim();

    // Step 1: try by certificate_number
    const { data: byNumber, error: byNumberError } = await supabase
      .from('certificates')
      .select('certificate_number, date_issued, status')
      .eq('certificate_number', q)
      .maybeSingle();

    if (byNumberError) {
      console.error('Error querying by certificate_number:', byNumberError);
    }

    let result = byNumber;

    // Step 2: fallback try by id (uuid)
    if (!result) {
      const { data: byId, error: byIdError } = await supabase
        .from('certificates')
        .select('certificate_number, date_issued, status')
        .eq('id', q)
        .maybeSingle();

      if (byIdError) {
        console.error('Error querying by id:', byIdError);
      }

      result = byId ?? null;
    }

    if (!result) {
      return new Response(
        JSON.stringify({ found: false }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Only return non-PII fields
    return new Response(
      JSON.stringify({
        found: true,
        certificate: {
          certificate_number: result.certificate_number,
          date_issued: result.date_issued,
          status: result.status,
        }
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('verify-certificate error:', error);
    return new Response(
      JSON.stringify({ error: 'Internal Server Error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
