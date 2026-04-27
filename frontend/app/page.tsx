"use client";

import Link from "next/link";

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 to-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Hero */}
        <div className="text-center py-20">
          <h1 className="text-4xl sm:text-5xl font-bold text-gray-900">
            Gérez vos factures et devis avec <span className="text-emerald-600">Factura</span>
          </h1>
          <p className="mt-4 text-xl text-gray-600 max-w-2xl mx-auto">
            La solution simple, rapide et professionnelle pour les entrepreneurs du Maghreb et du Moyen‑Orient.
          </p>
          <div className="mt-8 flex justify-center gap-4">
            <Link
              href="/register"
              className="bg-emerald-600 hover:bg-emerald-700 text-white px-6 py-3 rounded-lg font-medium transition"
            >
              Commencer gratuitement
            </Link>
            <Link
              href="/login"
              className="border border-gray-300 bg-white hover:bg-gray-50 text-gray-700 px-6 py-3 rounded-lg font-medium transition"
            >
              Se connecter
            </Link>
          </div>
        </div>

        {/* Features */}
        <div className="grid md:grid-cols-3 gap-8 py-16">
          <div className="bg-white p-6 rounded-xl shadow-sm text-center">
            <div className="text-3xl mb-3">📄</div>
            <h3 className="text-lg font-semibold">Factures professionnelles</h3>
            <p className="text-gray-500 mt-2">Créez et envoyez des factures en français ou arabe, au format PDF.</p>
          </div>
          <div className="bg-white p-6 rounded-xl shadow-sm text-center">
            <div className="text-3xl mb-3">✉️</div>
            <h3 className="text-lg font-semibold">Devis & conversion</h3>
            <p className="text-gray-500 mt-2">Générez des devis, acceptez‑les et transformez‑les en factures en un clic.</p>
          </div>
          <div className="bg-white p-6 rounded-xl shadow-sm text-center">
            <div className="text-3xl mb-3">📊</div>
            <h3 className="text-lg font-semibold">Tableau de bord</h3>
            <p className="text-gray-500 mt-2">Suivez votre chiffre d’affaires, vos impayés et l’évolution de votre activité.</p>
          </div>
        </div>

        {/* Footer simple */}
        <footer className="text-center py-8 text-gray-400 text-sm border-t">
          © {new Date().getFullYear()} Factura – Tous droits réservés
        </footer>
      </div>
    </div>
  );
}