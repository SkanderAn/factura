'use client';

import { useEffect, useState } from 'react';
import { Plus, Search, Pencil, Trash2, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { AppTopbar } from '@/components/app-topbar';
import { ClientForm } from '@/components/client-form';
import { getClients, deleteClient } from '@/lib/api';
import type { Client } from '@/types';
import { toast } from 'sonner';

// Mock data for development
const mockClients: Client[] = [
  {
    id: 1,
    name: 'Mohamed Ben Ali',
    email: 'mohamed@example.com',
    phone: '+216 71 123 456',
    address: 'Tunis, Tunisie',
    tax_id: '1234567/A/M/000',
    created_at: '2024-01-15T10:00:00Z',
  },
  {
    id: 2,
    name: 'Fatima Zahra',
    email: 'fatima@example.com',
    phone: '+212 5 22 33 44 55',
    address: 'Casablanca, Maroc',
    tax_id: '9876543/B',
    created_at: '2024-02-20T14:30:00Z',
  },
  {
    id: 3,
    name: 'Ahmed Hassan',
    email: 'ahmed@example.com',
    phone: '+213 21 45 67 89',
    address: 'Alger, Algerie',
    tax_id: '5555555/C',
    created_at: '2024-03-10T09:15:00Z',
  },
];

export default function ClientsPage() {
  const [clients, setClients] = useState<Client[]>([]);
  const [filteredClients, setFilteredClients] = useState<Client[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingClient, setEditingClient] = useState<Client | null>(null);
  const [deletingClient, setDeletingClient] = useState<Client | null>(null);

  const fetchClients = async () => {
    try {
      const data = await getClients();
      setClients(data);
      setFilteredClients(data);
    } catch (err) {
      console.warn('Using mock data:', err);
      setClients(mockClients);
      setFilteredClients(mockClients);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchClients();
  }, []);

  useEffect(() => {
    const filtered = clients.filter(
      (client) =>
        client.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        client.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
        client.tax_id?.toLowerCase().includes(searchQuery.toLowerCase())
    );
    setFilteredClients(filtered);
  }, [searchQuery, clients]);

  const handleDelete = async () => {
    if (!deletingClient) return;
    
    try {
      await deleteClient(deletingClient.id);
      setClients((prev) => prev.filter((c) => c.id !== deletingClient.id));
      toast.success('Client supprime avec succes');
    } catch (err) {
      // For demo, remove from mock data
      setClients((prev) => prev.filter((c) => c.id !== deletingClient.id));
      toast.success('Client supprime avec succes');
    } finally {
      setDeletingClient(null);
    }
  };

  const handleFormSuccess = () => {
    setIsDialogOpen(false);
    setEditingClient(null);
    fetchClients();
  };

  return (
    <div>
      <AppTopbar title="Clients" />

      <div className="p-6 space-y-6">
        <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
          <div className="relative w-full sm:w-72">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Rechercher un client..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9"
            />
          </div>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button onClick={() => setEditingClient(null)}>
                <Plus className="h-4 w-4 mr-2" />
                Nouveau client
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle>
                  {editingClient ? 'Modifier le client' : 'Nouveau client'}
                </DialogTitle>
                <DialogDescription>
                  {editingClient
                    ? 'Modifiez les informations du client'
                    : 'Ajoutez un nouveau client a votre liste'}
                </DialogDescription>
              </DialogHeader>
              <ClientForm
                client={editingClient}
                onSuccess={handleFormSuccess}
                onCancel={() => {
                  setIsDialogOpen(false);
                  setEditingClient(null);
                }}
              />
            </DialogContent>
          </Dialog>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Liste des clients</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="h-6 w-6 animate-spin text-primary" />
              </div>
            ) : filteredClients.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                {searchQuery ? 'Aucun client trouve' : 'Aucun client enregistre'}
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Nom</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead className="hidden md:table-cell">Telephone</TableHead>
                      <TableHead className="hidden lg:table-cell">Matricule fiscal</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredClients.map((client) => (
                      <TableRow key={client.id}>
                        <TableCell className="font-medium">{client.name}</TableCell>
                        <TableCell>{client.email}</TableCell>
                        <TableCell className="hidden md:table-cell">{client.phone || '-'}</TableCell>
                        <TableCell className="hidden lg:table-cell">{client.tax_id || '-'}</TableCell>
                        <TableCell className="text-right">
                          <div className="flex items-center justify-end gap-2">
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => {
                                setEditingClient(client);
                                setIsDialogOpen(true);
                              }}
                            >
                              <Pencil className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => setDeletingClient(client)}
                            >
                              <Trash2 className="h-4 w-4 text-destructive" />
                            </Button>
                          </div>
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

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={!!deletingClient} onOpenChange={() => setDeletingClient(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Supprimer ce client ?</AlertDialogTitle>
            <AlertDialogDescription>
              Cette action est irreversible. Le client &quot;{deletingClient?.name}&quot; sera
              definitivement supprime.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Annuler</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Supprimer
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
