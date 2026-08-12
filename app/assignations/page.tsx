"use client";

import { useState, useEffect } from "react";
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

type Assignation = {
  id: number;
  professeurs: { nom: string; prenom: string } | null;
  classes: { nom: string } | null;
};

export default function AssignationsPage() {
  const [professeurId, setProfesseurId] = useState("");
  const [classeId, setClasseId] = useState("");
  const [professeurs, setProfesseurs] = useState<Professeur[]>([]);
  const [classes, setClasses] = useState<Classe[]>([]);
  const [assignations, setAssignations] = useState<Assignation[]>([]);
  const [erreur, setErreur] = useState<string | null>(null);

  async function chargerProfesseurs() {
    const { data } = await supabase
      .from("professeurs")
      .select("*")
      .order("nom", { ascending: true });
    setProfesseurs(data || []);
  }

  async function chargerClasses() {
    const { data } = await supabase
      .from("classes")
      .select("*")
      .order("nom", { ascending: true });
    setClasses(data || []);
  }

  async function chargerAssignations() {
    const { data, error } = await supabase
      .from("professeurs_classes")
      .select("*, professeurs(nom, prenom), classes(nom)")
      .order("id", { ascending: true });

    if (error) {
      setErreur(error.message);
      return;
    }

    setAssignations(data || []);
  }

  useEffect(() => {
    chargerProfesseurs();
    chargerClasses();
    chargerAssignations();
  }, []);

  async function gererEnvoi(e: React.FormEvent) {
    e.preventDefault();
    setErreur(null);

    if (!professeurId || !classeId) {
      setErreur("Merci de choisir un professeur et une classe.");
      return;
    }

    const { error } = await supabase.from("professeurs_classes").insert({
      professeur_id: Number(professeurId),
      classe_id: Number(classeId),
    });

    if (error) {
      setErreur(error.message);
      return;
    }

    setProfesseurId("");
    setClasseId("");
    chargerAssignations();
  }

  return (
    <div style={{ padding: "2rem", maxWidth: "500px" }}>
      <h1>Assigner un professeur à une classe</h1>

      {(professeurs.length === 0 || classes.length === 0) && (
        <p style={{ color: "orange" }}>
          Crée d'abord au moins un professeur et une classe avant de faire une
          assignation.
        </p>
      )}

      <form onSubmit={gererEnvoi} style={{ marginBottom: "2rem" }}>
        <div style={{ marginBottom: "1rem" }}>
          <label>Professeur</label>
          <br />
          <select
            value={professeurId}
            onChange={(e) => setProfesseurId(e.target.value)}
            style={{ padding: "0.5rem", width: "100%" }}
          >
            <option value="">-- Choisir un professeur --</option>
            {professeurs.map((prof) => (
              <option key={prof.id} value={prof.id}>
                {prof.prenom} {prof.nom}
              </option>
            ))}
          </select>
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
          Assigner
        </button>
      </form>

      <h2>Assignations existantes</h2>
      <ul>
        {assignations.map((a) => (
          <li key={a.id}>
            {a.professeurs?.prenom} {a.professeurs?.nom} → {a.classes?.nom}
          </li>
        ))}
      </ul>
    </div>
  );
}
