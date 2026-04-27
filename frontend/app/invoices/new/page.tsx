"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Trash2, Plus, Save, X } from "lucide-react";

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

export default function NewInvoicePage() {
  const router = useRouter();
  const [clients, setClients] = useState<Client[]>([]);
  const [selectedClient, setSelectedClient] = useState("");
  const [issueDate, setIssueDate] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [currency, setCurrency] = useState("TND");
  const [taxRate, setTaxRate] = useState(19);
  const [notes, setNotes] = useState("");
  const [items, setItems] = useState<LineItem[]>([
    { description: "", quantity: 1, unit_price_ht: 0, tax_rate: 19 },
  ]);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem("access_token");
    fetch("http://localhost:8000/clients/", {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => res.json())
      .then((data) => setClients(data))
      .catch(console.error);
  }, []);

  const calculateTotals = () => {
    let subtotal = 0;
    items.forEach((item) => {
      subtotal += item.quantity * item.unit_price_ht;
    });
    const taxAmount = subtotal * (taxRate / 100);
    const total = subtotal + taxAmount;
    return { subtotal, taxAmount, total };
  };

  const { subtotal, taxAmount, total } = calculateTotals();

  const addLine = () => {
    setItems([...items, { description: "", quantity: 1, unit_price_ht: 0, tax_rate: taxRate }]);
  };

  const removeLine = (index: number) => {
    if (items.length === 1) {
      alert("Au moins une ligne est requise");
      return;
    }
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
    if (!selectedClient) {
      alert("Veuillez sélectionner un client");
      return;
    }
    if (!issueDate || !dueDate) {
      alert("Veuillez renseigner les dates");
      return;
    }
    if (items.length === 0 || items[0].description === "") {
      alert("Ajoutez au moins une ligne avec une description");
      return;
    }

    setSubmitting(true);
    const token = localStorage.getItem("access_token");
    const payload = {
      client_id: parseInt(selectedClient),
      issue_date: new Date(issueDate).toISOString(),
      due_date: new Date(dueDate).toISOString(),
      currency,
      tax_rate: taxRate,
      notes,
      items: items.filter((i) => i.description.trim() !== ""),
    };

    try {
      const res = await fetch("http://localhost:8000/invoices/", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });
      if (res.ok) {
        const data = await res.json();
        alert(`Facture ${data.invoice_number} créée avec succès`);
        router.push("/invoices");
      } else {
        const error = await res.json();
        alert(`Erreur : ${error.detail || "Problème lors de la création"}`);
      }
    } catch (err) {
      console.error(err);
      alert("Erreur réseau. Vérifiez que le backend est démarré.");
    } finally {
      setSubmitting(false);
    }
  };

  const formatMoney = (amount: number) =>
    amount.toLocaleString("fr-FR", { minimumFractionDigits: 2 }) + " " + currency;

  return (
    <div className="max-w-5xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-semibold text-gray-800">Nouvelle facture</h1>
        <button
          onClick={() => router.push("/invoices")}
          className="text-gray-500 hover:text-gray-700 flex items-center gap-1"
        >
          <X size={18} /> Annuler
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Informations générales */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h2 className="text-lg font-medium mb-4">Informations générales</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Client *
              </label>
              <select
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-emerald-500 focus:border-emerald-500"
                value={selectedClient}
                onChange={(e) => setSelectedClient(e.target.value)}
                required
              >
                <option value="">Sélectionner un client</option>
                {clients.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Devise
              </label>
              <select
                className="w-full border border-gray-300 rounded-lg px-3 py-2"
                value={currency}
                onChange={(e) => setCurrency(e.target.value)}
              >
                <option>TND</option>
                <option>MAD</option>
                <option>EUR</option>
                <option>USD</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Date d'émission *
              </label>
              <input
                type="date"
                className="w-full border border-gray-300 rounded-lg px-3 py-2"
                value={issueDate}
                onChange={(e) => setIssueDate(e.target.value)}
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Date d'échéance *
              </label>
              <input
                type="date"
                className="w-full border border-gray-300 rounded-lg px-3 py-2"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                required
              />
            </div>
          </div>
        </div>

        {/* Lignes */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-medium">Lignes de facture</h2>
            <button
              type="button"
              onClick={addLine}
              className="text-emerald-600 hover:text-emerald-700 flex items-center gap-1 text-sm"
            >
              <Plus size={16} /> Ajouter une ligne
            </button>
          </div>

          <div className="space-y-3">
            {items.map((item, idx) => (
              <div key={idx} className="flex flex-wrap items-end gap-2 p-3 bg-gray-50 rounded-lg">
                <div className="flex-1 min-w-[150px]">
                  <input
                    type="text"
                    placeholder="Description"
                    className="w-full border border-gray-300 rounded-lg px-2 py-1 text-sm"
                    value={item.description}
                    onChange={(e) => updateLine(idx, "description", e.target.value)}
                  />
                </div>
                <div className="w-24">
                  <input
                    type="number"
                    placeholder="Qté"
                    className="w-full border border-gray-300 rounded-lg px-2 py-1 text-sm"
                    value={item.quantity}
                    onChange={(e) => updateLine(idx, "quantity", parseFloat(e.target.value))}
                  />
                </div>
                <div className="w-32">
                  <input
                    type="number"
                    placeholder="Prix HT"
                    className="w-full border border-gray-300 rounded-lg px-2 py-1 text-sm"
                    value={item.unit_price_ht}
                    onChange={(e) => updateLine(idx, "unit_price_ht", parseFloat(e.target.value))}
                  />
                </div>
                <div className="w-24">
                  <input
                    type="number"
                    placeholder="TVA %"
                    className="w-full border border-gray-300 rounded-lg px-2 py-1 text-sm"
                    value={item.tax_rate}
                    onChange={(e) => updateLine(idx, "tax_rate", parseFloat(e.target.value))}
                  />
                </div>
                <div className="w-24 text-right text-sm font-medium">
                  {(item.quantity * item.unit_price_ht).toFixed(2)} {currency}
                </div>
                <button
                  type="button"
                  onClick={() => removeLine(idx)}
                  className="text-red-500 hover:text-red-700"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            ))}
          </div>

          {/* Totaux */}
          <div className="mt-6 text-right border-t pt-4">
            <div className="text-sm text-gray-600">
              Sous-total HT : <span className="font-medium">{formatMoney(subtotal)}</span>
            </div>
            <div className="text-sm text-gray-600">
              TVA ({taxRate}%) : <span className="font-medium">{formatMoney(taxAmount)}</span>
            </div>
            <div className="text-lg font-bold text-emerald-700 mt-1">
              Total TTC : {formatMoney(total)}
            </div>
          </div>
        </div>

        {/* Notes */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Notes (optionnel)
          </label>
          <textarea
            rows={3}
            className="w-full border border-gray-300 rounded-lg px-3 py-2"
            placeholder="Informations complémentaires..."
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
          />
        </div>

        {/* Actions */}
        <div className="flex justify-end gap-3">
          <button
            type="button"
            onClick={() => router.push("/invoices")}
            className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
          >
            Annuler
          </button>
          <button
            type="submit"
            disabled={submitting}
            className="bg-emerald-600 hover:bg-emerald-700 text-white px-6 py-2 rounded-lg flex items-center gap-2 disabled:opacity-50"
          >
            <Save size={18} />
            {submitting ? "Création en cours..." : "Créer la facture"}
          </button>
        </div>
      </form>
    </div>
  );
}