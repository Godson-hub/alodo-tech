"use client";

import { useState, useEffect } from "react";
import { supabase } from "../lib/supabase";

type Professeur = {
  id: number;
  nom: string;
  prenom: string;
  matiere: string;
};

export default function ProfesseursPage() {
  const [nom, setNom] = useState("");
  const [prenom, setPrenom] = useState("");
  const [matiere, setMatiere] = useState("");
  const [professeurs, setProfesseurs] = useState<Professeur[]>([]);
  const [erreur, setErreur] = useState<string | null>(null);

  // Récupère tous les professeurs depuis Supabase
  async function chargerProfesseurs() {
    const { data, error } = await supabase
      .from("professeurs")
      .select("*")
      .order("id", { ascending: true });

    if (error) {
      setErreur(error.message);
      return;
    }

    setProfesseurs(data || []);
  }

  // Charge la liste au premier affichage de la page
  useEffect(() => {
    chargerProfesseurs();
  }, []);

  // Gère l'envoi du formulaire
  async function gererEnvoi(e: React.FormEvent) {
    e.preventDefault();
    setErreur(null);

    // Cas limite : empêcher un formulaire vide
    if (!nom.trim() || !prenom.trim() || !matiere.trim()) {
      setErreur("Merci de remplir tous les champs.");
      return;
    }

    const { error } = await supabase
      .from("professeurs")
      .insert({ nom, prenom, matiere });

    if (error) {
      setErreur(error.message);
      return;
    }

    // Réinitialise le formulaire et recharge la liste
    setNom("");
    setPrenom("");
    setMatiere("");
    chargerProfesseurs();
  }

  return (
    <div style={{ padding: "2rem", maxWidth: "500px" }}>
      <h1>Gestion des professeurs</h1>

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
          <label>Matière</label>
          <br />
          <input
            type="text"
            value={matiere}
            onChange={(e) => setMatiere(e.target.value)}
            style={{ padding: "0.5rem", width: "100%" }}
          />
        </div>

        {erreur && <p style={{ color: "red" }}>{erreur}</p>}

        <button type="submit" style={{ padding: "0.5rem 1rem" }}>
          Ajouter le professeur
        </button>
      </form>

      <h2>Liste des professeurs</h2>
      <ul>
        {professeurs.map((prof) => (
          <li key={prof.id}>
            {prof.prenom} {prof.nom} — {prof.matiere}
          </li>
        ))}
      </ul>
    </div>
  );
}
