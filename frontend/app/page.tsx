import Link from 'next/link';
import { FileText, Users, TrendingUp, Shield, Zap, Globe } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
              <FileText className="w-5 h-5 text-primary-foreground" />
            </div>
            <span className="text-xl font-bold text-foreground">Factura</span>
          </Link>
          <nav className="hidden md:flex items-center gap-8">
            <Link href="#features" className="text-muted-foreground hover:text-foreground transition-colors">
              Fonctionnalites
            </Link>
            <Link href="#pricing" className="text-muted-foreground hover:text-foreground transition-colors">
              Tarifs
            </Link>
            <Link href="#contact" className="text-muted-foreground hover:text-foreground transition-colors">
              Contact
            </Link>
          </nav>
          <div className="flex items-center gap-3">
            <Button variant="ghost" asChild>
              <Link href="/login">Connexion</Link>
            </Button>
            <Button asChild>
              <Link href="/register">Inscription</Link>
            </Button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-20 md:py-32">
        <div className="container mx-auto px-4 text-center">
          <div className="inline-flex items-center gap-2 bg-primary/10 text-primary px-4 py-2 rounded-full text-sm font-medium mb-8">
            <span className="w-2 h-2 bg-primary rounded-full animate-pulse" />
            Nouvelle version disponible
          </div>
          <h1 className="text-4xl md:text-6xl font-bold text-foreground max-w-4xl mx-auto leading-tight text-balance">
            La facturation simplifiee pour les entrepreneurs
          </h1>
          <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto mt-6 leading-relaxed text-pretty">
            Creez des factures professionnelles, gerez vos devis et suivez vos paiements en quelques clics. 
            Concu pour les entrepreneurs du Maghreb et du Moyen-Orient.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mt-10">
            <Button size="lg" asChild className="px-8">
              <Link href="/register">
                Commencer gratuitement
              </Link>
            </Button>
            <Button size="lg" variant="outline" asChild>
              <Link href="#features">
                Decouvrir les fonctionnalites
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 bg-card">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground">
              Tout ce dont vous avez besoin
            </h2>
            <p className="text-muted-foreground mt-4 max-w-2xl mx-auto">
              Une solution complete pour gerer votre facturation et vos devis de maniere professionnelle.
            </p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            <FeatureCard
              icon={<FileText className="w-6 h-6" />}
              title="Factures professionnelles"
              description="Creez des factures elegantes en quelques clics avec calcul automatique de la TVA et export PDF."
            />
            <FeatureCard
              icon={<Users className="w-6 h-6" />}
              title="Gestion des clients"
              description="Centralisez toutes les informations de vos clients et suivez leur historique de facturation."
            />
            <FeatureCard
              icon={<TrendingUp className="w-6 h-6" />}
              title="Tableau de bord"
              description="Visualisez votre chiffre d&apos;affaires, vos impayes et l&apos;evolution de votre activite."
            />
            <FeatureCard
              icon={<Shield className="w-6 h-6" />}
              title="Devis convertibles"
              description="Transformez vos devis en factures en un clic apres acceptation par le client."
            />
            <FeatureCard
              icon={<Zap className="w-6 h-6" />}
              title="Rapide et intuitif"
              description="Interface simple et moderne pour une prise en main immediate sans formation."
            />
            <FeatureCard
              icon={<Globe className="w-6 h-6" />}
              title="Multi-devises"
              description="Supportez le TND, MAD, DZD, EUR et d&apos;autres devises pour vos transactions internationales."
            />
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-3 gap-8 text-center">
            <div>
              <div className="text-4xl md:text-5xl font-bold text-primary">5000+</div>
              <div className="text-muted-foreground mt-2">Entrepreneurs actifs</div>
            </div>
            <div>
              <div className="text-4xl md:text-5xl font-bold text-primary">50K+</div>
              <div className="text-muted-foreground mt-2">Factures generees</div>
            </div>
            <div>
              <div className="text-4xl md:text-5xl font-bold text-primary">99.9%</div>
              <div className="text-muted-foreground mt-2">Disponibilite</div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-primary">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-primary-foreground">
            Pret a simplifier votre facturation ?
          </h2>
          <p className="text-primary-foreground/80 mt-4 max-w-xl mx-auto">
            Rejoignez des milliers d&apos;entrepreneurs qui font confiance a Factura pour leur gestion financiere.
          </p>
          <Button size="lg" variant="secondary" asChild className="mt-8">
            <Link href="/register">
              Creer mon compte gratuit
            </Link>
          </Button>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 bg-card border-t border-border">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                <FileText className="w-5 h-5 text-primary-foreground" />
              </div>
              <span className="text-lg font-bold text-foreground">Factura</span>
            </div>
            <nav className="flex items-center gap-6">
              <Link href="#" className="text-muted-foreground hover:text-foreground transition-colors text-sm">
                Confidentialite
              </Link>
              <Link href="#" className="text-muted-foreground hover:text-foreground transition-colors text-sm">
                Conditions
              </Link>
              <Link href="#" className="text-muted-foreground hover:text-foreground transition-colors text-sm">
                Contact
              </Link>
            </nav>
            <p className="text-muted-foreground text-sm">
              2026 Factura. Tous droits reserves.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}

function FeatureCard({
  icon,
  title,
  description,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
}) {
  return (
    <div className="bg-background border border-border rounded-xl p-6 hover:shadow-lg transition-shadow">
      <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center text-primary mb-4">
        {icon}
      </div>
      <h3 className="text-lg font-semibold text-foreground mb-2">{title}</h3>
      <p className="text-muted-foreground leading-relaxed">{description}</p>
    </div>
  );
}
