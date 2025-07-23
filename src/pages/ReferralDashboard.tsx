import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Users, Trophy, Star, Crown, Copy, LogOut, ExternalLink, CheckCircle, Lock } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const rewardsData = [
  { level: 1, icon: Users, title: "Acceso Exclusivo", description: "Entrada al grupo privado de WhatsApp" },
  { level: 3, icon: Star, title: "Material Premium", description: "Guías y templates exclusivos" },
  { level: 5, icon: Trophy, title: "Sesión 1:1", description: "Consulta personal de 30 minutos" },
  { level: 10, icon: Crown, title: "Cofundador", description: "Participación en las ganancias" }
];

export default function ReferralDashboard() {
  const [referralCode, setReferralCode] = useState('');
  const [referralCount, setReferralCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const { user, signOut } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    if (user) {
      fetchReferralData();
    }
  }, [user]);

  const fetchReferralData = async () => {
    try {
      const { data, error } = await supabase
        .from('referrals')
        .select('referral_code, referral_count')
        .eq('id', user?.id)
        .single();

      if (error) {
        console.error('Error fetching referral data:', error);
        toast({
          variant: "destructive",
          title: "Error",
          description: "No se pudieron cargar los datos de referidos",
        });
        return;
      }

      if (data) {
        setReferralCode(data.referral_code);
        setReferralCount(data.referral_count);
      }
    } catch (err) {
      console.error('Error:', err);
    } finally {
      setLoading(false);
    }
  };

  const copyReferralLink = () => {
    const referralLink = `${window.location.origin}/?ref=${referralCode}`;
    navigator.clipboard.writeText(referralLink);
    toast({
      title: "¡Enlace copiado!",
      description: "El enlace de referido se copió al portapapeles",
    });
  };

  const handleSignOut = () => {
    signOut();
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  const progressPercentage = Math.min((referralCount / 10) * 100, 100);

  return (
    <div className="min-h-screen bg-gradient-dark text-foreground">
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-4xl font-bold bg-gradient-primary bg-clip-text text-transparent">
              ¡Bienvenido al Círculo Interno!
            </h1>
            <p className="text-muted-foreground mt-2">
              Hola {user?.email}, aquí está tu dashboard de referidos
            </p>
          </div>
          <Button 
            variant="outline" 
            onClick={handleSignOut}
            className="border-border hover:bg-secondary"
          >
            <LogOut className="h-4 w-4 mr-2" />
            Salir
          </Button>
        </div>

        {/* Enlace de Referido */}
        <Card className="mb-8 border-border bg-card/50 backdrop-blur-sm shadow-glow">
          <CardHeader>
            <CardTitle className="text-primary">Tu Enlace Único</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1 p-3 bg-background rounded-lg border border-border font-mono text-sm">
                {`${window.location.origin}/?ref=${referralCode}`}
              </div>
              <Button 
                onClick={copyReferralLink}
                className="bg-gradient-primary hover:shadow-glow transition-all duration-300"
              >
                <Copy className="h-4 w-4 mr-2" />
                Copiar
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Progreso */}
        <Card className="mb-8 border-border bg-card/50 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="text-primary">Tu Progreso</CardTitle>
            <p className="text-muted-foreground">
              Has referido a <span className="text-primary font-bold">{referralCount}</span> fundadores
            </p>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Progreso hacia el máximo nivel</span>
                <span>{referralCount}/10</span>
              </div>
              <Progress value={progressPercentage} className="h-2" />
            </div>
          </CardContent>
        </Card>

        {/* Lista de Recompensas */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold mb-6 text-primary">Tus Recompensas</h2>
          <div className="grid gap-4">
            {rewardsData.map((reward) => {
              const IconComponent = reward.icon;
              const isUnlocked = referralCount >= reward.level;
              
              return (
                <Card 
                  key={reward.level} 
                  className={`border-border transition-all duration-300 ${
                    isUnlocked 
                      ? 'bg-primary/10 border-primary shadow-glow' 
                      : 'bg-card/30 opacity-60'
                  }`}
                >
                  <CardContent className="p-6">
                    <div className="flex items-center gap-4">
                      <div className={`p-3 rounded-full ${
                        isUnlocked 
                          ? 'bg-primary text-primary-foreground' 
                          : 'bg-muted text-muted-foreground'
                      }`}>
                        {isUnlocked ? (
                          <CheckCircle className="h-6 w-6" />
                        ) : (
                          <Lock className="h-6 w-6" />
                        )}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <Badge 
                            variant={isUnlocked ? "default" : "outline"}
                            className={isUnlocked ? "bg-primary text-primary-foreground" : "text-muted-foreground"}
                          >
                            {reward.level} {reward.level === 1 ? 'referido' : 'referidos'}
                          </Badge>
                          {isUnlocked && (
                            <Badge variant="secondary" className="text-primary">
                              ¡Desbloqueado!
                            </Badge>
                          )}
                        </div>
                        <h3 className={`font-semibold ${
                          isUnlocked ? 'text-primary' : 'text-muted-foreground'
                        }`}>
                          {reward.title}
                        </h3>
                        <p className="text-sm text-muted-foreground">
                          {reward.description}
                        </p>
                      </div>
                      <div className="p-3 rounded-full bg-primary/10 text-primary">
                        <IconComponent className="h-6 w-6" />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>

        {/* CTA al Grupo de WhatsApp */}
        {referralCount >= 1 && (
          <Card className="border-primary bg-primary/10 shadow-glow-strong">
            <CardContent className="p-6 text-center">
              <h3 className="text-xl font-bold text-primary mb-2">
                ¡Has desbloqueado el acceso exclusivo!
              </h3>
              <p className="text-muted-foreground mb-4">
                Únete al grupo privado de WhatsApp con otros fundadores elite
              </p>
              <Button 
                className="bg-gradient-primary hover:shadow-glow transition-all duration-300"
                onClick={() => window.open('https://chat.whatsapp.com/tu-grupo-exclusivo', '_blank')}
              >
                <ExternalLink className="h-4 w-4 mr-2" />
                Únete al Grupo Exclusivo
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}