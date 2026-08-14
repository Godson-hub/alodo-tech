"use client";

import { useState, useEffect } from "react";
import { supabase } from "../lib/supabase";

type Classe = {
  id: number;
  nom: string;
};

export default function ClassesPage() {
  const [nom, setNom] = useState("");
  const [classes, setClasses] = useState<Classe[]>([]);
  const [erreur, setErreur] = useState<string | null>(null);
  const [chargement, setChargement] = useState(true);

  async function chargerClasses() {
    setChargement(true);
    const { data, error } = await supabase
      .from("classes")
      .select("*")
      .order("id", { ascending: true });

    if (error) {
      setErreur(error.message);
      setChargement(false);
      return;
    }

    setClasses(data || []);
    setChargement(false);
  }

  useEffect(() => {
    chargerClasses();
  }, []);

  async function gererEnvoi(e: React.FormEvent) {
    e.preventDefault();
    setErreur(null);

    if (!nom.trim()) {
      setErreur("Merci de renseigner un nom de classe.");
      return;
    }

    const { error } = await supabase.from("classes").insert({ nom });

    if (error) {
      setErreur(error.message);
      return;
    }

    setNom("");
    chargerClasses();
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold text-blue-900 mb-6">
        Gestion des classes
      </h1>

      <form
        onSubmit={gererEnvoi}
        className="bg-white rounded-xl shadow p-6 mb-8 space-y-4"
      >
        <div>
          <label className="block text-base font-medium text-gray-700 mb-1">
            Nom de la classe
          </label>
          <input
            type="text"
            value={nom}
            onChange={(e) => setNom(e.target.value)}
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
          Ajouter la classe
        </button>
      </form>

      <h2 className="text-lg font-semibold text-gray-800 mb-3">
        Liste des classes
      </h2>

      {chargement && <p className="text-gray-500">Chargement...</p>}

      {!chargement && classes.length === 0 && (
        <p className="text-gray-500">Aucune classe pour le moment.</p>
      )}

      <ul className="space-y-2">
        {classes.map((classe) => (
          <li
            key={classe.id}
            className="bg-white rounded-lg shadow-sm px-4 py-3 font-medium"
          >
            {classe.nom}
          </li>
        ))}
      </ul>
    </div>
  );
}
