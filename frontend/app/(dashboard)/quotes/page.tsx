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
import { getQuotes } from '@/lib/api';
import type { Quote } from '@/types';

// Mock data for development
const mockQuotes: Quote[] = [
  {
    id: 1,
    quote_number: 'DEV-2024-001',
    client_id: 1,
    issue_date: '2024-06-01',
    valid_until: '2024-07-01',
    currency: 'TND',
    status: 'accepté',
    items: [],
    subtotal: 8000,
    vat_total: 1520,
    total: 9520,
    created_at: '2024-06-01T10:00:00Z',
  },
  {
    id: 2,
    quote_number: 'DEV-2024-002',
    client_id: 2,
    issue_date: '2024-06-10',
    valid_until: '2024-07-10',
    currency: 'TND',
    status: 'brouillon',
    items: [],
    subtotal: 2500,
    vat_total: 475,
    total: 2975,
    created_at: '2024-06-10T14:00:00Z',
  },
  {
    id: 3,
    quote_number: 'DEV-2024-003',
    client_id: 3,
    issue_date: '2024-06-15',
    valid_until: '2024-06-30',
    currency: 'TND',
    status: 'refusé',
    items: [],
    subtotal: 5000,
    vat_total: 950,
    total: 5950,
    created_at: '2024-06-15T09:00:00Z',
  },
  {
    id: 4,
    quote_number: 'DEV-2024-004',
    client_id: 1,
    issue_date: '2024-05-20',
    valid_until: '2024-06-20',
    currency: 'TND',
    status: 'converti',
    items: [],
    subtotal: 3500,
    vat_total: 665,
    total: 4165,
    created_at: '2024-05-20T11:00:00Z',
  },
];

const statusLabels: Record<string, string> = {
  draft: 'Brouillon',
  sent: 'Envoyé',
  accepted: 'Accepté',
  rejected: 'Refusé',
  converted: 'Converti',
  brouillon: 'Brouillon',
  envoyé: 'Envoyé',
  accepté: 'Accepté',
  refusé: 'Refusé',
  converti: 'Converti',
};

const statusColors: Record<string, string> = {
  draft: 'bg-gray-100 text-gray-800',
  sent: 'bg-blue-100 text-blue-800',
  accepted: 'bg-green-100 text-green-800',
  rejected: 'bg-red-100 text-red-800',
  converted: 'bg-purple-100 text-purple-800',
  brouillon: 'bg-gray-100 text-gray-800',
  envoyé: 'bg-blue-100 text-blue-800',
  accepté: 'bg-green-100 text-green-800',
  refusé: 'bg-red-100 text-red-800',
  converti: 'bg-purple-100 text-purple-800',
};

export default function QuotesPage() {
  const [quotes, setQuotes] = useState<Quote[]>([]);
  const [filteredQuotes, setFilteredQuotes] = useState<Quote[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  useEffect(() => {
    async function fetchQuotes() {
      try {
        const data = await getQuotes();
        setQuotes(data);
        setFilteredQuotes(data);
      } catch (err) {
        console.warn('Using mock data:', err);
        setQuotes(mockQuotes);
        setFilteredQuotes(mockQuotes);
      } finally {
        setIsLoading(false);
      }
    }
    fetchQuotes();
  }, []);

  useEffect(() => {
    let filtered = quotes;

    if (searchQuery) {
      filtered = filtered.filter((quote) =>
        quote.quote_number.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    if (statusFilter !== 'all') {
      filtered = filtered.filter((quote) => quote.status === statusFilter);
    }

    setFilteredQuotes(filtered);
  }, [searchQuery, statusFilter, quotes]);

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
      <AppTopbar title="Devis" />

      <div className="p-6 space-y-6">
        <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
          <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
            <div className="relative w-full sm:w-72">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Rechercher un devis..."
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
                <SelectItem value="accepté">Accepté</SelectItem>
                <SelectItem value="refusé">Refusé</SelectItem>
                <SelectItem value="converti">Converti</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <Button asChild>
            <Link href="/quotes/new">
              <Plus className="h-4 w-4 mr-2" />
              Nouveau devis
            </Link>
          </Button>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Liste des devis</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="h-6 w-6 animate-spin text-primary" />
              </div>
            ) : filteredQuotes.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                {searchQuery || statusFilter !== 'all'
                  ? 'Aucun devis trouvé'
                  : 'Aucun devis enregistré'}
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>N° Devis</TableHead>
                      <TableHead className="hidden md:table-cell">Date</TableHead>
                      <TableHead className="hidden lg:table-cell">Validité</TableHead>
                      <TableHead>Total TTC</TableHead>
                      <TableHead>Statut</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredQuotes.map((quote) => (
                      <TableRow key={quote.id}>
                        <TableCell className="font-medium">
                          {quote.quote_number}
                        </TableCell>
                        <TableCell className="hidden md:table-cell">
                          {formatDate(quote.issue_date)}
                        </TableCell>
                        <TableCell className="hidden lg:table-cell">
                          {formatDate(quote.valid_until)}
                        </TableCell>
                        <TableCell>
                          {formatCurrency(quote.total, quote.currency)}
                        </TableCell>
                        <TableCell>
                          <Badge className={statusColors[quote.status] || 'bg-gray-100 text-gray-800'} variant="secondary">
                            {statusLabels[quote.status] || quote.status}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <Button variant="ghost" size="icon" asChild>
                            <Link href={`/quotes/${quote.id}`}>
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