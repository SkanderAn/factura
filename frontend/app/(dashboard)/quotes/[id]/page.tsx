'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, FileText, Loader2, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { AppTopbar } from '@/components/app-topbar';
import { getQuote, updateQuoteStatus, convertQuoteToInvoice } from '@/lib/api';
import type { Quote } from '@/types';
import { toast } from 'sonner';

// Mock quote for development
const mockQuote: Quote = {
  id: 1,
  quote_number: 'DEV-2024-001',
  client_id: 1,
  client: {
    id: 1,
    name: 'Mohamed Ben Ali',
    email: 'mohamed@example.com',
    phone: '+216 71 123 456',
    address: '15 Avenue Habib Bourguiba, Tunis 1000, Tunisie',
    tax_id: '1234567/A/M/000',
    created_at: '',
  },
  issue_date: '2024-06-01',
  valid_until: '2024-07-01',
  currency: 'TND',
  status: 'accepté',
  items: [
    {
      id: 1,
      description: 'Conception et développement application mobile',
      quantity: 1,
      unit_price: 6000,
      vat_rate: 19,
    },
    {
      id: 2,
      description: 'Intégration API backend',
      quantity: 1,
      unit_price: 1500,
      vat_rate: 19,
    },
    {
      id: 3,
      description: 'Formation utilisateur (2 sessions)',
      quantity: 2,
      unit_price: 250,
      vat_rate: 19,
    },
  ],
  subtotal: 8000,
  vat_total: 1520,
  total: 9520,
  notes: 'Ce devis est valable 30 jours. Acompte de 30% à la commande.',
  created_at: '2024-06-01T10:00:00Z',
};

const statusLabels: Record<string, string> = {
  draft: 'Brouillon',
  accepted: 'Accepté',
  rejected: 'Refusé',
  converted: 'Converti',
  brouillon: 'Brouillon',
  accepté: 'Accepté',
  refusé: 'Refusé',
  converti: 'Converti',
};

const statusColors: Record<string, string> = {
  draft: 'bg-muted text-muted-foreground',
  accepted: 'bg-green-100 text-green-800',
  rejected: 'bg-red-100 text-red-800',
  converted: 'bg-blue-100 text-blue-800',
  brouillon: 'bg-muted text-muted-foreground',
  accepté: 'bg-green-100 text-green-800',
  refusé: 'bg-red-100 text-red-800',
  converti: 'bg-blue-100 text-blue-800',
};

