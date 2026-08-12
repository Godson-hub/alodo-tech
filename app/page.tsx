"use client";

import { useState, useEffect } from "react";
import { supabase } from "./lib/supabase";

export default function Home() {
  const [professeurs, setProfesseurs] = useState<any[]>([]);
  const [erreur, setErreur] = useState<string | null>(null);

  useEffect(() => {
    async function chargerProfesseurs() {
      const { data, error } = await supabase.from("professeurs").select("*");

      if (error) {
        setErreur(error.message);
        return;
      }

      setProfesseurs(data || []);
    }

    chargerProfesseurs();
  }, []);

  return (
    <div style={{ padding: "2rem" }}>
      <h1>Test de connexion Supabase</h1>

      {erreur && <p style={{ color: "red" }}>Erreur : {erreur}</p>}

      {!erreur && (
        <p>
          Connexion réussie ! Nombre de professeurs trouvés :{" "}
          {professeurs.length}
        </p>
      )}
    </div>
  );
}
