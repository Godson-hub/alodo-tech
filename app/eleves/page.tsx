"use client";

import { useEffect, useState } from "react";
import { supabase } from "../lib/supabase";
import { useRole } from "../lib/AuthContext";

interface Classe {
  id: number;
  nom: string;
}

interface Eleve {
  id: number;
  nom: string;
  prenom: string;
  classe_id: number;
}

export default function ElevesPage() {
  const { isProfesseur } = useRole();

  const [eleves, setEleves] = useState<Eleve[]>([]);
  const [classes, setClasses] = useState<Classe[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [nom, setNom] = useState("");
  const [prenom, setPrenom] = useState("");
  const [classeId, setClasseId] = useState<string>("");

  const [editId, setEditId] = useState<number | null>(null);
  const [editNom, setEditNom] = useState("");
  const [editPrenom, setEditPrenom] = useState("");
  const [editClasseId, setEditClasseId] = useState<string>("");

  useEffect(() => {
    fetchEleves();
    fetchClasses();
  }, []);

  async function fetchEleves() {
    setLoading(true);
    const { data, error } = await supabase
      .from("eleves")
      .select("*")
      .order("nom", { ascending: true });

    if (error) setError(error.message);
    else setEleves(data ?? []);
    setLoading(false);
  }

  async function fetchClasses() {
    const { data, error } = await supabase.from("classes").select("*");
    if (error) setError(error.message);
    else setClasses(data ?? []);
  }

  function nomClasse(classeId: number) {
    return classes.find((c) => c.id === classeId)?.nom ?? "—";
  }

  async function ajouterEleve(e: React.FormEvent) {
    e.preventDefault();
    if (!nom.trim() || !prenom.trim() || !classeId) {
      setError("Tous les champs sont obligatoires");
      return;
    }

    const { error } = await supabase
      .from("eleves")
      .insert({ nom, prenom, classe_id: Number(classeId) });

    if (error) {
      setError(error.message);
      return;
    }

    setNom("");
    setPrenom("");
    setClasseId("");
    setError(null);
    fetchEleves();
  }

  function commencerEdition(eleve: Eleve) {
    setEditId(eleve.id);
    setEditNom(eleve.nom);
    setEditPrenom(eleve.prenom);
    setEditClasseId(String(eleve.classe_id));
  }

  function annulerEdition() {
    setEditId(null);
    setEditNom("");
    setEditPrenom("");
    setEditClasseId("");
  }

  async function enregistrerEdition(id: number) {
    if (!editNom.trim() || !editPrenom.trim() || !editClasseId) {
      setError("Tous les champs sont obligatoires");
      return;
    }

    const { error } = await supabase
      .from("eleves")
      .update({
        nom: editNom,
        prenom: editPrenom,
        classe_id: Number(editClasseId),
      })
      .eq("id", id);

    if (error) {
      setError(error.message);
      return;
    }

    setError(null);
    annulerEdition();
    fetchEleves();
  }

  async function supprimerEleve(id: number) {
    const confirmation = window.confirm(
      "Supprimer cet élève ? Ses notes seront aussi supprimées."
    );
    if (!confirmation) return;

    const { error } = await supabase.from("eleves").delete().eq("id", id);

    if (error) {
      setError(error.message);
      return;
    }

    setError(null);
    fetchEleves();
  }

  return (
    <div className="p-8 max-w-3xl mx-auto">
      <h1 className="text-2xl font-bold text-blue-900 mb-6">Élèves</h1>

      {error && (
        <div className="mb-4 p-3 bg-red-100 text-red-700 rounded">
          {error}
        </div>
      )}

      {isProfesseur && (
        <form
          onSubmit={ajouterEleve}
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
            Ajouter
          </button>
        </form>
      )}

      {loading ? (
        <p>Chargement...</p>
      ) : (
        <ul className="space-y-3">
          {eleves.map((eleve) => (
            <li
              key={eleve.id}
              className="p-4 border rounded flex items-center justify-between"
            >
              {editId === eleve.id ? (
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
                  <select
                    className="border rounded px-2 py-1 flex-1 min-w-[100px]"
                    value={editClasseId}
                    onChange={(e) => setEditClasseId(e.target.value)}
                  >
                    {classes.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.nom}
                      </option>
                    ))}
                  </select>
                  <button
                    onClick={() => enregistrerEdition(eleve.id)}
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
                      {eleve.prenom} {eleve.nom}
                    </p>
                    <p className="text-sm text-gray-500">
                      {nomClasse(eleve.classe_id)}
                    </p>
                  </div>
                  {isProfesseur && (
                    <div className="flex gap-2">
                      <button
                        onClick={() => commencerEdition(eleve)}
                        className="bg-blue-700 text-white px-3 py-1 rounded"
                      >
                        Modifier
                      </button>
                      <button
                        onClick={() => supprimerEleve(eleve.id)}
                        className="bg-red-700 text-white px-3 py-1 rounded"
                      >
                        Supprimer
                      </button>
                    </div>
                  )}
                </>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
