"use client";

import { useState, useEffect } from "react";
import { CalendrierAuth } from "@/components/calendrier/CalendrierAuth";
import { CalendrierGrid } from "@/components/calendrier/CalendrierGrid";
import { Button } from "@/components/ui/button";
import { LogOut } from "lucide-react";

export default function CalendrierPage() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Vérifier si l'utilisateur est déjà authentifié
    const auth = sessionStorage.getItem("calendrier_auth");
    setIsAuthenticated(auth === "true");
    setIsLoading(false);
  }, []);

  const handleLogout = () => {
    sessionStorage.removeItem("calendrier_auth");
    setIsAuthenticated(false);
  };

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-12">
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-12">
      {!isAuthenticated ? (
        <CalendrierAuth onSuccess={() => setIsAuthenticated(true)} />
      ) : (
        <div className="space-y-6">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold mb-2">
                Calendrier des matchs
              </h1>
              <p className="text-sm sm:text-base text-muted-foreground">
                Inscrivez-vous pour aider lors des matchs à domicile
              </p>
            </div>
            <Button variant="outline" onClick={handleLogout} className="w-full sm:w-auto">
              <LogOut className="h-4 w-4 mr-2" />
              Se déconnecter
            </Button>
          </div>

          <CalendrierGrid />
        </div>
      )}
    </div>
  );
}
