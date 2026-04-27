'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';

interface DashboardStats {
  monthly_revenue: number;
  unpaid_count: number;
  unpaid_total: number;
  clients_count: number;
  evolution: Array<{ month: string; total: number }>;
}

export default function DashboardPage() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [mounted, setMounted] = useState(false);
  const router = useRouter();

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    const token = localStorage.getItem('access_token');
    if (!token) {
      router.push('/login');
      return;
    }

    fetch('http://localhost:8000/dashboard/stats', {
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    })
      .then((res) => {
        if (!res.ok) throw new Error('Erreur de chargement');
        return res.json();
      })
      .then((data) => {
        setStats(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setError(err.message);
        setLoading(false);
      });
  }, [router]);

  if (loading) return <div className="p-8 text-center">Chargement...</div>;
  if (error) return <div className="p-8 text-center text-red-600">Erreur : {error}</div>;

  const formatMoney = (amount: number) =>
    amount.toLocaleString('fr-FR', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + ' TND';

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">Tableau de bord</h1>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow p-4">
          <h3 className="text-gray-500 text-sm uppercase">Chiffre d'affaires du mois</h3>
          <p className="text-2xl font-bold text-green-700">{formatMoney(stats?.monthly_revenue || 0)}</p>
        </div>
        <div className="bg-white rounded-lg shadow p-4">
          <h3 className="text-gray-500 text-sm uppercase">Impayées</h3>
          <p className="text-2xl font-bold text-red-600">{formatMoney(stats?.unpaid_total || 0)}</p>
          <p className="text-sm text-gray-500">{stats?.unpaid_count} facture(s)</p>
        </div>
        <div className="bg-white rounded-lg shadow p-4">
          <h3 className="text-gray-500 text-sm uppercase">Clients</h3>
          <p className="text-2xl font-bold">{stats?.clients_count}</p>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow p-4">
        <h3 className="text-lg font-semibold mb-4">Évolution du CA (6 derniers mois)</h3>
        {mounted && (
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={stats?.evolution}>
              <XAxis dataKey="month" />
              <YAxis tickFormatter={(value) => value.toLocaleString('fr-FR')} />
              <Tooltip formatter={(value: number) => [`${value.toLocaleString('fr-FR')} TND`, 'CA']} />
              <Line type="monotone" dataKey="total" stroke="#0F3B3C" strokeWidth={2} dot={{ r: 4 }} />
            </LineChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  );
}