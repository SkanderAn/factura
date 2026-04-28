'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Plus, Search, Eye, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
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
import { getInvoices } from '@/lib/api';
import type { Invoice } from '@/types';

// Mock data for development
const mockInvoices: Invoice[] = [
  {
    id: 1,
    invoice_number: 'FAC-2024-001',
    client_id: 1,
    issue_date: '2024-06-01',
    due_date: '2024-06-30',
    currency: 'TND',
    status: 'payée',
    items: [],
    subtotal: 5000,
    vat_total: 950,
    total: 5950,
    created_at: '2024-06-01T10:00:00Z',
  },
  {
    id: 2,
    invoice_number: 'FAC-2024-002',
    client_id: 2,
    issue_date: '2024-06-10',
    due_date: '2024-07-10',
    currency: 'TND',
    status: 'envoyée',
    items: [],
    subtotal: 3200,
    vat_total: 608,
    total: 3808,
    created_at: '2024-06-10T14:00:00Z',
  },
  {
    id: 3,
    invoice_number: 'FAC-2024-003',
    client_id: 3,
    issue_date: '2024-06-15',
    due_date: '2024-07-15',
    currency: 'TND',
    status: 'brouillon',
    items: [],
    subtotal: 1500,
    vat_total: 285,
    total: 1785,
    created_at: '2024-06-15T09:00:00Z',
  },
  {
    id: 4,
    invoice_number: 'FAC-2024-004',
    client_id: 1,
    issue_date: '2024-05-01',
    due_date: '2024-05-31',
    currency: 'TND',
    status: 'impayée',
    items: [],
    subtotal: 2800,
    vat_total: 532,
    total: 3332,
    created_at: '2024-05-01T11:00:00Z',
  },
];

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
  draft: 'bg-gray-100 text-gray-800',
  sent: 'bg-blue-100 text-blue-800',
  paid: 'bg-green-100 text-green-800',
  unpaid: 'bg-red-100 text-red-800',
  brouillon: 'bg-gray-100 text-gray-800',
  envoyée: 'bg-blue-100 text-blue-800',
  payée: 'bg-green-100 text-green-800',
  impayée: 'bg-red-100 text-red-800',
};

export default function InvoicesPage() {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [filteredInvoices, setFilteredInvoices] = useState<Invoice[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  useEffect(() => {
    async function fetchInvoices() {
      try {
        const data = await getInvoices();
        setInvoices(data);
        setFilteredInvoices(data);
      } catch (err) {
        console.warn('Using mock data:', err);
        setInvoices(mockInvoices);
        setFilteredInvoices(mockInvoices);
      } finally {
        setIsLoading(false);
      }
    }
    fetchInvoices();
  }, []);

  useEffect(() => {
    let filtered = invoices;

    if (searchQuery) {
      filtered = filtered.filter((invoice) =>
        invoice.invoice_number.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    if (statusFilter !== 'all') {
      filtered = filtered.filter((invoice) => invoice.status === statusFilter);
    }

    setFilteredInvoices(filtered);
  }, [searchQuery, statusFilter, invoices]);

  const formatCurrency = (amount: number, currency: string) => {
    return new Intl.NumberFormat('fr-TN', {
      style: 'currency',
      currency: currency,
      minimumFractionDigits: 2,
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });
  };

  return (
    <div>
      <AppTopbar title="Factures" />

      <div className="p-6 space-y-6">
        <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
          <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
            <div className="relative w-full sm:w-72">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Rechercher une facture..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full sm:w-40">
                <SelectValue placeholder="Statut" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tous les statuts</SelectItem>
                <SelectItem value="brouillon">Brouillon</SelectItem>
                <SelectItem value="envoyée">Envoyée</SelectItem>
                <SelectItem value="payée">Payée</SelectItem>
                <SelectItem value="impayée">Impayée</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <Button asChild>
            <Link href="/invoices/new">
              <Plus className="h-4 w-4 mr-2" />
              Nouvelle facture
            </Link>
          </Button>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Liste des factures</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="h-6 w-6 animate-spin text-primary" />
              </div>
            ) : filteredInvoices.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                {searchQuery || statusFilter !== 'all'
                  ? 'Aucune facture trouvée'
                  : 'Aucune facture enregistrée'}
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>N° Facture</TableHead>
                      <TableHead className="hidden md:table-cell">Date</TableHead>
                      <TableHead className="hidden lg:table-cell">Échéance</TableHead>
                      <TableHead>Total TTC</TableHead>
                      <TableHead>Statut</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredInvoices.map((invoice) => (
                      <TableRow key={invoice.id}>
                        <TableCell className="font-medium">
                          {invoice.invoice_number}
                        </TableCell>
                        <TableCell className="hidden md:table-cell">
                          {formatDate(invoice.issue_date)}
                        </TableCell>
                        <TableCell className="hidden lg:table-cell">
                          {formatDate(invoice.due_date)}
                        </TableCell>
                        <TableCell>
                          {formatCurrency(invoice.total, invoice.currency)}
                        </TableCell>
                        <TableCell>
                          <Badge className={statusColors[invoice.status] || 'bg-gray-100 text-gray-800'} variant="secondary">
                            {statusLabels[invoice.status] || invoice.status}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <Button variant="ghost" size="icon" asChild>
                            <Link href={`/invoices/${invoice.id}`}>
                              <Eye className="h-4 w-4" />
                            </Link>
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}