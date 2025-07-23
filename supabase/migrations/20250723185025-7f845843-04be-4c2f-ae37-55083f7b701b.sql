-- 1. Tabla para perfiles de usuario (mínima para empezar)
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Los usuarios pueden ver su propio perfil" ON public.profiles 
FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Los usuarios pueden insertar su propio perfil" ON public.profiles 
FOR INSERT WITH CHECK (auth.uid() = id);

-- 2. Tabla para el sistema de referidos
CREATE TABLE public.referrals (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  referral_code TEXT UNIQUE NOT NULL,
  referred_by_code TEXT, -- El código de quien lo refirió
  referral_count INTEGER DEFAULT 0 NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE public.referrals ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Los usuarios pueden ver sus propios datos de referido" ON public.referrals 
FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Los usuarios pueden insertar sus propios datos de referido" ON public.referrals 
FOR INSERT WITH CHECK (auth.uid() = id);

CREATE POLICY "Permitir lectura a la Edge Function" ON public.referrals 
FOR SELECT USING (true);

-- 3. Función de Base de Datos para incrementar el contador de forma segura (previene race conditions)
CREATE OR REPLACE FUNCTION increment_referral_count(p_referral_code TEXT)
RETURNS void AS $$
BEGIN
  UPDATE public.referrals
  SET referral_count = referral_count + 1
  WHERE referral_code = p_referral_code;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;