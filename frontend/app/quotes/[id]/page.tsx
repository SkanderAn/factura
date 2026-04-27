"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";

interface Quote {
  id: number;
  quote_number: string;
  client_id: number;
  issue_date: string;
  valid_until: string;
  currency: string;
  subtotal_ht: number;
  tax_rate: number;
  tax_amount: number;
  total_ttc: number;
  status: string;
  notes: string;
  items: Array<{
    description: string;
    quantity: number;
    unit_price_ht: number;
    tax_rate: number;
  }>;
}

export default function QuoteDetailPage() {
  const [quote, setQuote] = useState<Quote | null>(null);
  const [loading, setLoading] = useState(true);
  const [converting, setConverting] = useState(false);
  const router = useRouter();
  const params = useParams();
  const id = params?.id as string;

  useEffect(() => {
    const token = localStorage.getItem("access_token");
    if (!token) {
      router.push("/login");
      return;
    }
    fetch(`http://localhost:8000/quotes/${id}`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then(res => res.json())
      .then(data => {
        setQuote(data);
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setLoading(false);
      });
  }, [id, router]);

  const handleConvert = async () => {
    if (!confirm("Convertir ce devis accepté en facture ?")) return;
    setConverting(true);
    const token = localStorage.getItem("access_token");
    try {
      const res = await fetch(`http://localhost:8000/quotes/${id}/convert`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        alert(`Devis converti en facture n°${data.invoice_number}`);
        router.push("/invoices");
      } else {
        alert("Erreur lors de la conversion");
      }
    } catch (err) {
      console.error(err);
    } finally {
      setConverting(false);
    }
  };

  const handleUpdateStatus = async (newStatus: string) => {
    const token = localStorage.getItem("access_token");
    try {
      const res = await fetch(`http://localhost:8000/quotes/${id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ status: newStatus }),
      });
      if (res.ok) {
        setQuote(prev => prev ? { ...prev, status: newStatus } : null);
      } else {
        alert("Erreur");
      }
    } catch (err) {
      console.error(err);
    }
  };

  if (loading) return <div className="p-8 text-center">Chargement...</div>;
  if (!quote) return <div className="p-8 text-center">Devis non trouvé</div>;

  const formatMoney = (amount: number) => amount.toLocaleString("fr-FR", { minimumFractionDigits: 2 }) + ` ${quote.currency}`;

  return (
    <div className="max-w-4xl mx-auto">
      <h1 className="text-2xl font-semibold mb-4">Devis {quote.quote_number}</h1>
      <div className="bg-white rounded-xl shadow-sm border p-6 space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div><span className="font-medium">Client ID :</span> {quote.client_id}</div>
          <div><span className="font-medium">Statut :</span> 
            <span className={`ml-2 px-2 py-1 rounded-full text-xs ${
              quote.status === "accepté" ? "bg-green-100 text-green-800" :
              quote.status === "refusé" ? "bg-red-100 text-red-800" :
              quote.status === "converti" ? "bg-blue-100 text-blue-800" :
              "bg-gray-100"
            }`}>{quote.status}</span>
          </div>
          <div><span className="font-medium">Date d'émission :</span> {new Date(quote.issue_date).toLocaleDateString("fr-FR")}</div>
          <div><span className="font-medium">Validité :</span> {new Date(quote.valid_until).toLocaleDateString("fr-FR")}</div>
          <div><span className="font-medium">Devise :</span> {quote.currency}</div>
        </div>

        <table className="w-full border-collapse text-sm">
          <thead className="bg-gray-50">
            <tr>
              <th className="p-2 text-left">Description</th>
              <th className="p-2 text-right">Qté</th>
              <th className="p-2 text-right">Prix HT</th>
              <th className="p-2 text-right">TVA</th>
              <th className="p-2 text-right">Total HT</th>
            </tr>
          </thead>
          <tbody>
            {quote.items.map((item, idx) => (
              <tr key={idx} className="border-t">
                <td className="p-2">{item.description}</td>
                <td className="p-2 text-right">{item.quantity}</td>
                <td className="p-2 text-right">{item.unit_price_ht.toFixed(2)}</td>
                <td className="p-2 text-right">{item.tax_rate}%</td>
                <td className="p-2 text-right">{(item.quantity * item.unit_price_ht).toFixed(2)}</td>
              </tr>
            ))}
          </tbody>
        </table>

        <div className="text-right space-y-1">
          <div>Sous-total HT : {formatMoney(quote.subtotal_ht)}</div>
          <div>TVA ({quote.tax_rate}%) : {formatMoney(quote.tax_amount)}</div>
          <div className="text-xl font-bold">Total TTC : {formatMoney(quote.total_ttc)}</div>
        </div>

        {quote.notes && <div><span className="font-medium">Notes :</span> {quote.notes}</div>}

        <div className="flex gap-3 mt-6">
          <Link href="/quotes" className="bg-gray-500 text-white px-4 py-2 rounded-lg">Retour</Link>
          {quote.status !== "accepté" && quote.status !== "refusé" && quote.status !== "converti" && (
            <button onClick={() => handleUpdateStatus("accepté")} className="bg-green-600 text-white px-4 py-2 rounded-lg">Accepter le devis</button>
          )}
          {quote.status === "accepté" && (
            <button onClick={handleConvert} disabled={converting} className="bg-blue-600 text-white px-4 py-2 rounded-lg">
              {converting ? "Conversion..." : "Convertir en facture"}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}