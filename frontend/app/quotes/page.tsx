"use client";

import { useEffect, useState } from "react";
import { Plus, Search } from "lucide-react";
import Link from "next/link";

interface Quote {
  id: number;
  quote_number: string;
  client_id: number;
  total_ttc: number;
  currency: string;
  status: string;
  issue_date: string;
}

export default function QuotesPage() {
  const [quotes, setQuotes] = useState<Quote[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  useEffect(() => {
    const token = localStorage.getItem("access_token");
    fetch("http://localhost:8000/quotes/", {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => res.json())
      .then((data) => {
        setQuotes(data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const filtered = quotes.filter((q) =>
    q.quote_number.toLowerCase().includes(search.toLowerCase())
  );

  const formatMoney = (amount: number) =>
    amount.toLocaleString("fr-FR", { minimumFractionDigits: 2 }) + " TND";

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "accepté":
        return "bg-green-100 text-green-800";
      case "refusé":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  if (loading) return <div className="text-center py-12">Chargement...</div>;

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-semibold text-gray-800">Devis</h1>
        <Link
          href="/quotes/new"
          className="bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-lg flex items-center gap-2"
        >
          <Plus size={18} />
          Nouveau devis
        </Link>
      </div>

      <div className="relative mb-6">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
        <input
          type="text"
          placeholder="Rechercher un devis..."
          className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500">N° Devis</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500">Client ID</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500">Date</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500">Total</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500">Statut</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((q) => (
                <tr key={q.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 text-sm font-medium text-gray-900">{q.quote_number}</td>
                  <td className="px-6 py-4 text-sm text-gray-500">{q.client_id}</td>
                  <td className="px-6 py-4 text-sm text-gray-500">
                    {new Date(q.issue_date).toLocaleDateString("fr-FR")}
                  </td>
                  <td className="px-6 py-4 text-sm font-medium text-gray-900">{formatMoney(q.total_ttc)}</td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-1 text-xs rounded-full ${getStatusBadge(q.status)}`}>
                      {q.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}