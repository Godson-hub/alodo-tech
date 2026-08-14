"use client";

import { useState, useEffect } from "react";
import { supabase } from "../lib/supabase";

type Professeur = {
  id: number;
  nom: string;
  prenom: string;
};

type Classe = {
  id: number;
  nom: string;
};

type Assignation = {
  id: number;
  professeurs: { nom: string; prenom: string } | null;
  classes: { nom: string } | null;
};

export default function AssignationsPage() {
  const [professeurId, setProfesseurId] = useState("");
  const [classeId, setClasseId] = useState("");
  const [professeurs, setProfesseurs] = useState<Professeur[]>([]);
  const [classes, setClasses] = useState<Classe[]>([]);
  const [assignations, setAssignations] = useState<Assignation[]>([]);
  const [erreur, setErreur] = useState<string | null>(null);
  const [chargement, setChargement] = useState(true);

  async function chargerProfesseurs() {
    const { data } = await supabase
      .from("professeurs")
      .select("*")
      .order("nom", { ascending: true });
    setProfesseurs(data || []);
  }

  async function chargerClasses() {
    const { data } = await supabase
      .from("classes")
      .select("*")
      .order("nom", { ascending: true });
    setClasses(data || []);
  }

  async function chargerAssignations() {
    setChargement(true);
    const { data, error } = await supabase
      .from("professeurs_classes")
      .select("*, professeurs(nom, prenom), classes(nom)")
      .order("id", { ascending: true });

    if (error) {
      setErreur(error.message);
      setChargement(false);
      return;
    }

    setAssignations(data || []);
    setChargement(false);
  }

  useEffect(() => {
    chargerProfesseurs();
    chargerClasses();
    chargerAssignations();
  }, []);

  async function gererEnvoi(e: React.FormEvent) {
    e.preventDefault();
    setErreur(null);

    if (!professeurId || !classeId) {
      setErreur("Merci de choisir un professeur et une classe.");
      return;
    }

    const { error } = await supabase.from("professeurs_classes").insert({
      professeur_id: Number(professeurId),
      classe_id: Number(classeId),
    });

    if (error) {
      setErreur(error.message);
      return;
    }

    setProfesseurId("");
    setClasseId("");
    chargerAssignations();
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold text-blue-900 mb-6">
        Assigner un professeur à une classe
      </h1>

      {(professeurs.length === 0 || classes.length === 0) && (
        <p className="text-orange-600 bg-orange-50 border border-orange-200 rounded-lg px-3 py-2 mb-4">
          Crée d&apos;abord au moins un professeur et une classe avant de
          faire une assignation.
        </p>
      )}

      <form
        onSubmit={gererEnvoi}
        className="bg-white rounded-xl shadow p-6 mb-8 space-y-4"
      >
        <div>
          <label className="block text-base font-medium text-gray-700 mb-1">
            Professeur
          </label>
          <select
            value={professeurId}
            onChange={(e) => setProfesseurId(e.target.value)}
            className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">-- Choisir un professeur --</option>
            {professeurs.map((prof) => (
              <option key={prof.id} value={prof.id}>
                {prof.prenom} {prof.nom}
              </option>
            ))}
          </select>
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
          Assigner
        </button>
      </form>

      <h2 className="text-lg font-semibold text-gray-800 mb-3">
        Assignations existantes
      </h2>

      {chargement && <p className="text-gray-500">Chargement...</p>}

      {!chargement && assignations.length === 0 && (
        <p className="text-gray-500">Aucune assignation pour le moment.</p>
      )}

      <ul className="space-y-2">
        {assignations.map((a) => (
          <li
            key={a.id}
            className="bg-white rounded-lg shadow-sm px-4 py-3 flex items-center gap-2"
          >
            <span className="font-medium">
              {a.professeurs?.prenom} {a.professeurs?.nom}
            </span>
            <span className="text-gray-400">→</span>
            <span className="text-sm text-blue-700 bg-blue-50 px-2 py-1 rounded-full">
              {a.classes?.nom}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}
