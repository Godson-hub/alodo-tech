"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { supabase } from "./lib/supabase";

export default function Home() {
  const [stats, setStats] = useState({
    professeurs: 0,
    classes: 0,
    eleves: 0,
    notes: 0,
  });
  const [chargement, setChargement] = useState(true);

  useEffect(() => {
    async function chargerStats() {
      const [profs, classes, eleves, notes] = await Promise.all([
        supabase.from("professeurs").select("*", { count: "exact", head: true }),
        supabase.from("classes").select("*", { count: "exact", head: true }),
        supabase.from("eleves").select("*", { count: "exact", head: true }),
        supabase.from("notes").select("*", { count: "exact", head: true }),
      ]);

      setStats({
        professeurs: profs.count || 0,
        classes: classes.count || 0,
        eleves: eleves.count || 0,
        notes: notes.count || 0,
      });
      setChargement(false);
    }

    chargerStats();
  }, []);

  const cartes = [
    {
      titre: "Professeurs",
      valeur: stats.professeurs,
      lien: "/professeurs",
      couleur: "bg-blue-50 text-blue-900",
      icone: "👨‍🏫",
    },
    {
      titre: "Classes",
      valeur: stats.classes,
      lien: "/classes",
      couleur: "bg-purple-50 text-purple-900",
      icone: "🏫",
    },
    {
      titre: "Élèves",
      valeur: stats.eleves,
      lien: "/eleves",
      couleur: "bg-green-50 text-green-900",
      icone: "🎒",
    },
    {
      titre: "Notes enregistrées",
      valeur: stats.notes,
      lien: "/mes-classes",
      couleur: "bg-orange-50 text-orange-900",
      icone: "📝",
    },
  ];

  return (
    <div className="max-w-5xl mx-auto px-4 py-10">
      <div className="text-center mb-10">
        <h1 className="text-3xl font-bold text-blue-900 mb-2">
          🎓 Bienvenue sur Scolario
        </h1>
        <p className="text-gray-500">
          Plateforme de gestion scolaire — professeurs, classes, élèves et
          notes
        </p>
      </div>

      {chargement ? (
        <p className="text-center text-gray-400">Chargement du tableau de bord...</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-12">
          {cartes.map((carte) => (
            <Link
              key={carte.titre}
              href={carte.lien}
              className={`rounded-xl p-6 ${carte.couleur} hover:scale-105 transition-transform shadow-sm`}
            >
              <div className="text-3xl mb-2">{carte.icone}</div>
              <div className="text-3xl font-bold">{carte.valeur}</div>
              <div className="text-sm font-medium mt-1">{carte.titre}</div>
            </Link>
          ))}
        </div>
      )}

      <div className="bg-white rounded-xl shadow p-6">
        <h2 className="text-lg font-semibold text-gray-800 mb-4">
          Démarrage rapide
        </h2>
        <ol className="space-y-2 text-gray-600 list-decimal list-inside">
          <li>
            Crée une{" "}
            <Link href="/classes" className="text-blue-700 underline">
              classe
            </Link>{" "}
            (ex : 6ème A)
          </li>
          <li>
            Ajoute des{" "}
            <Link href="/professeurs" className="text-blue-700 underline">
              professeurs
            </Link>{" "}
            et des{" "}
            <Link href="/eleves" className="text-blue-700 underline">
              élèves
            </Link>
          </li>
          <li>
            Assigne chaque professeur à une classe dans{" "}
            <Link href="/assignations" className="text-blue-700 underline">
              Assignations
            </Link>
          </li>
          <li>
            Rends-toi sur{" "}
            <Link href="/mes-classes" className="text-blue-700 underline">
              Mes classes
            </Link>{" "}
            pour ajouter des notes aux élèves
          </li>
        </ol>
      </div>
    </div>
  );
}
