"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
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

type Eleve = {
  id: number;
  nom: string;
  prenom: string;
};

export default function MesClassesPage() {
  const [professeurs, setProfesseurs] = useState<Professeur[]>([]);
  const [professeurId, setProfesseurId] = useState("");
  const [classesDuProf, setClassesDuProf] = useState<Classe[]>([]);
  const [classeId, setClasseId] = useState("");
  const [eleves, setEleves] = useState<Eleve[]>([]);
  const [erreur, setErreur] = useState<string | null>(null);

  useEffect(() => {
    async function chargerProfesseurs() {
      const { data } = await supabase
        .from("professeurs")
        .select("*")
        .order("nom", { ascending: true });
      setProfesseurs(data || []);
    }
    chargerProfesseurs();
  }, []);

  // Quand on choisit un professeur, on va chercher ses classes assignées
  useEffect(() => {
    async function chargerClassesDuProf() {
      setClasseId("");
      setEleves([]);

      if (!professeurId) {
        setClassesDuProf([]);
        return;
      }

      const { data, error } = await supabase
        .from("professeurs_classes")
        .select("classes(id, nom)")
        .eq("professeur_id", professeurId);

      if (error) {
        setErreur(error.message);
        return;
      }

      const classes = (data || [])
        .map((row: any) => row.classes)
        .filter((c: any) => c !== null);

      setClassesDuProf(classes);
    }

    chargerClassesDuProf();
  }, [professeurId]);

  // Quand on choisit une classe, on va chercher ses élèves
  useEffect(() => {
    async function chargerEleves() {
      if (!classeId) {
        setEleves([]);
        return;
      }

      const { data, error } = await supabase
        .from("eleves")
        .select("*")
        .eq("classe_id", classeId)
        .order("nom", { ascending: true });

      if (error) {
        setErreur(error.message);
        return;
      }

      setEleves(data || []);
    }

    chargerEleves();
  }, [classeId]);

  return (
    <div style={{ padding: "2rem", maxWidth: "500px" }}>
      <h1>Mes classes</h1>

      {erreur && <p style={{ color: "red" }}>{erreur}</p>}

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

      {professeurId && classesDuProf.length === 0 && (
        <p style={{ color: "orange" }}>
          Ce professeur n'a pas encore de classe assignée.
        </p>
      )}

      {classesDuProf.length > 0 && (
        <div style={{ marginBottom: "1rem" }}>
          <label>Classe</label>
          <br />
          <select
            value={classeId}
            onChange={(e) => setClasseId(e.target.value)}
            style={{ padding: "0.5rem", width: "100%" }}
          >
            <option value="">-- Choisir une classe --</option>
            {classesDuProf.map((classe) => (
              <option key={classe.id} value={classe.id}>
                {classe.nom}
              </option>
            ))}
          </select>
        </div>
      )}

      {classeId && (
        <>
          <h2>Élèves de la classe</h2>
          {eleves.length === 0 && <p>Aucun élève dans cette classe.</p>}
          <ul>
            {eleves.map((eleve) => (
              <li key={eleve.id} style={{ marginBottom: "0.5rem" }}>
                {eleve.prenom} {eleve.nom} —{" "}
                <Link
                  href={`/notes?eleveId=${eleve.id}&professeurId=${professeurId}`}
                  style={{ color: "blue", textDecoration: "underline" }}
                >
                  Ajouter une note
                </Link>
              </li>
            ))}
          </ul>
        </>
      )}
    </div>
  );
}
