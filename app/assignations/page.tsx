"use client";

import { useEffect, useState } from "react";
import { supabase } from "../lib/supabase";
import { useRole } from "../lib/AuthContext";

interface Professeur {
  id: number;
  nom: string;
  prenom: string;
}

interface Classe {
  id: number;
  nom: string;
}

interface Assignation {
  id: number;
  professeur_id: number;
  classe_id: number;
}

export default function AssignationsPage() {
  const { isProfesseur } = useRole();

  const [professeurs, setProfesseurs] = useState<Professeur[]>([]);
  const [classes, setClasses] = useState<Classe[]>([]);
  const [assignations, setAssignations] = useState<Assignation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [professeurId, setProfesseurId] = useState("");
  const [classeId, setClasseId] = useState("");

  useEffect(() => {
    fetchTout();
  }, []);

  async function fetchTout() {
    setLoading(true);
    const [profRes, classeRes, assignRes] = await Promise.all([
      supabase.from("professeurs").select("*").order("nom"),
      supabase.from("classes").select("*").order("nom"),
      supabase.from("assignations").select("*"),
    ]);

    if (profRes.error) setError(profRes.error.message);
    else setProfesseurs(profRes.data ?? []);

    if (classeRes.error) setError(classeRes.error.message);
    else setClasses(classeRes.data ?? []);

    if (assignRes.error) setError(assignRes.error.message);
    else setAssignations(assignRes.data ?? []);

    setLoading(false);
  }

  function nomProfesseur(id: number) {
    const p = professeurs.find((p) => p.id === id);
    return p ? `${p.prenom} ${p.nom}` : "—";
  }

  function nomClasse(id: number) {
    return classes.find((c) => c.id === id)?.nom ?? "—";
  }

  async function ajouterAssignation(e: React.FormEvent) {
    e.preventDefault();
    if (!professeurId || !classeId) {
      setError("Sélectionne un professeur et une classe");
      return;
    }

    const doublon = assignations.some(
      (a) =>
        a.professeur_id === Number(professeurId) &&
        a.classe_id === Number(classeId)
    );
    if (doublon) {
      setError("Ce professeur est déjà assigné à cette classe");
      return;
    }

    const { error } = await supabase.from("assignations").insert({
      professeur_id: Number(professeurId),
      classe_id: Number(classeId),
    });

    if (error) {
      setError(error.message);
      return;
    }

    setProfesseurId("");
    setClasseId("");
    setError(null);
    fetchTout();
  }

  async function supprimerAssignation(id: number) {
    const confirmation = window.confirm("Retirer cette assignation ?");
    if (!confirmation) return;

    const { error } = await supabase
      .from("assignations")
      .delete()
      .eq("id", id);

    if (error) {
      setError(error.message);
      return;
    }

    setError(null);
    fetchTout();
  }

  return (
    <div className="p-8 max-w-3xl mx-auto">
      <h1 className="text-2xl font-bold text-blue-900 mb-6">Assignations</h1>

      {error && (
        <div className="mb-4 p-3 bg-red-100 text-red-700 rounded">
          {error}
        </div>
      )}

      {isProfesseur && (
        <form
          onSubmit={ajouterAssignation}
          className="mb-8 p-4 border rounded flex gap-4 items-end flex-wrap"
        >
          <div className="flex-1 min-w-[150px]">
            <label className="block text-sm font-medium mb-1">
              Professeur
            </label>
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
          <div className="flex-1 min-w-[150px]">
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
          <button
            type="submit"
            className="bg-blue-900 text-white px-4 py-2 rounded"
          >
            Assigner
          </button>
        </form>
      )}

      {loading ? (
        <p>Chargement...</p>
      ) : (
        <ul className="space-y-3">
          {assignations.map((a) => (
            <li
              key={a.id}
              className="p-4 border rounded flex items-center justify-between"
            >
              <p>
                <span className="font-medium">
                  {nomProfesseur(a.professeur_id)}
                </span>{" "}
                — {nomClasse(a.classe_id)}
              </p>
              {isProfesseur && (
                <button
                  onClick={() => supprimerAssignation(a.id)}
                  className="bg-red-700 text-white px-3 py-1 rounded"
                >
                  Retirer
                </button>
              )}
            </li>
          ))}
          {assignations.length === 0 && (
            <p className="text-sm text-gray-500">
              Aucune assignation pour le moment.
            </p>
          )}
        </ul>
      )}
    </div>
  );
}
