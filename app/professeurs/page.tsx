"use client";

import { useState, useEffect } from "react";
import { supabase } from "../lib/supabase";

type Professeur = {
  id: number;
  nom: string;
  prenom: string;
  matiere: string;
};

export default function ProfesseursPage() {
  const [nom, setNom] = useState("");
  const [prenom, setPrenom] = useState("");
  const [matiere, setMatiere] = useState("");
  const [professeurs, setProfesseurs] = useState<Professeur[]>([]);
  const [erreur, setErreur] = useState<string | null>(null);
  const [chargement, setChargement] = useState(true);

  async function chargerProfesseurs() {
    setChargement(true);
    const { data, error } = await supabase
      .from("professeurs")
      .select("*")
      .order("id", { ascending: true });

    if (error) {
      setErreur(error.message);
      setChargement(false);
      return;
    }

    setProfesseurs(data || []);
    setChargement(false);
  }

  useEffect(() => {
    chargerProfesseurs();
  }, []);

  async function gererEnvoi(e: React.FormEvent) {
    e.preventDefault();
    setErreur(null);

    if (!nom.trim() || !prenom.trim() || !matiere.trim()) {
      setErreur("Merci de remplir tous les champs.");
      return;
    }

    const { error } = await supabase
      .from("professeurs")
      .insert({ nom, prenom, matiere });

    if (error) {
      setErreur(error.message);
      return;
    }

    setNom("");
    setPrenom("");
    setMatiere("");
    chargerProfesseurs();
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold text-blue-900 mb-6">
        Gestion des professeurs
      </h1>

      <form
        onSubmit={gererEnvoi}
        className="bg-white rounded-xl shadow p-6 mb-8 space-y-4"
      >
        <div>
          <label className="block text-base font-medium text-gray-700 mb-1">
            Nom
          </label>
          <input
            type="text"
            value={nom}
            onChange={(e) => setNom(e.target.value)}
            className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div>
          <label className="block text-base font-medium text-gray-700 mb-1">
            Prénom
          </label>
          <input
            type="text"
            value={prenom}
            onChange={(e) => setPrenom(e.target.value)}
            className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div>
          <label className="block text-base font-medium text-gray-700 mb-1">
            Matière
          </label>
          <input
            type="text"
            value={matiere}
            onChange={(e) => setMatiere(e.target.value)}
            className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {erreur && (
          <p className="text-red-600 text-sm bg-red-50 border border-red-200 rounded-lg px-3 py-2">
            {erreur}
          </p>
        )}

        <button
          type="submit"
          className="bg-blue-900 hover:bg-blue-800 text-white font-medium px-5 py-2 rounded-lg transition"
        >
          Ajouter le professeur
        </button>
      </form>

      <h2 className="text-lg font-semibold text-gray-800 mb-3">
        Liste des professeurs
      </h2>

      {chargement && <p className="text-gray-500">Chargement...</p>}

      {!chargement && professeurs.length === 0 && (
        <p className="text-gray-500">Aucun professeur pour le moment.</p>
      )}

      <ul className="space-y-2">
        {professeurs.map((prof) => (
          <li
            key={prof.id}
            className="bg-white rounded-lg shadow-sm px-4 py-3 flex justify-between items-center"
          >
            <span className="font-medium">
              {prof.prenom} {prof.nom}
            </span>
            <span className="text-sm text-blue-700 bg-blue-50 px-2 py-1 rounded-full">
              {prof.matiere}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}
