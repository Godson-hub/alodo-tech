"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
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

type Eleve = {
  id: number;
  nom: string;
  prenom: string;
};

export default function MesClassesPage() {
  const [professeurs, setProfesseurs] = useState<Professeur[]>([]);
  const [professeurId, setProfesseurId] = useState("");
  const [classesDuProf, setClassesDuProf] = useState<Classe[]>([]);
  const [classeId, setClasseId] = useState("");
  const [eleves, setEleves] = useState<Eleve[]>([]);
  const [erreur, setErreur] = useState<string | null>(null);

  useEffect(() => {
    async function chargerProfesseurs() {
      const { data } = await supabase
        .from("professeurs")
        .select("*")
        .order("nom", { ascending: true });
      setProfesseurs(data || []);
    }
    chargerProfesseurs();
  }, []);

  useEffect(() => {
    async function chargerClassesDuProf() {
      setClasseId("");
      setEleves([]);

      if (!professeurId) {
        setClassesDuProf([]);
        return;
      }

      const { data, error } = await supabase
        .from("professeurs_classes")
        .select("classes(id, nom)")
        .eq("professeur_id", professeurId);

      if (error) {
        setErreur(error.message);
        return;
      }

      const classes = (data || [])
        .map((row: any) => row.classes)
        .filter((c: any) => c !== null);

      setClassesDuProf(classes);
    }

    chargerClassesDuProf();
  }, [professeurId]);

  useEffect(() => {
    async function chargerEleves() {
      if (!classeId) {
        setEleves([]);
        return;
      }

      const { data, error } = await supabase
        .from("eleves")
        .select("*")
        .eq("classe_id", classeId)
        .order("nom", { ascending: true });

      if (error) {
        setErreur(error.message);
        return;
      }

      setEleves(data || []);
    }

    chargerEleves();
  }, [classeId]);

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold text-blue-900 mb-6">Mes classes</h1>

      {erreur && (
        <p className="text-red-600 text-sm bg-red-50 border border-red-200 rounded-lg px-3 py-2 mb-4">
          {erreur}
        </p>
      )}

      <div className="bg-white rounded-xl shadow p-6 mb-8 space-y-4">
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

        {professeurId && classesDuProf.length === 0 && (
          <p className="text-orange-600 bg-orange-50 border border-orange-200 rounded-lg px-3 py-2">
            Ce professeur n&apos;a pas encore de classe assignée.
          </p>
        )}

        {classesDuProf.length > 0 && (
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
              {classesDuProf.map((classe) => (
                <option key={classe.id} value={classe.id}>
                  {classe.nom}
                </option>
              ))}
            </select>
          </div>
        )}
      </div>

      {classeId && (
        <>
          <h2 className="text-lg font-semibold text-gray-800 mb-3">
            Élèves de la classe
          </h2>
          {eleves.length === 0 && (
            <p className="text-gray-500">Aucun élève dans cette classe.</p>
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
                <Link
                  href={`/notes?eleveId=${eleve.id}&professeurId=${professeurId}`}
                  className="text-sm text-white bg-blue-900 hover:bg-blue-800 px-3 py-1 rounded-lg transition"
                >
                  Ajouter une note
                </Link>
              </li>
            ))}
          </ul>
        </>
      )}
    </div>
  );
}
