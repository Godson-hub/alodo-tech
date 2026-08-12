"use client";

import { useState, useEffect } from "react";
import { supabase } from "../lib/supabase";

type Classe = {
  id: number;
  nom: string;
};

export default function ClassesPage() {
  const [nom, setNom] = useState("");
  const [classes, setClasses] = useState<Classe[]>([]);
  const [erreur, setErreur] = useState<string | null>(null);

  async function chargerClasses() {
    const { data, error } = await supabase
      .from("classes")
      .select("*")
      .order("id", { ascending: true });

    if (error) {
      setErreur(error.message);
      return;
    }

    setClasses(data || []);
  }

  useEffect(() => {
    chargerClasses();
  }, []);

  async function gererEnvoi(e: React.FormEvent) {
    e.preventDefault();
    setErreur(null);

    if (!nom.trim()) {
      setErreur("Merci de renseigner un nom de classe.");
      return;
    }

    const { error } = await supabase.from("classes").insert({ nom });

    if (error) {
      setErreur(error.message);
      return;
    }

    setNom("");
    chargerClasses();
  }

  return (
    <div style={{ padding: "2rem", maxWidth: "500px" }}>
      <h1>Gestion des classes</h1>

      <form onSubmit={gererEnvoi} style={{ marginBottom: "2rem" }}>
        <div style={{ marginBottom: "1rem" }}>
          <label>Nom de la classe</label>
          <br />
          <input
            type="text"
            placeholder="ex : 6ème A"
            value={nom}
            onChange={(e) => setNom(e.target.value)}
            style={{ padding: "0.5rem", width: "100%" }}
          />
        </div>

        {erreur && <p style={{ color: "red" }}>{erreur}</p>}

        <button type="submit" style={{ padding: "0.5rem 1rem" }}>
          Ajouter la classe
        </button>
      </form>

      <h2>Liste des classes</h2>
      <ul>
        {classes.map((classe) => (
          <li key={classe.id}>{classe.nom}</li>
        ))}
      </ul>
    </div>
  );
}
