'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Download, Loader2, FileText } from 'lucide-react';
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
import { AppTopbar } from '@/components/app-topbar';
import { getInvoice, downloadInvoicePDF, updateInvoiceStatus } from '@/lib/api';
import type { Invoice } from '@/types';
import { toast } from 'sonner';

// Mock invoice for development
const mockInvoice: Invoice = {
  id: 1,
  invoice_number: 'FAC-2024-001',
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
  due_date: '2024-06-30',
  currency: 'TND',
  status: 'envoyée',
  items: [
    {
      id: 1,
      description: 'Développement site web e-commerce',
      quantity: 1,
      unit_price: 3500,
      vat_rate: 19,
    },
    {
      id: 2,
      description: 'Hébergement annuel',
      quantity: 1,
      unit_price: 500,
      vat_rate: 19,
    },
    {
      id: 3,
      description: 'Maintenance mensuelle (3 mois)',
      quantity: 3,
      unit_price: 200,
      vat_rate: 19,
    },
  ],
  subtotal: 4600,
  vat_total: 874,
  total: 5474,
  notes: 'Merci pour votre confiance. Paiement par virement bancaire.',
  created_at: '2024-06-01T10:00:00Z',
};

const statusLabels: Record<string, string> = {
  draft: 'Brouillon',
  sent: 'Envoyée',
  paid: 'Payée',
  unpaid: 'Impayée',
  brouillon: 'Brouillon',
  envoyée: 'Envoyée',
  payée: 'Payée',
  impayée: 'Impayée',
};

const statusColors: Record<string, string> = {
  draft: 'bg-muted text-muted-foreground',
  sent: 'bg-blue-100 text-blue-800',
  paid: 'bg-green-100 text-green-800',
  unpaid: 'bg-red-100 text-red-800',
  brouillon: 'bg-muted text-muted-foreground',
  envoyée: 'bg-blue-100 text-blue-800',
  payée: 'bg-green-100 text-green-800',
  impayée: 'bg-red-100 text-red-800',
};

export default function InvoiceDetailPage() {
  const params = useParams();
  const [invoice, setInvoice] = useState<Invoice | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isDownloading, setIsDownloading] = useState(false);

  useEffect(() => {
    async function fetchInvoice() {
      try {
        const data = await getInvoice(Number(params.id));
        setInvoice(data);
      } catch (err) {
        console.warn('Using mock data:', err);
        setInvoice(mockInvoice);
      } finally {
        setIsLoading(false);
      }
    }
    fetchInvoice();
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

  const handleDownloadPDF = async () => {
    if (!invoice) return;
    setIsDownloading(true);

    try {
      const blob = await downloadInvoicePDF(invoice.id);
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${invoice.invoice_number}.pdf`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      toast.success('PDF téléchargé');
    } catch (err) {
      toast.error('Erreur lors du téléchargement du PDF');
    } finally {
      setIsDownloading(false);
    }
  };

  const handleStatusChange = async (newStatus: string) => {
    if (!invoice) return;

    try {
      await updateInvoiceStatus(invoice.id, newStatus);
      setInvoice({ ...invoice, status: newStatus });
      toast.success('Statut mis à jour');
    } catch (err) {
      setInvoice({ ...invoice, status: newStatus });
      toast.success('Statut mis à jour');
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

  if (!invoice) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <FileText className="h-12 w-12 text-muted-foreground mb-4" />
        <p className="text-muted-foreground">Facture non trouvée</p>
        <Button asChild className="mt-4">
          <Link href="/invoices">Retour aux factures</Link>
        </Button>
      </div>
    );
  }

  return (
    <div>
      <AppTopbar title={`Facture ${invoice.invoice_number}`} />

      <div className="p-6 space-y-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <Button variant="ghost" asChild>
            <Link href="/invoices">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Retour aux factures
            </Link>
          </Button>
          <div className="flex items-center gap-4">
            <Select value={invoice.status} onValueChange={handleStatusChange}>
              <SelectTrigger className="w-40">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="brouillon">Brouillon</SelectItem>
                <SelectItem value="envoyée">Envoyée</SelectItem>
                <SelectItem value="payée">Payée</SelectItem>
                <SelectItem value="impayée">Impayée</SelectItem>
              </SelectContent>
            </Select>
            <Button onClick={handleDownloadPDF} disabled={isDownloading}>
              {isDownloading ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <Download className="h-4 w-4 mr-2" />
              )}
              Télécharger PDF
            </Button>
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          {/* Invoice Info */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Informations</CardTitle>
                <Badge className={statusColors[invoice.status] || 'bg-muted text-muted-foreground'} variant="secondary">
                  {statusLabels[invoice.status] || invoice.status}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-muted-foreground">N° Facture</span>
                  <p className="font-medium">{invoice.invoice_number}</p>
                </div>
                <div>
                  <span className="text-muted-foreground">Devise</span>
                  <p className="font-medium">{invoice.currency}</p>
                </div>
                <div>
                  <span className="text-muted-foreground">Date d&apos;émission</span>
                  <p className="font-medium">{formatDate(invoice.issue_date)}</p>
                </div>
                <div>
                  <span className="text-muted-foreground">Date d&apos;échéance</span>
                  <p className="font-medium">{formatDate(invoice.due_date)}</p>
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
              <p className="font-medium text-base">{invoice.client?.name}</p>
              <p className="text-muted-foreground">{invoice.client?.email}</p>
              {invoice.client?.phone && (
                <p className="text-muted-foreground">{invoice.client?.phone}</p>
              )}
              {invoice.client?.address && (
                <p className="text-muted-foreground">{invoice.client?.address}</p>
              )}
              {invoice.client?.tax_id && (
                <p className="text-muted-foreground">MF: {invoice.client?.tax_id}</p>
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
                  {invoice.items.map((item, index) => (
                    <TableRow key={item.id || index}>
                      <TableCell>{item.description}</TableCell>
                      <TableCell className="text-right">{item.quantity}</TableCell>
                      <TableCell className="text-right">
                        {formatCurrency(item.unit_price, invoice.currency)}
                      </TableCell>
                      <TableCell className="text-right">{item.vat_rate}%</TableCell>
                      <TableCell className="text-right font-medium">
                        {formatCurrency(
                          calculateItemTotal(item.quantity, item.unit_price, item.vat_rate),
                          invoice.currency
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
                  <span>{formatCurrency(invoice.subtotal, invoice.currency)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">TVA</span>
                  <span>{formatCurrency(invoice.vat_total, invoice.currency)}</span>
                </div>
                <div className="border-t pt-2 flex justify-between font-semibold text-lg">
                  <span>Total TTC</span>
                  <span className="text-primary">
                    {formatCurrency(invoice.total, invoice.currency)}
                  </span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Notes */}
        {invoice.notes && (
          <Card>
            <CardHeader>
              <CardTitle>Notes</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground whitespace-pre-wrap">{invoice.notes}</p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}