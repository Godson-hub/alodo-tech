"use client";

import { useEffect, useState } from "react";
import { supabase } from "../lib/supabase";
interface Professeur {
  id: string;
  nom: string;
  prenom: string;
}

interface Classe {
  id: string;
  nom: string;
}

interface Eleve {
  id: string;
  nom: string;
  prenom: string;
}

interface Note {
  id: string;
  eleve_id: string;
  valeur: number;
  appreciation: string;
  created_at: string;
}

export default function MesClassesPage() {
  const [professeurs, setProfesseurs] = useState<Professeur[]>([]);
  const [classes, setClasses] = useState<Classe[]>([]);
  const [eleves, setEleves] = useState<Eleve[]>([]);

  const [professeurId, setProfesseurId] = useState<string>("");
  const [classeId, setClasseId] = useState<string>("");

  const [error, setError] = useState<string | null>(null);

  // élève dont on gère les notes (formulaire d'ajout ou liste ouverte)
  const [eleveOuvert, setEleveOuvert] = useState<string | null>(null);
  const [notesParEleve, setNotesParEleve] = useState<Record<string, Note[]>>({});

  // formulaire d'ajout de note
  const [nouvelleValeur, setNouvelleValeur] = useState("");
  const [nouvelleAppreciation, setNouvelleAppreciation] = useState("");

  // édition d'une note existante
  const [editNoteId, setEditNoteId] = useState<string | null>(null);
  const [editValeur, setEditValeur] = useState("");
  const [editAppreciation, setEditAppreciation] = useState("");

  useEffect(() => {
    fetchProfesseurs();
    fetchClasses();
  }, []);

  useEffect(() => {
    if (classeId) fetchEleves(classeId);
    else setEleves([]);
  }, [classeId]);

  async function fetchProfesseurs() {
    const { data, error } = await supabase.from("professeurs").select("*");
    if (error) setError(error.message);
    else setProfesseurs(data ?? []);
  }

  async function fetchClasses() {
    const { data, error } = await supabase.from("classes").select("*");
    if (error) setError(error.message);
    else setClasses(data ?? []);
  }

  async function fetchEleves(classeId: string) {
    const { data, error } = await supabase
      .from("eleves")
      .select("*")
      .eq("classe_id", classeId);
    if (error) setError(error.message);
    else setEleves(data ?? []);
  }

  async function fetchNotes(eleveId: string) {
    const { data, error } = await supabase
      .from("notes")
      .select("*")
      .eq("eleve_id", eleveId)
      .order("created_at", { ascending: false });

    if (error) {
      setError(error.message);
      return;
    }
    setNotesParEleve((prev) => ({ ...prev, [eleveId]: data ?? [] }));
  }

  function toggleEleve(eleveId: string) {
    if (eleveOuvert === eleveId) {
      setEleveOuvert(null);
      return;
    }
    setEleveOuvert(eleveId);
    setNouvelleValeur("");
    setNouvelleAppreciation("");
    setEditNoteId(null);
    fetchNotes(eleveId);
  }

  async function ajouterNote(eleveId: string) {
    const valeur = parseFloat(nouvelleValeur);

    if (Number.isNaN(valeur) || valeur < 0 || valeur > 20) {
      setError("La note doit être un nombre entre 0 et 20");
      return;
    }
    if (!nouvelleAppreciation.trim()) {
      setError("L'appréciation ne peut pas être vide");
      return;
    }

    const { error } = await supabase.from("notes").insert({
      eleve_id: eleveId,
      professeur_id: professeurId,
      classe_id: classeId,
      valeur,
      appreciation: nouvelleAppreciation,
    });

    if (error) {
      setError(error.message);
      return;
    }

    setError(null);
    setNouvelleValeur("");
    setNouvelleAppreciation("");
    fetchNotes(eleveId);
  }

  function commencerEditionNote(note: Note) {
    setEditNoteId(note.id);
    setEditValeur(String(note.valeur));
    setEditAppreciation(note.appreciation);
  }

  function annulerEditionNote() {
    setEditNoteId(null);
    setEditValeur("");
    setEditAppreciation("");
  }

  async function enregistrerEditionNote(eleveId: string, noteId: string) {
    const valeur = parseFloat(editValeur);

    if (Number.isNaN(valeur) || valeur < 0 || valeur > 20) {
      setError("La note doit être un nombre entre 0 et 20");
      return;
    }
    if (!editAppreciation.trim()) {
      setError("L'appréciation ne peut pas être vide");
      return;
    }

    const { error } = await supabase
      .from("notes")
      .update({ valeur, appreciation: editAppreciation })
      .eq("id", noteId);

    if (error) {
      setError(error.message);
      return;
    }

    setError(null);
    annulerEditionNote();
    fetchNotes(eleveId);
  }

  async function supprimerNote(eleveId: string, noteId: string) {
    const confirmation = window.confirm("Supprimer cette note ?");
    if (!confirmation) return;

    const { error } = await supabase.from("notes").delete().eq("id", noteId);

    if (error) {
      setError(error.message);
      return;
    }

    setError(null);
    fetchNotes(eleveId);
  }

  return (
    <div className="p-8 max-w-3xl mx-auto">
      <h1 className="text-2xl font-bold text-blue-900 mb-6">Mes classes</h1>

      {error && (
        <div className="mb-4 p-3 bg-red-100 text-red-700 rounded">
          {error}
        </div>
      )}

      <div className="mb-4">
        <label className="block text-sm font-medium mb-1">Professeur</label>
        <select
          className="w-full border rounded px-3 py-2"
          value={professeurId}
          onChange={(e) => setProfesseurId(e.target.value)}
        >
          <option value="">-- Sélectionner --</option>
          {professeurs.map((p) => (
            <option key={p.id} value={p.id}>
              {p.prenom} {p.nom}
            </option>
          ))}
        </select>
      </div>

      <div className="mb-8">
        <label className="block text-sm font-medium mb-1">Classe</label>
        <select
          className="w-full border rounded px-3 py-2"
          value={classeId}
          onChange={(e) => setClasseId(e.target.value)}
        >
          <option value="">-- Sélectionner --</option>
          {classes.map((c) => (
            <option key={c.id} value={c.id}>
              {c.nom}
            </option>
          ))}
        </select>
      </div>

      {classeId && (
        <div>
          <h2 className="font-semibold mb-3">Élèves de la classe</h2>
          <ul className="space-y-3">
            {eleves.map((eleve) => (
              <li key={eleve.id} className="border rounded p-4">
                <div className="flex items-center justify-between">
                  <p className="font-medium">
                    {eleve.prenom} {eleve.nom}
                  </p>
                  <button
                    onClick={() => toggleEleve(eleve.id)}
                    className="bg-blue-900 text-white px-3 py-1 rounded"
                  >
                    {eleveOuvert === eleve.id ? "Fermer" : "Ajouter une note"}
                  </button>
                </div>

                {eleveOuvert === eleve.id && (
                  <div className="mt-4 border-t pt-4">
                    {/* formulaire d'ajout */}
                    <div className="flex gap-3 items-end mb-4">
                      <div>
                        <label className="block text-xs mb-1">
                          Note / 20
                        </label>
                        <input
                          type="number"
                          min={0}
                          max={20}
                          step={0.25}
                          className="border rounded px-2 py-1 w-24"
                          value={nouvelleValeur}
                          onChange={(e) => setNouvelleValeur(e.target.value)}
                        />
                      </div>
                      <div className="flex-1">
                        <label className="block text-xs mb-1">
                          Appréciation
                        </label>
                        <input
                          className="border rounded px-2 py-1 w-full"
                          value={nouvelleAppreciation}
                          onChange={(e) =>
                            setNouvelleAppreciation(e.target.value)
                          }
                        />
                      </div>
                      <button
                        onClick={() => ajouterNote(eleve.id)}
                        className="bg-green-700 text-white px-3 py-1 rounded"
                      >
                        Ajouter
                      </button>
                    </div>

                    {/* liste des notes */}
                    <ul className="space-y-2">
                      {(notesParEleve[eleve.id] ?? []).map((note) => (
                        <li
                          key={note.id}
                          className="flex items-center justify-between bg-gray-50 rounded px-3 py-2"
                        >
                          {editNoteId === note.id ? (
                            <div className="flex-1 flex gap-3 items-center">
                              <input
                                type="number"
                                min={0}
                                max={20}
                                step={0.25}
                                className="border rounded px-2 py-1 w-20"
                                value={editValeur}
                                onChange={(e) =>
                                  setEditValeur(e.target.value)
                                }
                              />
                              <input
                                className="border rounded px-2 py-1 flex-1"
                                value={editAppreciation}
                                onChange={(e) =>
                                  setEditAppreciation(e.target.value)
                                }
                              />
                              <button
                                onClick={() =>
                                  enregistrerEditionNote(eleve.id, note.id)
                                }
                                className="bg-green-700 text-white px-2 py-1 rounded text-sm"
                              >
                                Enregistrer
                              </button>
                              <button
                                onClick={annulerEditionNote}
                                className="bg-gray-300 px-2 py-1 rounded text-sm"
                              >
                                Annuler
                              </button>
                            </div>
                          ) : (
                            <>
                              <div>
                                <span className="font-medium">
                                  {note.valeur}/20
                                </span>{" "}
                                — {note.appreciation}
                              </div>
                              <div className="flex gap-2">
                                <button
                                  onClick={() => commencerEditionNote(note)}
                                  className="bg-blue-700 text-white px-2 py-1 rounded text-sm"
                                >
                                  Modifier
                                </button>
                                <button
                                  onClick={() =>
                                    supprimerNote(eleve.id, note.id)
                                  }
                                  className="bg-red-700 text-white px-2 py-1 rounded text-sm"
                                >
                                  Supprimer
                                </button>
                              </div>
                            </>
                          )}
                        </li>
                      ))}
                      {(notesParEleve[eleve.id] ?? []).length === 0 && (
                        <p className="text-sm text-gray-500">
                          Aucune note pour le moment.
                        </p>
                      )}
                    </ul>
                  </div>
                )}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
