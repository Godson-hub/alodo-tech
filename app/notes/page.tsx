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
    const { data, error } = await supabase
      .from("notes")
      .select("*")
      .eq("eleve_id", eleveId)
      .order("created_at", { ascending: false });

    if (error) {
      setErreur(error.message);
      return;
    }

    setNotes(data || []);
  }

  useEffect(() => {
    chargerEleve();
    chargerNotes();
  }, [eleveId]);

  async function gererEnvoi(e: React.FormEvent) {
    e.preventDefault();
    setErreur(null);

    if (!eleveId || !professeurId) {
      setErreur("Élève ou professeur manquant. Reviens depuis la page Mes classes.");
      return;
    }

    if (valeur.trim() === "" || appreciation.trim() === "") {
      setErreur("Merci de remplir tous les champs.");
      return;
    }

    const valeurNum = Number(valeur);

    // Cas limite : empêcher une note en dehors de 0-20
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
      <div style={{ padding: "2rem" }}>
        <p style={{ color: "red" }}>
          Aucun élève sélectionné. Reviens depuis la page{" "}
          <a href="/mes-classes" style={{ color: "blue" }}>
            Mes classes
          </a>
          .
        </p>
      </div>
    );
  }

  return (
    <div style={{ padding: "2rem", maxWidth: "500px" }}>
      <h1>Ajouter une note</h1>
      {eleve && (
        <p>
          Élève : <strong>{eleve.prenom} {eleve.nom}</strong>
        </p>
      )}

      <form onSubmit={gererEnvoi} style={{ marginBottom: "2rem" }}>
        <div style={{ marginBottom: "1rem" }}>
          <label>Note (sur 20)</label>
          <br />
          <input
            type="number"
            value={valeur}
            onChange={(e) => setValeur(e.target.value)}
            style={{ padding: "0.5rem", width: "100%" }}
          />
        </div>

        <div style={{ marginBottom: "1rem" }}>
          <label>Appréciation</label>
          <br />
          <textarea
            value={appreciation}
            onChange={(e) => setAppreciation(e.target.value)}
            style={{ padding: "0.5rem", width: "100%" }}
          />
        </div>

        {erreur && <p style={{ color: "red" }}>{erreur}</p>}

        <button type="submit" style={{ padding: "0.5rem 1rem" }}>
          Ajouter la note
        </button>
      </form>

      <h2>Notes de cet élève</h2>
      {notes.length === 0 && <p>Aucune note pour le moment.</p>}
      <ul>
        {notes.map((note) => (
          <li key={note.id} style={{ marginBottom: "0.5rem" }}>
            <strong>{note.valeur}/20</strong> — {note.appreciation}
          </li>
        ))}
      </ul>
    </div>
  );
}

export default function NotesPage() {
  return (
    <Suspense fallback={<p style={{ padding: "2rem" }}>Chargement...</p>}>
      <NotesContent />
    </Suspense>
  );
}
