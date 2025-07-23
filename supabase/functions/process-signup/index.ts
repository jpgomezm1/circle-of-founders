import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { corsHeaders } from '../_shared/cors.ts';

const generateReferralCode = (email: string): string => {
  const namePart = email.split('@')[0].replace(/[^a-zA-Z0-9]/g, '').toUpperCase().substring(0, 4);
  const randomPart = Math.random().toString(36).substring(2, 6).toUpperCase();
  return `${namePart}${randomPart}`;
};

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });

  try {
    const { userId, email, referred_by_code } = await req.json();

    console.log('Processing signup for:', { userId, email, referred_by_code });

    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // 1. Crear perfil mínimo
    const { error: profileError } = await supabaseAdmin
      .from('profiles')
      .insert({ id: userId, email });

    if (profileError) {
      console.error('Error creating profile:', profileError);
      throw profileError;
    }

    // 2. Generar código y crear entrada en la tabla de referidos
    const referral_code = generateReferralCode(email);
    const { error: referralError } = await supabaseAdmin
      .from('referrals')
      .insert({
        id: userId,
        email,
        referral_code,
        referred_by_code,
      });

    if (referralError) {
      console.error('Error creating referral:', referralError);
      throw referralError;
    }

    // 3. Si fue referido, invocar la función de DB para incrementar el contador
    if (referred_by_code) {
      const { error: incrementError } = await supabaseAdmin
        .rpc('increment_referral_count', { p_referral_code: referred_by_code });
      
      if (incrementError) {
        console.error('Error incrementing referral count:', incrementError);
        // No throw aquí porque el usuario ya se registró exitosamente
      }
    }

    console.log('Signup processed successfully for:', email);

    return new Response(JSON.stringify({ 
      message: 'Signup processed successfully',
      referral_code 
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    });
  } catch (err) {
    console.error('Error in process-signup:', err);
    return new Response(JSON.stringify({ 
      error: String(err?.message ?? err) 
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 500,
    });
  }
});