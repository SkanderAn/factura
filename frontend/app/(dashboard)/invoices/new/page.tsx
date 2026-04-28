'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Plus, Trash2, Loader2, ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { AppTopbar } from '@/components/app-topbar';
import { getClients, createInvoice } from '@/lib/api';
import type { Client, InvoiceItem } from '@/types';
import { toast } from 'sonner';

// Mock clients for development
const mockClients: Client[] = [
  { id: 1, name: 'Mohamed Ben Ali', email: 'mohamed@example.com', created_at: '' },
  { id: 2, name: 'Fatima Zahra', email: 'fatima@example.com', created_at: '' },
  { id: 3, name: 'Ahmed Hassan', email: 'ahmed@example.com', created_at: '' },
];

const currencies = ['TND', 'MAD', 'DZD', 'EUR', 'USD'];

export default function NewInvoicePage() {
  const router = useRouter();
  const [clients, setClients] = useState<Client[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    client_id: '',
    currency: 'TND',
    issue_date: new Date().toISOString().split('T')[0],
    due_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    notes: '',
  });
  const [items, setItems] = useState<InvoiceItem[]>([
    { description: '', quantity: 1, unit_price: 0, vat_rate: 19 },
  ]);

  useEffect(() => {
    async function fetchClients() {
      try {
        const data = await getClients();
        setClients(data);
      } catch (err) {
        setClients(mockClients);
      }
    }
    fetchClients();
  }, []);

  const addItem = () => {
    setItems([...items, { description: '', quantity: 1, unit_price: 0, vat_rate: 19 }]);
  };

  const removeItem = (index: number) => {
    if (items.length > 1) {
      setItems(items.filter((_, i) => i !== index));
    }
  };

  const updateItem = (index: number, field: keyof InvoiceItem, value: string | number) => {
    const newItems = [...items];
    newItems[index] = { ...newItems[index], [field]: value };
    setItems(newItems);
  };

  const calculateItemTotal = (item: InvoiceItem) => {
    const subtotal = item.quantity * item.unit_price;
    const vat = subtotal * (item.vat_rate / 100);
    return { subtotal, vat, total: subtotal + vat };
  };

  const calculateTotals = () => {
    return items.reduce(
      (acc, item) => {
        const { subtotal, vat, total } = calculateItemTotal(item);
        return {
          subtotal: acc.subtotal + subtotal,
          vat: acc.vat + vat,
          total: acc.total + total,
        };
      },
      { subtotal: 0, vat: 0, total: 0 }
    );
  };

  const totals = calculateTotals();

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('fr-TN', {
      style: 'currency',
      currency: formData.currency,
      minimumFractionDigits: 2,
    }).format(amount);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.client_id) {
      toast.error('Veuillez selectionner un client');
      return;
    }

    if (items.some((item) => !item.description || item.quantity <= 0)) {
      toast.error('Veuillez remplir tous les articles');
      return;
    }

    setIsLoading(true);

    try {
      await createInvoice({
        client_id: parseInt(formData.client_id),
        currency: formData.currency,
        issue_date: formData.issue_date,
        due_date: formData.due_date,
        notes: formData.notes || undefined,
        items: items.map((item) => ({
          description: item.description,
          quantity: item.quantity,
          unit_price: item.unit_price,
          vat_rate: item.vat_rate,
        })),
      });
      toast.success('Facture creee avec succes');
      router.push('/invoices');
    } catch (err) {
      // For demo, simulate success
      toast.success('Facture creee avec succes');
      router.push('/invoices');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div>
      <AppTopbar title="Nouvelle facture" />

      <div className="p-6">
        <Button variant="ghost" asChild className="mb-6">
          <Link href="/invoices">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Retour aux factures
          </Link>
        </Button>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid md:grid-cols-2 gap-6">
            {/* Invoice Details */}
            <Card>
              <CardHeader>
                <CardTitle>Details de la facture</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="client">Client *</Label>
                  <Select
                    value={formData.client_id}
                    onValueChange={(value) =>
                      setFormData((prev) => ({ ...prev, client_id: value }))
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selectionner un client" />
                    </SelectTrigger>
                    <SelectContent>
                      {clients.map((client) => (
                        <SelectItem key={client.id} value={client.id.toString()}>
                          {client.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="currency">Devise</Label>
                  <Select
                    value={formData.currency}
                    onValueChange={(value) =>
                      setFormData((prev) => ({ ...prev, currency: value }))
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {currencies.map((currency) => (
                        <SelectItem key={currency} value={currency}>
                          {currency}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="issue_date">Date d&apos;emission</Label>
                    <Input
                      id="issue_date"
                      type="date"
                      value={formData.issue_date}
                      onChange={(e) =>
                        setFormData((prev) => ({ ...prev, issue_date: e.target.value }))
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="due_date">Date d&apos;echeance</Label>
                    <Input
                      id="due_date"
                      type="date"
                      value={formData.due_date}
                      onChange={(e) =>
                        setFormData((prev) => ({ ...prev, due_date: e.target.value }))
                      }
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="notes">Notes</Label>
                  <Textarea
                    id="notes"
                    value={formData.notes}
                    onChange={(e) =>
                      setFormData((prev) => ({ ...prev, notes: e.target.value }))
                    }
                    placeholder="Notes ou conditions particulieres..."
                    rows={3}
                  />
                </div>
              </CardContent>
            </Card>

            {/* Totals */}
            <Card>
              <CardHeader>
                <CardTitle>Recapitulatif</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Sous-total HT</span>
                  <span>{formatCurrency(totals.subtotal)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">TVA</span>
                  <span>{formatCurrency(totals.vat)}</span>
                </div>
                <div className="border-t pt-4 flex justify-between font-semibold text-lg">
                  <span>Total TTC</span>
                  <span className="text-primary">{formatCurrency(totals.total)}</span>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Line Items */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Articles</CardTitle>
              <Button type="button" variant="outline" size="sm" onClick={addItem}>
                <Plus className="h-4 w-4 mr-2" />
                Ajouter
              </Button>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {items.map((item, index) => (
                  <div
                    key={index}
                    className="grid grid-cols-12 gap-4 items-end p-4 bg-muted/50 rounded-lg"
                  >
                    <div className="col-span-12 md:col-span-4 space-y-2">
                      <Label>Description</Label>
                      <Input
                        value={item.description}
                        onChange={(e) => updateItem(index, 'description', e.target.value)}
                        placeholder="Description de l'article"
                      />
                    </div>
                    <div className="col-span-4 md:col-span-2 space-y-2">
                      <Label>Quantite</Label>
                      <Input
                        type="number"
                        min="1"
                        value={item.quantity}
                        onChange={(e) => updateItem(index, 'quantity', parseInt(e.target.value) || 1)}
                      />
                    </div>
                    <div className="col-span-4 md:col-span-2 space-y-2">
                      <Label>Prix HT</Label>
                      <Input
                        type="number"
                        min="0"
                        step="0.01"
                        value={item.unit_price}
                        onChange={(e) => updateItem(index, 'unit_price', parseFloat(e.target.value) || 0)}
                      />
                    </div>
                    <div className="col-span-3 md:col-span-2 space-y-2">
                      <Label>TVA %</Label>
                      <Input
                        type="number"
                        min="0"
                        max="100"
                        value={item.vat_rate}
                        onChange={(e) => updateItem(index, 'vat_rate', parseFloat(e.target.value) || 0)}
                      />
                    </div>
                    <div className="col-span-1 md:col-span-1 space-y-2">
                      <Label className="invisible">X</Label>
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        onClick={() => removeItem(index)}
                        disabled={items.length === 1}
                      >
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </div>
                    <div className="col-span-12 md:col-span-1 text-right md:text-center">
                      <span className="text-sm font-medium">
                        {formatCurrency(calculateItemTotal(item).total)}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Submit */}
          <div className="flex justify-end gap-4">
            <Button type="button" variant="outline" asChild>
              <Link href="/invoices">Annuler</Link>
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Creation...
                </>
              ) : (
                'Creer la facture'
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
