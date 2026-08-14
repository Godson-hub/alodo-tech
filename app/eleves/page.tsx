"use client";

import { useState, useEffect } from "react";
import { supabase } from "../lib/supabase";

type Classe = {
  id: number;
  nom: string;
};

type Eleve = {
  id: number;
  nom: string;
  prenom: string;
  classe_id: number;
  classes: { nom: string } | null;
};

export default function ElevesPage() {
  const [nom, setNom] = useState("");
  const [prenom, setPrenom] = useState("");
  const [classeId, setClasseId] = useState("");
  const [classes, setClasses] = useState<Classe[]>([]);
  const [eleves, setEleves] = useState<Eleve[]>([]);
  const [erreur, setErreur] = useState<string | null>(null);
  const [chargement, setChargement] = useState(true);

  async function chargerClasses() {
    const { data } = await supabase
      .from("classes")
      .select("*")
      .order("nom", { ascending: true });
    setClasses(data || []);
  }

  async function chargerEleves() {
    setChargement(true);
    const { data, error } = await supabase
      .from("eleves")
      .select("*, classes(nom)")
      .order("id", { ascending: true });

    if (error) {
      setErreur(error.message);
      setChargement(false);
      return;
    }

    setEleves(data || []);
    setChargement(false);
  }

  useEffect(() => {
    chargerClasses();
    chargerEleves();
  }, []);

  async function gererEnvoi(e: React.FormEvent) {
    e.preventDefault();
    setErreur(null);

    if (!nom.trim() || !prenom.trim() || !classeId) {
      setErreur("Merci de remplir tous les champs, y compris la classe.");
      return;
    }

    const { error } = await supabase.from("eleves").insert({
      nom,
      prenom,
      classe_id: Number(classeId),
    });

    if (error) {
      setErreur(error.message);
      return;
    }

    setNom("");
    setPrenom("");
    setClasseId("");
    chargerEleves();
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold text-blue-900 mb-6">
        Gestion des élèves
      </h1>

      {classes.length === 0 && (
        <p className="text-orange-600 bg-orange-50 border border-orange-200 rounded-lg px-3 py-2 mb-4">
          Aucune classe trouvée. Crée d&apos;abord une classe sur la page{" "}
          <a href="/classes" className="underline font-medium">
            /classes
          </a>
          .
        </p>
      )}

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
            Classe
          </label>
          <select
            value={classeId}
            onChange={(e) => setClasseId(e.target.value)}
            className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">-- Choisir une classe --</option>
            {classes.map((classe) => (
              <option key={classe.id} value={classe.id}>
                {classe.nom}
              </option>
            ))}
          </select>
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
          Ajouter l&apos;élève
        </button>
      </form>

      <h2 className="text-lg font-semibold text-gray-800 mb-3">
        Liste des élèves
      </h2>

      {chargement && <p className="text-gray-500">Chargement...</p>}

      {!chargement && eleves.length === 0 && (
        <p className="text-gray-500">Aucun élève pour le moment.</p>
      )}

      <ul className="space-y-2">
        {eleves.map((eleve) => (
          <li
            key={eleve.id}
            className="bg-white rounded-lg shadow-sm px-4 py-3 flex justify-between items-center"
          >
            <span className="font-medium">
              {eleve.prenom} {eleve.nom}
            </span>
            <span className="text-sm text-green-700 bg-green-50 px-2 py-1 rounded-full">
              {eleve.classes?.nom ?? "Classe inconnue"}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}