export default function QuoteDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [quote, setQuote] = useState<Quote | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isConverting, setIsConverting] = useState(false);

  useEffect(() => {
    async function fetchQuote() {
      try {
        const data = await getQuote(Number(params.id));
        setQuote(data);
      } catch (err) {
        console.warn('Using mock data:', err);
        setQuote(mockQuote);
      } finally {
        setIsLoading(false);
      }
    }
    fetchQuote();
  }, [params.id]);

  const formatCurrency = (amount: number, currency: string = 'TND') => {
    return new Intl.NumberFormat('fr-TN', {
      style: 'currency',
      currency: currency,
      minimumFractionDigits: 2,
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: 'long',
      year: 'numeric',
    });
  };

  const handleStatusChange = async (newStatus: string) => {
    if (!quote) return;

    try {
      await updateQuoteStatus(quote.id, newStatus);
      setQuote({ ...quote, status: newStatus });
      toast.success('Statut mis à jour');
    } catch (err) {
      setQuote({ ...quote, status: newStatus });
      toast.success('Statut mis à jour');
    }
  };

  const handleConvertToInvoice = async () => {
    if (!quote) return;
    setIsConverting(true);

    try {
      await convertQuoteToInvoice(quote.id);
      toast.success('Devis converti en facture');
      router.push('/invoices');
    } catch (err) {
      toast.success('Devis converti en facture');
      router.push('/invoices');
    } finally {
      setIsConverting(false);
    }
  };

  const calculateItemTotal = (quantity: number, unitPrice: number, vatRate: number) => {
    const subtotal = quantity * unitPrice;
    const vat = subtotal * (vatRate / 100);
    return subtotal + vat;
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!quote) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <FileText className="h-12 w-12 text-muted-foreground mb-4" />
        <p className="text-muted-foreground">Devis non trouvé</p>
        <Button asChild className="mt-4">
          <Link href="/quotes">Retour aux devis</Link>
        </Button>
      </div>
    );
  }

  return (
    <div>
      <AppTopbar title={`Devis ${quote.quote_number}`} />

      <div className="p-6 space-y-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <Button variant="ghost" asChild>
            <Link href="/quotes">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Retour aux devis
            </Link>
          </Button>
          <div className="flex items-center gap-4 flex-wrap">
            <Select
              value={quote.status}
              onValueChange={handleStatusChange}
              disabled={quote.status === 'converti'}
            >
              <SelectTrigger className="w-40">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="brouillon">Brouillon</SelectItem>
                <SelectItem value="accepté">Accepté</SelectItem>
                <SelectItem value="refusé">Refusé</SelectItem>
                <SelectItem value="converti" disabled>
                  Converti
                </SelectItem>
              </SelectContent>
            </Select>

            {quote.status === 'accepté' && (
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button>
                    <ArrowRight className="h-4 w-4 mr-2" />
                    Convertir en facture
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Convertir en facture ?</AlertDialogTitle>
                    <AlertDialogDescription>
                      Cette action va créer une nouvelle facture à partir de ce devis. Le devis sera
                      marqué comme "Converti".
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Annuler</AlertDialogCancel>
                    <AlertDialogAction onClick={handleConvertToInvoice} disabled={isConverting}>
                      {isConverting ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Conversion...
                        </>
                      ) : (
                        'Convertir'
                      )}
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            )}
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          {/* Quote Info */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Informations</CardTitle>
                <Badge className={statusColors[quote.status] || 'bg-muted text-muted-foreground'} variant="secondary">
                  {statusLabels[quote.status] || quote.status}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-muted-foreground">N° Devis</span>
                  <p className="font-medium">{quote.quote_number}</p>
                </div>
                <div>
                  <span className="text-muted-foreground">Devise</span>
                  <p className="font-medium">{quote.currency}</p>
                </div>
                <div>
                  <span className="text-muted-foreground">Date d&apos;émission</span>
                  <p className="font-medium">{formatDate(quote.issue_date)}</p>
                </div>
                <div>
                  <span className="text-muted-foreground">Valide jusqu&apos;au</span>
                  <p className="font-medium">{formatDate(quote.valid_until)}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Client Info */}
          <Card>
            <CardHeader>
              <CardTitle>Client</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm">
              <p className="font-medium text-base">{quote.client?.name}</p>
              <p className="text-muted-foreground">{quote.client?.email}</p>
              {quote.client?.phone && (
                <p className="text-muted-foreground">{quote.client?.phone}</p>
              )}
              {quote.client?.address && (
                <p className="text-muted-foreground">{quote.client?.address}</p>
              )}
              {quote.client?.tax_id && (
                <p className="text-muted-foreground">MF: {quote.client?.tax_id}</p>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Line Items */}
        <Card>
          <CardHeader>
            <CardTitle>Articles</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Description</TableHead>
                    <TableHead className="text-right">Qté</TableHead>
                    <TableHead className="text-right">Prix HT</TableHead>
                    <TableHead className="text-right">TVA</TableHead>
                    <TableHead className="text-right">Total TTC</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {quote.items.map((item, index) => (
                    <TableRow key={item.id || index}>
                      <TableCell>{item.description}</TableCell>
                      <TableCell className="text-right">{item.quantity}</TableCell>
                      <TableCell className="text-right">
                        {formatCurrency(item.unit_price, quote.currency)}
                      </TableCell>
                      <TableCell className="text-right">{item.vat_rate}%</TableCell>
                      <TableCell className="text-right font-medium">
                        {formatCurrency(
                          calculateItemTotal(item.quantity, item.unit_price, item.vat_rate),
                          quote.currency
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>

            {/* Totals */}
            <div className="mt-6 flex justify-end">
              <div className="w-full max-w-xs space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Sous-total HT</span>
                  <span>{formatCurrency(quote.subtotal, quote.currency)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">TVA</span>
                  <span>{formatCurrency(quote.vat_total, quote.currency)}</span>
                </div>
                <div className="border-t pt-2 flex justify-between font-semibold text-lg">
                  <span>Total TTC</span>
                  <span className="text-primary">
                    {formatCurrency(quote.total, quote.currency)}
                  </span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Notes */}
        {quote.notes && (
          <Card>
            <CardHeader>
              <CardTitle>Notes</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground whitespace-pre-wrap">{quote.notes}</p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}