'use client';

import { useState, useEffect } from 'react';
import { Loader2, Save, User } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { AppTopbar } from '@/components/app-topbar';
import type { CompanySettings, User as UserType } from '@/types';
import { toast } from 'sonner';
import { fetchAPI } from '@/lib/api';

const defaultSettings: CompanySettings = {
  name: '',
  address: '',
  tax_id: '',
  phone: '',
  email: '',
};

export default function SettingsPage() {
  const [user, setUser] = useState<UserType | null>(null);
  const [settings, setSettings] = useState<CompanySettings>(defaultSettings);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  // Charger l'utilisateur connecté et les paramètres entreprise
  useEffect(() => {
    async function loadData() {
      setIsLoading(true);
      try {
        // Récupérer l'utilisateur connecté
        const userData = await fetchAPI<UserType>('/auth/me');
        setUser(userData);
        // Pré-remplir les infos entreprise avec les données existantes (depuis localStorage)
        const saved = localStorage.getItem('companySettings');
        if (saved) {
          setSettings(JSON.parse(saved));
        } else if (userData.company_name) {
          setSettings(prev => ({ ...prev, name: userData.company_name || '', email: userData.email }));
        }
      } catch (err) {
        console.error('Error loading user:', err);
        toast.error('Impossible de charger le profil');
      } finally {
        setIsLoading(false);
      }
    }
    loadData();
  }, []);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setSettings((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);

    try {
      // Sauvegarder les paramètres entreprise
      localStorage.setItem('companySettings', JSON.stringify(settings));
      toast.success('Paramètres enregistrés avec succès');
    } catch (err) {
      toast.error('Erreur lors de l\'enregistrement');
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div>
      <AppTopbar title="Paramètres" />

      <div className="p-6 space-y-6 max-w-2xl">
        {/* Informations du compte */}
        <Card>
          <CardHeader>
            <CardTitle>Mon compte</CardTitle>
            <CardDescription>
              Gérez vos informations personnelles
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-4 p-4 bg-muted/30 rounded-lg">
              <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
                <User className="h-6 w-6 text-primary" />
              </div>
              <div>
                <p className="font-medium">{user?.full_name || user?.email}</p>
                <p className="text-sm text-muted-foreground">{user?.email}</p>
              </div>
            </div>
            <div className="text-sm text-muted-foreground">
              <p>Compte créé le : {user?.created_at ? new Date(user.created_at).toLocaleDateString('fr-FR') : '-'}</p>
            </div>
          </CardContent>
        </Card>

        {/* Informations de l'entreprise */}
        <Card>
          <CardHeader>
            <CardTitle>Informations de l'entreprise</CardTitle>
            <CardDescription>
              Ces informations apparaîtront sur vos factures et devis
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Nom de l'entreprise</Label>
                <Input
                  id="name"
                  name="name"
                  value={settings.name}
                  onChange={handleChange}
                  placeholder="Ma Société SARL"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  value={settings.email}
                  onChange={handleChange}
                  placeholder="contact@masociete.com"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="phone">Téléphone</Label>
                <Input
                  id="phone"
                  name="phone"
                  value={settings.phone}
                  onChange={handleChange}
                  placeholder="+216 XX XXX XXX"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="address">Adresse</Label>
                <Textarea
                  id="address"
                  name="address"
                  value={settings.address}
                  onChange={handleChange}
                  placeholder="Adresse complète de l'entreprise"
                  rows={3}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="tax_id">Matricule fiscal</Label>
                <Input
                  id="tax_id"
                  name="tax_id"
                  value={settings.tax_id}
                  onChange={handleChange}
                  placeholder="1234567/A/M/000"
                />
              </div>

              <div className="pt-4">
                <Button type="submit" disabled={isSaving}>
                  {isSaving ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Enregistrement...
                    </>
                  ) : (
                    <>
                      <Save className="mr-2 h-4 w-4" />
                      Enregistrer
                    </>
                  )}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>

        {/* Préférences */}
        <Card>
          <CardHeader>
            <CardTitle>Préférences</CardTitle>
            <CardDescription>
              Personnalisez votre expérience Factura
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Devise par défaut</p>
                  <p className="text-sm text-muted-foreground">
                    La devise utilisée par défaut pour les nouvelles factures
                  </p>
                </div>
                <span className="text-sm font-medium bg-muted px-3 py-1 rounded-md">TND</span>
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Taux de TVA par défaut</p>
                  <p className="text-sm text-muted-foreground">
                    Le taux de TVA appliqué par défaut aux articles
                  </p>
                </div>
                <span className="text-sm font-medium bg-muted px-3 py-1 rounded-md">19%</span>
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Délai de paiement</p>
                  <p className="text-sm text-muted-foreground">
                    Le nombre de jours avant l'échéance par défaut
                  </p>
                </div>
                <span className="text-sm font-medium bg-muted px-3 py-1 rounded-md">30 jours</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}