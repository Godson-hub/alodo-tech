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

  // Charge la liste des classes (pour le menu déroulant)
  async function chargerClasses() {
    const { data } = await supabase
      .from("classes")
      .select("*")
      .order("nom", { ascending: true });

    setClasses(data || []);
  }

  // Charge la liste des élèves, avec le nom de leur classe
  async function chargerEleves() {
    const { data, error } = await supabase
      .from("eleves")
      .select("*, classes(nom)")
      .order("id", { ascending: true });

    if (error) {
      setErreur(error.message);
      return;
    }

    setEleves(data || []);
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
    <div style={{ padding: "2rem", maxWidth: "500px" }}>
      <h1>Gestion des élèves</h1>

      {classes.length === 0 && (
        <p style={{ color: "orange" }}>
          Aucune classe trouvée. Crée d'abord une classe sur la page /classes.
        </p>
      )}

      <form onSubmit={gererEnvoi} style={{ marginBottom: "2rem" }}>
        <div style={{ marginBottom: "1rem" }}>
          <label>Nom</label>
          <br />
          <input
            type="text"
            value={nom}
            onChange={(e) => setNom(e.target.value)}
            style={{ padding: "0.5rem", width: "100%" }}
          />
        </div>

        <div style={{ marginBottom: "1rem" }}>
          <label>Prénom</label>
          <br />
          <input
            type="text"
            value={prenom}
            onChange={(e) => setPrenom(e.target.value)}
            style={{ padding: "0.5rem", width: "100%" }}
          />
        </div>

        <div style={{ marginBottom: "1rem" }}>
          <label>Classe</label>
          <br />
          <select
            value={classeId}
            onChange={(e) => setClasseId(e.target.value)}
            style={{ padding: "0.5rem", width: "100%" }}
          >
            <option value="">-- Choisir une classe --</option>
            {classes.map((classe) => (
              <option key={classe.id} value={classe.id}>
                {classe.nom}
              </option>
            ))}
          </select>
        </div>

        {erreur && <p style={{ color: "red" }}>{erreur}</p>}

        <button type="submit" style={{ padding: "0.5rem 1rem" }}>
          Ajouter l'élève
        </button>
      </form>

      <h2>Liste des élèves</h2>
      <ul>
        {eleves.map((eleve) => (
          <li key={eleve.id}>
            {eleve.prenom} {eleve.nom} — {eleve.classes?.nom ?? "Classe inconnue"}
          </li>
        ))}
      </ul>
    </div>
  );
}
