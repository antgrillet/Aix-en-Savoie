"use client";

import { useState } from "react";
import { CalendrierAuth } from "@/components/calendrier/CalendrierAuth";
import { CalendrierGrid } from "@/components/calendrier/CalendrierGrid";
import { PageHero } from "@/components/site/PageHero";
import { container, siteButton } from "@/components/site/styles";
import { cn } from "@/lib/utils";
import { LogOut, RefreshCw } from "lucide-react";

function getInitialAuth() {
  if (typeof window === "undefined") return false;
  return sessionStorage.getItem("calendrier_auth") === "true";
}

export default function CalendrierPage() {
  const [isAuthenticated, setIsAuthenticated] = useState(getInitialAuth);
  const [isLoading, setIsLoading] = useState(false);

  const handleLogout = () => {
    sessionStorage.removeItem("calendrier_auth");
    setIsAuthenticated(false);
  };

  if (isLoading) {
    return (
      <div className="flex min-h-[70vh] items-center justify-center pt-18">
        <RefreshCw className="size-8 animate-spin text-primary-500" aria-label="Chargement" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      // Écran de mot de passe : plein écran, dégagé sous le header fixe
      <section className="relative isolate flex min-h-[85svh] items-center overflow-hidden bg-neutral-950 pb-20 pt-32 md:pb-28 md:pt-40">
        <div aria-hidden className="absolute inset-0 -z-10 bg-stripes" />
        <div aria-hidden className="absolute inset-0 -z-10 bg-gradient-to-b from-neutral-900/80 via-neutral-950/40 to-neutral-950" />
        <div className={container}>
          <CalendrierAuth onSuccess={() => setIsAuthenticated(true)} />
        </div>
      </section>
    );
  }

  return (
    <>
      <PageHero
        eyebrow="Bénévoles"
        title="Espace bénévoles"
        description="Inscrivez-vous pour aider lors des matchs à domicile : table de marque, arbitrage, responsable de salle ou buvette."
      >
        <button
          type="button"
          onClick={handleLogout}
          className={cn(siteButton({ variant: "outline", size: "sm" }), "h-10")}
        >
          <LogOut />
          Se déconnecter
        </button>
      </PageHero>

      <section className="py-12 md:py-16">
        <div className={container}>
          <CalendrierGrid />
        </div>
      </section>
    </>
  );
}
