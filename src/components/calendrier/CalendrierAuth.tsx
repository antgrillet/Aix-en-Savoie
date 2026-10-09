"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { siteButton, siteCard } from "@/components/site/styles";
import { cn } from "@/lib/utils";
import { Loader2, Lock } from "lucide-react";
import { toast } from "sonner";

interface CalendrierAuthProps {
  onSuccess: () => void;
}

export function CalendrierAuth({ onSuccess }: CalendrierAuthProps) {
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await fetch("/api/calendrier/auth", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ password }),
      });

      if (response.ok) {
        // Stocker l'authentification dans sessionStorage
        sessionStorage.setItem("calendrier_auth", "true");
        toast.success("Connexion réussie !");
        onSuccess();
      } else {
        const data = await response.json();
        toast.error(data.error || "Mot de passe incorrect");
      }
    } catch (error) {
      console.error("Erreur:", error);
      toast.error("Erreur lors de la connexion");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={cn(siteCard, "mx-auto w-full max-w-md p-6 sm:p-8")}>
      <div className="flex flex-col items-center text-center">
        <div className="relative">
          <Image
            src="/img/home/logo.png"
            alt=""
            width={88}
            height={88}
            priority
            className="size-20 object-contain"
          />
          <span className="absolute -bottom-1 -right-3 flex size-8 items-center justify-center rounded-full border-2 border-neutral-900 bg-primary-500 text-neutral-950">
            <Lock className="size-3.5" />
          </span>
        </div>
        <p className="mt-6 font-eyebrow text-xs text-primary-400">Accès réservé</p>
        <h1 className="mt-2 font-headline text-4xl text-white">Espace bénévoles</h1>
        <p className="mt-3 text-sm text-neutral-400">
          Espace réservé aux bénévoles du club. Entrez le mot de passe pour vous inscrire aux
          créneaux des matchs à domicile.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="mt-8 space-y-5">
        <div>
          <Label htmlFor="password" className="text-sm font-medium text-neutral-200">
            Mot de passe
          </Label>
          <Input
            id="password"
            type="password"
            placeholder="Entrez le mot de passe"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            disabled={loading}
            className="mt-2 h-11 border-white/10 bg-neutral-950/60 text-base text-white shadow-none placeholder:text-neutral-500 focus-visible:border-primary-500 focus-visible:ring-2 focus-visible:ring-primary-500/40 md:text-sm"
          />
        </div>
        <button
          type="submit"
          disabled={loading}
          className={cn(siteButton({ size: "lg" }), "w-full focus-visible:ring-offset-neutral-900")}
        >
          {loading ? (
            <>
              <Loader2 className="animate-spin" />
              Connexion...
            </>
          ) : (
            "Se connecter"
          )}
        </button>
      </form>

      <p className="mt-8 border-t border-white/10 pt-5 text-center text-sm text-neutral-400">
        Les prochains matchs et résultats sont accessibles librement sur la{" "}
        <Link
          href="/equipes"
          className="rounded-sm font-medium text-primary-400 transition-colors hover:text-primary-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500"
        >
          page des équipes
        </Link>
        .
      </p>
    </div>
  );
}
