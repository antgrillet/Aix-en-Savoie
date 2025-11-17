"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { Clipboard, Shield, Users, Coffee } from "lucide-react";

interface InscriptionFormProps {
  matchId: number;
  stats: {
    tableDeMarque: number;
    arbitre: number;
    responsableSalle: number;
    buvette: number;
  };
  onSuccess: () => void;
}

const ROLES = [
  {
    value: "TABLE_DE_MARQUE",
    label: "Table de marque",
    icon: Clipboard,
    max: 2,
  },
  { value: "ARBITRE", label: "Arbitre", icon: Shield, max: 2 },
  {
    value: "RESPONSABLE_SALLE",
    label: "Responsable de salle",
    icon: Users,
    max: 1,
  },
  { value: "BUVETTE", label: "Buvette", icon: Coffee, max: null },
];

export function InscriptionForm({
  matchId,
  stats,
  onSuccess,
}: InscriptionFormProps) {
  const [nom, setNom] = useState("");
  const [prenom, setPrenom] = useState("");
  const [role, setRole] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await fetch("/api/calendrier/inscriptions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          matchId,
          nom: nom.trim(),
          prenom: prenom.trim(),
          role,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        toast.success("Inscription réussie !");
        setNom("");
        setPrenom("");
        setRole("");
        onSuccess();
      } else {
        toast.error(data.error || "Erreur lors de l'inscription");
      }
    } catch (error) {
      console.error("Erreur:", error);
      toast.error("Erreur lors de l'inscription");
    } finally {
      setLoading(false);
    }
  };

  // Vérifier si un rôle est complet
  const isRoleFull = (roleValue: string, max: number | null) => {
    if (max === null) return false;
    const statsKey = roleValue.toLowerCase().replace(/_/g, "") as
      | "tableDeMarque"
      | "arbitre"
      | "responsableSalle"
      | "buvette";
    const statsMapping: Record<string, keyof typeof stats> = {
      TABLE_DE_MARQUE: "tableDeMarque",
      ARBITRE: "arbitre",
      RESPONSABLE_SALLE: "responsableSalle",
      BUVETTE: "buvette",
    };
    return stats[statsMapping[roleValue]] >= max;
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">S'inscrire pour ce match</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="prenom">Prénom *</Label>
              <Input
                id="prenom"
                type="text"
                placeholder="Prénom"
                value={prenom}
                onChange={(e) => setPrenom(e.target.value)}
                required
                disabled={loading}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="nom">Nom *</Label>
              <Input
                id="nom"
                type="text"
                placeholder="Nom"
                value={nom}
                onChange={(e) => setNom(e.target.value)}
                required
                disabled={loading}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="role">Rôle *</Label>
            <Select value={role} onValueChange={setRole} disabled={loading}>
              <SelectTrigger id="role">
                <SelectValue placeholder="Choisir un rôle" />
              </SelectTrigger>
              <SelectContent>
                {ROLES.map((r) => {
                  const Icon = r.icon;
                  const isFull = isRoleFull(r.value, r.max);
                  const statsMapping: Record<string, keyof typeof stats> = {
                    TABLE_DE_MARQUE: "tableDeMarque",
                    ARBITRE: "arbitre",
                    RESPONSABLE_SALLE: "responsableSalle",
                    BUVETTE: "buvette",
                  };
                  const count = stats[statsMapping[r.value]];

                  return (
                    <SelectItem
                      key={r.value}
                      value={r.value}
                      disabled={isFull}
                    >
                      <div className="flex items-center gap-2">
                        <Icon className="h-4 w-4" />
                        <span>{r.label}</span>
                        {r.max !== null && (
                          <span className="text-xs text-muted-foreground">
                            ({count}/{r.max})
                          </span>
                        )}
                        {isFull && (
                          <span className="text-xs text-red-500">(Complet)</span>
                        )}
                      </div>
                    </SelectItem>
                  );
                })}
              </SelectContent>
            </Select>
          </div>

          <Button type="submit" className="w-full" disabled={loading || !role}>
            {loading ? "Inscription..." : "S'inscrire"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
