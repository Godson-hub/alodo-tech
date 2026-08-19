"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
} from "react";
import { supabase } from "../lib/supabase";
import { useRouter, usePathname } from "next/navigation";

type Role = "professeur" | "eleve" | null;

interface AuthContextValue {
  userId: string | null;
  role: Role;
  loading: boolean;
  isProfesseur: boolean;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue>({
  userId: null,
  role: null,
  loading: true,
  isProfesseur: false,
  signOut: async () => {},
});

export function AuthProvider({ children }: { children: ReactNode }) {
  const [userId, setUserId] = useState<string | null>(null);
  const [role, setRole] = useState<Role>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        setUserId(session.user.id);
        fetchRole(session.user.id);
      } else {
        setLoading(false);
      }
    });

    const { data: listener } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        if (session?.user) {
          setUserId(session.user.id);
          fetchRole(session.user.id);
        } else {
          setUserId(null);
          setRole(null);
          setLoading(false);
        }
      }
    );

    return () => {
      listener.subscription.unsubscribe();
    };
  }, []);

  // Surveille TOUTES les pages : si la personne n'est pas connectée
  // et qu'elle n'est pas déjà sur la page de connexion, on l'y envoie.
  useEffect(() => {
    if (!loading && !userId && pathname !== "/login") {
      router.push("/login");
    }
  }, [loading, userId, pathname, router]);

  async function fetchRole(id: string) {
    const { data, error } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", id)
      .single();

    if (!error && data) {
      setRole(data.role as Role);
    }
    setLoading(false);
  }

  async function signOut() {
    await supabase.auth.signOut();
    router.push("/login");
  }

  return (
    <AuthContext.Provider
      value={{
        userId,
        role,
        loading,
        isProfesseur: role === "professeur",
        signOut,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useRole() {
  return useContext(AuthContext);
}
