"use client";

import { useEffect, useState } from "react";
import { supabase } from "../lib/supabase";
import { useRole } from "../lib/AuthContext";

interface Classe {
  id: number;
  nom: string;
  niveau: string;
}

export default function ClassesPage() {
  const { isProfesseur } = useRole();

  const [classes, setClasses] = useState<Classe[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [nom, setNom] = useState("");
  const [niveau, setNiveau] = useState("");

  const [editId, setEditId] = useState<number | null>(null);
  const [editNom, setEditNom] = useState("");
  const [editNiveau, setEditNiveau] = useState("");

  useEffect(() => {
    fetchClasses();
  }, []);

  async function fetchClasses() {
    setLoading(true);
    const { data, error } = await supabase
      .from("classes")
      .select("*")
      .order("nom", { ascending: true });

    if (error) setError(error.message);
    else setClasses(data ?? []);
    setLoading(false);
  }

  async function ajouterClasse(e: React.FormEvent) {
    e.preventDefault();
    if (!nom.trim() || !niveau.trim()) {
      setError("Le nom et le niveau sont obligatoires");
      return;
    }

    const { error } = await supabase.from("classes").insert({ nom, niveau });

    if (error) {
      setError(error.message);
      return;
    }

    setNom("");
    setNiveau("");
    setError(null);
    fetchClasses();
  }

  function commencerEdition(classe: Classe) {
    setEditId(classe.id);
    setEditNom(classe.nom);
    setEditNiveau(classe.niveau);
  }

  function annulerEdition() {
    setEditId(null);
    setEditNom("");
    setEditNiveau("");
  }

  async function enregistrerEdition(id: number) {
    if (!editNom.trim() || !editNiveau.trim()) {
      setError("Le nom et le niveau sont obligatoires");
      return;
    }

    const { error } = await supabase
      .from("classes")
      .update({ nom: editNom, niveau: editNiveau })
      .eq("id", id);

    if (error) {
      setError(error.message);
      return;
    }

    setError(null);
    annulerEdition();
    fetchClasses();
  }

  async function supprimerClasse(id: number) {
    const confirmation = window.confirm(
      "Supprimer cette classe ? Les élèves, assignations et notes liés seront aussi supprimés."
    );
    if (!confirmation) return;

    const { error } = await supabase.from("classes").delete().eq("id", id);

    if (error) {
      setError(error.message);
      return;
    }

    setError(null);
    fetchClasses();
  }

  return (
    <div className="p-8 max-w-3xl mx-auto">
      <h1 className="text-2xl font-bold text-blue-900 mb-6">Classes</h1>

      {error && (
        <div className="mb-4 p-3 bg-red-100 text-red-700 rounded">
          {error}
        </div>
      )}

      {isProfesseur && (
        <form
          onSubmit={ajouterClasse}
          className="mb-8 p-4 border rounded flex gap-4 items-end"
        >
          <div className="flex-1">
            <label className="block text-sm font-medium mb-1">Nom</label>
            <input
              className="w-full border rounded px-3 py-2"
              placeholder="ex: 5ème B"
              value={nom}
              onChange={(e) => setNom(e.target.value)}
            />
          </div>
          <div className="flex-1">
            <label className="block text-sm font-medium mb-1">Niveau</label>
            <input
              className="w-full border rounded px-3 py-2"
              placeholder="ex: Collège"
              value={niveau}
              onChange={(e) => setNiveau(e.target.value)}
            />
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
          {classes.map((classe) => (
            <li
              key={classe.id}
              className="p-4 border rounded flex items-center justify-between"
            >
              {editId === classe.id ? (
                <div className="flex-1 flex gap-3 items-center">
                  <input
                    className="border rounded px-2 py-1 flex-1"
                    value={editNom}
                    onChange={(e) => setEditNom(e.target.value)}
                  />
                  <input
                    className="border rounded px-2 py-1 flex-1"
                    value={editNiveau}
                    onChange={(e) => setEditNiveau(e.target.value)}
                  />
                  <button
                    onClick={() => enregistrerEdition(classe.id)}
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
                    <p className="font-medium">{classe.nom}</p>
                    <p className="text-sm text-gray-500">{classe.niveau}</p>
                  </div>
                  {isProfesseur && (
                    <div className="flex gap-2">
                      <button
                        onClick={() => commencerEdition(classe)}
                        className="bg-blue-700 text-white px-3 py-1 rounded"
                      >
                        Modifier
                      </button>
                      <button
                        onClick={() => supprimerClasse(classe.id)}
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
