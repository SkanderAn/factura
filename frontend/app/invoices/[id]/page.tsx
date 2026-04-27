"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { Download, ChevronLeft } from "lucide-react";

interface Invoice {
  id: number;
  invoice_number: string;
  client_id: number;
  issue_date: string;
  due_date: string;
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

export default function InvoiceDetailPage() {
  const [invoice, setInvoice] = useState<Invoice | null>(null);
  const [loading, setLoading] = useState(true);
  const [downloading, setDownloading] = useState(false);
  const params = useParams();
  const router = useRouter();
  const id = params?.id as string;

  useEffect(() => {
    const token = localStorage.getItem("access_token");
    if (!token) {
      router.push("/login");
      return;
    }
    fetch(`http://localhost:8000/invoices/${id}`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => res.json())
      .then((data) => {
        setInvoice(data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [id, router]);

  const downloadPDF = async () => {
    setDownloading(true);
    const token = localStorage.getItem("access_token");
    try {
      const response = await fetch(`http://localhost:8000/invoices/${id}/pdf`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `facture_${invoice?.invoice_number}.pdf`;
        document.body.appendChild(a);
        a.click();
        a.remove();
        window.URL.revokeObjectURL(url);
      } else {
        alert("Erreur lors du téléchargement du PDF");
      }
    } catch (err) {
      console.error(err);
      alert("Erreur réseau");
    } finally {
      setDownloading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-pulse text-gray-500">Chargement...</div>
      </div>
    );
  }
  if (!invoice) {
    return <div className="text-center py-12 text-red-600">Facture non trouvée</div>;
  }

  const formatMoney = (amount: number) =>
    amount.toLocaleString("fr-FR", { minimumFractionDigits: 2 }) + ` ${invoice.currency}`;

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "payée":
        return "bg-green-100 text-green-800";
      case "impayée":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <Link
          href="/invoices"
          className="flex items-center gap-1 text-gray-600 hover:text-gray-900"
        >
          <ChevronLeft size={20} /> Retour aux factures
        </Link>
        <button
          onClick={downloadPDF}
          disabled={downloading}
          className="bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition disabled:opacity-50"
        >
          <Download size={18} />
          {downloading ? "Génération..." : "Télécharger PDF"}
        </button>
      </div>

      {/* Carte de la facture */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 space-y-6">
        <div className="border-b pb-4">
          <h1 className="text-2xl font-bold text-gray-800">Facture {invoice.invoice_number}</h1>
          <div className="mt-2 flex gap-2">
            <span className={`px-2 py-1 text-xs rounded-full ${getStatusBadge(invoice.status)}`}>
              {invoice.status}
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
          <div>
            <p className="text-gray-500">Client ID</p>
            <p className="font-medium">{invoice.client_id}</p>
          </div>
          <div>
            <p className="text-gray-500">Date d'émission</p>
            <p className="font-medium">{new Date(invoice.issue_date).toLocaleDateString("fr-FR")}</p>
          </div>
          <div>
            <p className="text-gray-500">Date d'échéance</p>
            <p className="font-medium">{new Date(invoice.due_date).toLocaleDateString("fr-FR")}</p>
          </div>
          <div>
            <p className="text-gray-500">Devise</p>
            <p className="font-medium">{invoice.currency}</p>
          </div>
        </div>

        {/* Tableau des lignes */}
        <div className="overflow-x-auto">
          <table className="w-full text-sm border-collapse">
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
              {invoice.items.map((item, idx) => (
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
        </div>

        {/* Totaux */}
        <div className="text-right space-y-1 border-t pt-4">
          <div className="text-sm text-gray-600">Sous-total HT : {formatMoney(invoice.subtotal_ht)}</div>
          <div className="text-sm text-gray-600">TVA ({invoice.tax_rate}%) : {formatMoney(invoice.tax_amount)}</div>
          <div className="text-xl font-bold text-emerald-700">Total TTC : {formatMoney(invoice.total_ttc)}</div>
        </div>

        {invoice.notes && (
          <div className="border-t pt-4">
            <p className="text-gray-500 text-sm">Notes :</p>
            <p className="text-sm">{invoice.notes}</p>
          </div>
        )}
      </div>
    </div>
  );
}