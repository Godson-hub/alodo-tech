"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

interface Professeur {
  id: number;
  nom: string;
  prenom: string;
  matiere: string;
}

export default function ProfesseursPage() {
  const [professeurs, setProfesseurs] = useState<Professeur[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // formulaire de création
  const [nom, setNom] = useState("");
  const [prenom, setPrenom] = useState("");
  const [matiere, setMatiere] = useState("");

  // édition en cours
  const [editId, setEditId] = useState<number | null>(null);
  const [editNom, setEditNom] = useState("");
  const [editPrenom, setEditPrenom] = useState("");
  const [editMatiere, setEditMatiere] = useState("");

  useEffect(() => {
    fetchProfesseurs();
  }, []);

  async function fetchProfesseurs() {
    setLoading(true);
    const { data, error } = await supabase
      .from("professeurs")
      .select("*")
      .order("nom", { ascending: true });

    if (error) setError(error.message);
    else setProfesseurs(data ?? []);
    setLoading(false);
  }

  async function ajouterProfesseur(e: React.FormEvent) {
    e.preventDefault();
    if (!nom.trim() || !prenom.trim() || !matiere.trim()) {
      setError("Tous les champs sont obligatoires");
      return;
    }

    const { error } = await supabase
      .from("professeurs")
      .insert({ nom, prenom, matiere });

    if (error) {
      setError(error.message);
      return;
    }

    setNom("");
    setPrenom("");
    setMatiere("");
    setError(null);
    fetchProfesseurs();
  }

  function commencerEdition(prof: Professeur) {
    setEditId(prof.id);
    setEditNom(prof.nom);
    setEditPrenom(prof.prenom);
    setEditMatiere(prof.matiere);
  }

  function annulerEdition() {
    setEditId(null);
    setEditNom("");
    setEditPrenom("");
    setEditMatiere("");
  }

  async function enregistrerEdition(id: number) {
    if (!editNom.trim() || !editPrenom.trim() || !editMatiere.trim()) {
      setError("Tous les champs sont obligatoires");
      return;
    }

    const { error } = await supabase
      .from("professeurs")
      .update({ nom: editNom, prenom: editPrenom, matiere: editMatiere })
      .eq("id", id);

    if (error) {
      setError(error.message);
      return;
    }

    setError(null);
    annulerEdition();
    fetchProfesseurs();
  }

  async function supprimerProfesseur(id: number) {
    const confirmation = window.confirm(
      "Supprimer ce professeur ? Ses assignations seront aussi supprimées."
    );
    if (!confirmation) return;

    const { error } = await supabase
      .from("professeurs")
      .delete()
      .eq("id", id);

    if (error) {
      setError(error.message);
      return;
    }

    setError(null);
    fetchProfesseurs();
  }

  return (
    <div className="p-8 max-w-3xl mx-auto">
      <h1 className="text-2xl font-bold text-blue-900 mb-6">Professeurs</h1>

      {error && (
        <div className="mb-4 p-3 bg-red-100 text-red-700 rounded">
          {error}
        </div>
      )}

      <form
        onSubmit={ajouterProfesseur}
        className="mb-8 p-4 border rounded flex gap-4 items-end flex-wrap"
      >
        <div className="flex-1 min-w-[150px]">
          <label className="block text-sm font-medium mb-1">Nom</label>
          <input
            className="w-full border rounded px-3 py-2"
            value={nom}
            onChange={(e) => setNom(e.target.value)}
          />
        </div>
        <div className="flex-1 min-w-[150px]">
          <label className="block text-sm font-medium mb-1">Prénom</label>
          <input
            className="w-full border rounded px-3 py-2"
            value={prenom}
            onChange={(e) => setPrenom(e.target.value)}
          />
        </div>
        <div className="flex-1 min-w-[150px]">
          <label className="block text-sm font-medium mb-1">Matière</label>
          <input
            className="w-full border rounded px-3 py-2"
            value={matiere}
            onChange={(e) => setMatiere(e.target.value)}
          />
        </div>
        <button
          type="submit"
          className="bg-blue-900 text-white px-4 py-2 rounded"
        >
          Ajouter
        </button>
      </form>

      {loading ? (
        <p>Chargement...</p>
      ) : (
        <ul className="space-y-3">
          {professeurs.map((prof) => (
            <li
              key={prof.id}
              className="p-4 border rounded flex items-center justify-between"
            >
              {editId === prof.id ? (
                <div className="flex-1 flex gap-3 items-center flex-wrap">
                  <input
                    className="border rounded px-2 py-1 flex-1 min-w-[100px]"
                    value={editNom}
                    onChange={(e) => setEditNom(e.target.value)}
                  />
                  <input
                    className="border rounded px-2 py-1 flex-1 min-w-[100px]"
                    value={editPrenom}
                    onChange={(e) => setEditPrenom(e.target.value)}
                  />
                  <input
                    className="border rounded px-2 py-1 flex-1 min-w-[100px]"
                    value={editMatiere}
                    onChange={(e) => setEditMatiere(e.target.value)}
                  />
                  <button
                    onClick={() => enregistrerEdition(prof.id)}
                    className="bg-green-700 text-white px-3 py-1 rounded"
                  >
                    Enregistrer
                  </button>
                  <button
                    onClick={annulerEdition}
                    className="bg-gray-300 px-3 py-1 rounded"
                  >
                    Annuler
                  </button>
                </div>
              ) : (
                <>
                  <div>
                    <p className="font-medium">
                      {prof.prenom} {prof.nom}
                    </p>
                    <p className="text-sm text-gray-500">{prof.matiere}</p>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => commencerEdition(prof)}
                      className="bg-blue-700 text-white px-3 py-1 rounded"
                    >
                      Modifier
                    </button>
                    <button
                      onClick={() => supprimerProfesseur(prof.id)}
                      className="bg-red-700 text-white px-3 py-1 rounded"
                    >
                      Supprimer
                    </button>
                  </div>
                </>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
