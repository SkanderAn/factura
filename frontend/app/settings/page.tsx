"use client";

import { useState } from "react";
import { Save } from "lucide-react";

export default function SettingsPage() {
  const [companyName, setCompanyName] = useState("Factura");
  const [companyAddress, setCompanyAddress] = useState("Tunis, Tunisie");
  const [taxId, setTaxId] = useState("1234567X/A/M/000");

  const handleSave = () => {
    // Sauvegarde locale ou appel API plus tard
    alert("Paramètres sauvegardés (local storage)");
    localStorage.setItem("company_name", companyName);
    localStorage.setItem("company_address", companyAddress);
    localStorage.setItem("company_tax_id", taxId);
  };

  return (
    <div>
      <h1 className="text-2xl font-semibold text-gray-800 mb-6">Paramètres</h1>
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 max-w-2xl">
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Nom de l'entreprise
            </label>
            <input
              type="text"
              className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-emerald-500"
              value={companyName}
              onChange={(e) => setCompanyName(e.target.value)}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Adresse
            </label>
            <input
              type="text"
              className="w-full border border-gray-300 rounded-lg px-4 py-2"
              value={companyAddress}
              onChange={(e) => setCompanyAddress(e.target.value)}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Matricule fiscal / ICE
            </label>
            <input
              type="text"
              className="w-full border border-gray-300 rounded-lg px-4 py-2"
              value={taxId}
              onChange={(e) => setTaxId(e.target.value)}
            />
          </div>
          <button
            onClick={handleSave}
            className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-lg transition"
          >
            <Save size={18} />
            Enregistrer
          </button>
        </div>
      </div>
    </div>
  );
}