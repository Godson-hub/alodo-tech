"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { supabase } from "../lib/supabase";

type Eleve = {
  id: number;
  nom: string;
  prenom: string;
};

type Note = {
  id: number;
  valeur: number;
  appreciation: string;
  created_at: string;
};

function NotesContent() {
  const searchParams = useSearchParams();
  const eleveId = searchParams.get("eleveId");
  const professeurId = searchParams.get("professeurId");

  const [eleve, setEleve] = useState<Eleve | null>(null);
  const [valeur, setValeur] = useState("");
  const [appreciation, setAppreciation] = useState("");
  const [notes, setNotes] = useState<Note[]>([]);
  const [erreur, setErreur] = useState<string | null>(null);
  const [chargement, setChargement] = useState(true);

  async function chargerEleve() {
    if (!eleveId) return;
    const { data } = await supabase
      .from("eleves")
      .select("*")
      .eq("id", eleveId)
      .single();
    setEleve(data);
  }

  async function chargerNotes() {
    if (!eleveId) return;
    setChargement(true);
    const { data, error } = await supabase
      .from("notes")
      .select("*")
      .eq("eleve_id", eleveId)
      .order("created_at", { ascending: false });

    if (error) {
      setErreur(error.message);
      setChargement(false);
      return;
    }

    setNotes(data || []);
    setChargement(false);
  }

  useEffect(() => {
    chargerEleve();
    chargerNotes();
  }, [eleveId]);

  async function gererEnvoi(e: React.FormEvent) {
    e.preventDefault();
    setErreur(null);

    if (!eleveId || !professeurId) {
      setErreur(
        "Élève ou professeur manquant. Reviens depuis la page Mes classes."
      );
      return;
    }

    if (valeur.trim() === "" || appreciation.trim() === "") {
      setErreur("Merci de remplir tous les champs.");
      return;
    }

    const valeurNum = Number(valeur);

    if (isNaN(valeurNum) || valeurNum < 0 || valeurNum > 20) {
      setErreur("La note doit être un nombre entre 0 et 20.");
      return;
    }

    const { error } = await supabase.from("notes").insert({
      valeur: valeurNum,
      appreciation,
      eleve_id: Number(eleveId),
      professeur_id: Number(professeurId),
    });

    if (error) {
      setErreur(error.message);
      return;
    }

    setValeur("");
    setAppreciation("");
    chargerNotes();
  }

  if (!eleveId || !professeurId) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-8">
        <p className="text-red-600 bg-red-50 border border-red-200 rounded-lg px-4 py-3">
          Aucun élève sélectionné. Reviens depuis la page{" "}
          <a href="/mes-classes" className="underline font-medium">
            Mes classes
          </a>
          .
        </p>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold text-blue-900 mb-2">
        Ajouter une note
      </h1>
      {eleve && (
        <p className="text-gray-600 mb-6">
          Élève :{" "}
          <span className="font-semibold text-gray-900">
            {eleve.prenom} {eleve.nom}
          </span>
        </p>
      )}

      <form
        onSubmit={gererEnvoi}
        className="bg-white rounded-xl shadow p-6 mb-8 space-y-4"
      >
        <div>
          <label className="block text-base font-medium text-gray-700 mb-1">
            Note (sur 20)
          </label>
          <input
            type="number"
            value={valeur}
            onChange={(e) => setValeur(e.target.value)}
            className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div>
          <label className="block text-base font-medium text-gray-700 mb-1">
            Appréciation
          </label>
          <textarea
            value={appreciation}
            onChange={(e) => setAppreciation(e.target.value)}
            rows={3}
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
          Ajouter la note
        </button>
      </form>

      <h2 className="text-lg font-semibold text-gray-800 mb-3">
        Notes de cet élève
      </h2>

      {chargement && <p className="text-gray-500">Chargement...</p>}

      {!chargement && notes.length === 0 && (
        <p className="text-gray-500">Aucune note pour le moment.</p>
      )}

      <ul className="space-y-2">
        {notes.map((note) => (
          <li
            key={note.id}
            className="bg-white rounded-lg shadow-sm px-4 py-3"
          >
            <div className="flex items-center gap-2 mb-1">
              <span
                className={`font-bold text-lg ${
                  note.valeur >= 10 ? "text-green-700" : "text-red-600"
                }`}
              >
                {note.valeur}/20
              </span>
            </div>
            <p className="text-gray-600 text-sm">{note.appreciation}</p>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default function NotesPage() {
  return (
    <Suspense
      fallback={
        <div className="max-w-2xl mx-auto px-4 py-8">
          <p className="text-gray-500">Chargement...</p>
        </div>
      }
    >
      <NotesContent />
    </Suspense>
  );
}
