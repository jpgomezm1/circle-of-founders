import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Users, Trophy, Star, Crown, ArrowRight, Mail, Lock } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const rewardsData = [
  { level: 1, icon: Users, title: "Acceso Exclusivo", description: "Entrada al grupo privado de WhatsApp" },
  { level: 3, icon: Star, title: "Material Premium", description: "Guías y templates exclusivos" },
  { level: 5, icon: Trophy, title: "Sesión 1:1", description: "Consulta personal de 30 minutos" },
  { level: 10, icon: Crown, title: "Cofundador", description: "Participación en las ganancias" }
];

export default function ValidationLanding() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSignUp, setIsSignUp] = useState(true);
  const [loading, setLoading] = useState(false);
  const { signUpWithReferral, signIn, user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    // Capturar código de referido de la URL
    const urlParams = new URLSearchParams(window.location.search);
    const refCode = urlParams.get('ref');
    if (refCode) {
      localStorage.setItem('referral_code', refCode);
      toast({
        title: "¡Código de referido aplicado!",
        description: `Has sido referido por ${refCode}`,
      });
    }
  }, [toast]);

  useEffect(() => {
    // Redirigir si ya está autenticado
    if (user) {
      navigate('/referrals');
    }
  }, [user, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) return;

    setLoading(true);
    try {
      const { error } = isSignUp 
        ? await signUpWithReferral(email, password)
        : await signIn(email, password);

      if (error) {
        toast({
          variant: "destructive",
          title: "Error",
          description: error.message === "User already registered" 
            ? "Este email ya está registrado. Intenta iniciar sesión."
            : error.message,
        });
      } else {
        if (isSignUp) {
          toast({
            title: "¡Registro exitoso!",
            description: "Bienvenido al Círculo Interno de Fundadores",
          });
        }
        navigate('/referrals');
      }
    } catch (err) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Ocurrió un error inesperado",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-dark text-foreground">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-16">
          <h1 className="text-5xl md:text-7xl font-bold mb-6 bg-gradient-primary bg-clip-text text-transparent">
            Deja de Usar IA.<br />Empieza a Crear con IA.
          </h1>
          <p className="text-xl md:text-2xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
            La academia para profesionales que quieren construir herramientas 
            y automatizaciones sin ser expertos en código.
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-12 items-start">
          {/* Sección de Recompensas */}
          <div className="space-y-8">
            <div className="text-center lg:text-left">
              <h2 className="text-3xl font-bold mb-4 text-primary">
                Recompensas por Referidos
              </h2>
              <p className="text-muted-foreground">
                Invita a otros fundadores y desbloquea beneficios exclusivos
              </p>
            </div>

            <div className="grid gap-4">
              {rewardsData.map((reward) => {
                const IconComponent = reward.icon;
                return (
                  <Card key={reward.level} className="border-border bg-card/50 backdrop-blur-sm hover:shadow-glow transition-all duration-300">
                    <CardContent className="p-6">
                      <div className="flex items-center gap-4">
                        <div className="p-3 rounded-full bg-primary/10 text-primary">
                          <IconComponent className="h-6 w-6" />
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <Badge variant="outline" className="text-primary border-primary">
                              {reward.level} {reward.level === 1 ? 'referido' : 'referidos'}
                            </Badge>
                          </div>
                          <h3 className="font-semibold text-foreground">{reward.title}</h3>
                          <p className="text-sm text-muted-foreground">{reward.description}</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </div>

          {/* Formulario de Registro */}
          <div className="flex justify-center">
            <Card className="w-full max-w-md border-border bg-card/50 backdrop-blur-sm shadow-glow-strong">
              <CardHeader className="text-center">
                <CardTitle className="text-2xl font-bold text-primary">
                  {isSignUp ? 'Únete al Círculo' : 'Iniciar Sesión'}
                </CardTitle>
                <p className="text-muted-foreground">
                  {isSignUp 
                    ? 'Registrate y comienza a invitar fundadores' 
                    : 'Accede a tu dashboard de referidos'
                  }
                </p>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="space-y-2">
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        type="email"
                        placeholder="tu@email.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                        className="pl-10 bg-background border-border"
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        type="password"
                        placeholder="Contraseña"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                        className="pl-10 bg-background border-border"
                      />
                    </div>
                  </div>
                  <Button 
                    type="submit" 
                    className="w-full bg-gradient-primary hover:shadow-glow transition-all duration-300" 
                    disabled={loading}
                  >
                    {loading ? (
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    ) : (
                      <>
                        {isSignUp ? 'Crear Cuenta' : 'Iniciar Sesión'}
                        <ArrowRight className="ml-2 h-4 w-4" />
                      </>
                    )}
                  </Button>
                </form>
                
                <div className="mt-6 text-center">
                  <button 
                    onClick={() => setIsSignUp(!isSignUp)}
                    className="text-primary hover:underline text-sm"
                  >
                    {isSignUp 
                      ? '¿Ya tienes cuenta? Inicia sesión' 
                      : '¿No tienes cuenta? Regístrate'
                    }
                  </button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}