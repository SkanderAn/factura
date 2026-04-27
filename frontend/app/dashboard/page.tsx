"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";

export default function DashboardPage() {
  const [stats, setStats] = useState<any>(null);
  const router = useRouter();

  useEffect(() => {
    const token = localStorage.getItem("access_token");
    if (!token) {
      router.push("/login");
      return;
    }
    fetch("http://localhost:8000/dashboard/stats", {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => res.json())
      .then((data) => setStats(data))
      .catch((err) => console.error(err));
  }, []);

  if (!stats) return <div className="p-8">Chargement...</div>;

  const formatMoney = (n: number) => n.toLocaleString("fr-FR", { minimumFractionDigits: 2 }) + " TND";

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Tableau de bord</h1>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white p-4 rounded shadow">
          <p className="text-gray-500">CA du mois</p>
          <p className="text-2xl font-bold">{formatMoney(stats.monthly_revenue)}</p>
        </div>
        <div className="bg-white p-4 rounded shadow">
          <p className="text-gray-500">Impayées</p>
          <p className="text-2xl font-bold text-red-600">{formatMoney(stats.unpaid_total)}</p>
          <p className="text-sm">{stats.unpaid_count} facture(s)</p>
        </div>
        <div className="bg-white p-4 rounded shadow">
          <p className="text-gray-500">Clients</p>
          <p className="text-2xl font-bold">{stats.clients_count}</p>
        </div>
      </div>
      <div className="bg-white p-4 rounded shadow">
        <h3 className="text-lg font-semibold mb-4">Évolution du CA (6 mois)</h3>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={stats.evolution}>
            <XAxis dataKey="month" />
            <YAxis tickFormatter={(v) => v.toLocaleString("fr-FR")} />
            <Tooltip formatter={(v) => `${Number(v).toLocaleString("fr-FR")} TND`} />
            <Line type="monotone" dataKey="total" stroke="#10b981" strokeWidth={2} />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}