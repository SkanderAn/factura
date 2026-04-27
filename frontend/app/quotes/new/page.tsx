"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Trash2, Plus } from "lucide-react";

interface Client {
  id: number;
  name: string;
}

interface LineItem {
  description: string;
  quantity: number;
  unit_price_ht: number;
  tax_rate: number;
}

export default function NewQuotePage() {
  const router = useRouter();
  const [clients, setClients] = useState<Client[]>([]);
  const [selectedClient, setSelectedClient] = useState("");
  const [issueDate, setIssueDate] = useState("");
  const [validUntil, setValidUntil] = useState("");
  const [currency, setCurrency] = useState("TND");
  const [taxRate, setTaxRate] = useState(19);
  const [notes, setNotes] = useState("");
  const [items, setItems] = useState<LineItem[]>([
    { description: "", quantity: 1, unit_price_ht: 0, tax_rate: 19 },
  ]);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem("access_token");
    fetch("http://localhost:8000/clients/", {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then(res => res.json())
      .then(data => setClients(data))
      .catch(console.error);
  }, []);

  const calculateTotals = () => {
    let subtotal = 0;
    items.forEach(item => {
      subtotal += item.quantity * item.unit_price_ht;
    });
    const taxAmount = subtotal * (taxRate / 100);
    const total = subtotal + taxAmount;
    return { subtotal, taxAmount, total };
  };

  const { subtotal, taxAmount, total } = calculateTotals();

  const addLine = () => setItems([...items, { description: "", quantity: 1, unit_price_ht: 0, tax_rate: taxRate }]);
  const removeLine = (index: number) => {
    const newItems = [...items];
    newItems.splice(index, 1);
    setItems(newItems);
  };
  const updateLine = (index: number, field: keyof LineItem, value: any) => {
    const newItems = [...items];
    newItems[index] = { ...newItems[index], [field]: value };
    setItems(newItems);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedClient) return alert("Sélectionnez un client");
    if (items.length === 0 || !items[0].description) return alert("Ajoutez au moins une ligne");
    setSubmitting(true);
    const token = localStorage.getItem("access_token");
    const payload = {
      client_id: parseInt(selectedClient),
      issue_date: new Date(issueDate).toISOString(),
      valid_until: new Date(validUntil).toISOString(),
      currency,
      tax_rate: taxRate,
      notes,
      items: items.filter(i => i.description.trim()),
    };
    try {
      const res = await fetch("http://localhost:8000/quotes/", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify(payload),
      });
      if (res.ok) {
        const data = await res.json();
        alert(`Devis ${data.quote_number} créé`);
        router.push("/quotes");
      } else {
        alert("Erreur lors de la création");
      }
    } catch (err) {
      alert("Erreur réseau");
    } finally {
      setSubmitting(false);
    }
  };

  const formatMoney = (amount: number) => amount.toLocaleString("fr-FR", { minimumFractionDigits: 2 }) + " " + currency;

  return (
    <div className="max-w-4xl mx-auto">
      <h1 className="text-2xl font-semibold text-gray-800 mb-6">Nouveau devis</h1>
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Infos générales */}
        <div className="bg-white rounded-xl shadow-sm border p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Client *</label>
              <select className="w-full border rounded-lg px-3 py-2" value={selectedClient} onChange={e => setSelectedClient(e.target.value)} required>
                <option value="">Sélectionner</option>
                {clients.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Devise</label>
              <select className="w-full border rounded-lg px-3 py-2" value={currency} onChange={e => setCurrency(e.target.value)}>
                <option>TND</option><option>MAD</option><option>EUR</option><option>USD</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Date d'émission *</label>
              <input type="date" className="w-full border rounded-lg px-3 py-2" value={issueDate} onChange={e => setIssueDate(e.target.value)} required />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Validité jusqu'au *</label>
              <input type="date" className="w-full border rounded-lg px-3 py-2" value={validUntil} onChange={e => setValidUntil(e.target.value)} required />
            </div>
          </div>
        </div>

        {/* Lignes */}
        <div className="bg-white rounded-xl shadow-sm border p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-medium">Lignes du devis</h2>
            <button type="button" onClick={addLine} className="text-emerald-600 text-sm flex items-center gap-1"><Plus size={16} /> Ajouter</button>
          </div>
          {items.map((item, idx) => (
            <div key={idx} className="flex flex-wrap gap-2 items-end border-b pb-3 mb-3">
              <input type="text" placeholder="Description" className="flex-1 border rounded-lg px-2 py-1 text-sm" value={item.description} onChange={e => updateLine(idx, "description", e.target.value)} />
              <input type="number" placeholder="Qté" className="w-20 border rounded-lg px-2 py-1 text-sm" value={item.quantity} onChange={e => updateLine(idx, "quantity", parseFloat(e.target.value))} />
              <input type="number" placeholder="Prix HT" className="w-28 border rounded-lg px-2 py-1 text-sm" value={item.unit_price_ht} onChange={e => updateLine(idx, "unit_price_ht", parseFloat(e.target.value))} />
              <input type="number" placeholder="TVA %" className="w-20 border rounded-lg px-2 py-1 text-sm" value={item.tax_rate} onChange={e => updateLine(idx, "tax_rate", parseFloat(e.target.value))} />
              <div className="w-24 text-right text-sm">{(item.quantity * item.unit_price_ht).toFixed(2)} {currency}</div>
              <button type="button" onClick={() => removeLine(idx)} className="text-red-500"><Trash2 size={16} /></button>
            </div>
          ))}
          <div className="mt-4 text-right">
            <div className="text-sm">Sous-total HT : {formatMoney(subtotal)}</div>
            <div className="text-sm">TVA ({taxRate}%) : {formatMoney(taxAmount)}</div>
            <div className="text-lg font-bold">Total TTC : {formatMoney(total)}</div>
          </div>
        </div>

        {/* Notes */}
        <div className="bg-white rounded-xl shadow-sm border p-6">
          <label className="block text-sm font-medium mb-1">Notes</label>
          <textarea rows={3} className="w-full border rounded-lg px-3 py-2" value={notes} onChange={e => setNotes(e.target.value)} />
        </div>

        <div className="flex justify-end gap-3">
          <button type="button" onClick={() => router.push("/quotes")} className="px-4 py-2 border rounded-lg">Annuler</button>
          <button type="submit" disabled={submitting} className="bg-emerald-600 text-white px-6 py-2 rounded-lg disabled:opacity-50">{submitting ? "Création..." : "Créer le devis"}</button>
        </div>
      </form>
    </div>
  );
}