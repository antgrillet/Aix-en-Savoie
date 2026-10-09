"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { LoadingButton } from "@/components/admin/LoadingButton";
import { Check, CircleAlert, Eye, EyeOff } from "lucide-react";
import { toast } from "sonner";
import { updateCalendrierPassword } from "./actions";

interface CalendrierPasswordFormProps {
  initialPassword: string;
}

export function CalendrierPasswordForm({
  initialPassword,
}: CalendrierPasswordFormProps) {
  const [password, setPassword] = useState(initialPassword);
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  // Retour visuel affiché sous le champ
  const [status, setStatus] = useState<{ type: "success" | "error"; message: string } | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setStatus(null);

    try {
      const formData = new FormData();
      formData.append("password", password);

      await updateCalendrierPassword(formData);
      toast.success("Mot de passe mis à jour avec succès");
      setStatus({ type: "success", message: "Mot de passe enregistré" });
    } catch (error: any) {
      console.error("Erreur:", error);
      toast.error(error.message || "Erreur lors de la mise à jour");
      setStatus({ type: "error", message: error.message || "Erreur lors de la mise à jour" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="max-w-xl space-y-2">
      <Label htmlFor="password">Mot de passe du calendrier</Label>
      <div className="flex flex-col gap-2 sm:flex-row">
        <div className="relative flex-1">
          <Input
            id="password"
            type={showPassword ? "text" : "password"}
            placeholder="Entrez le mot de passe"
            value={password}
            onChange={(e) => {
              setPassword(e.target.value);
              setStatus(null);
            }}
            required
            disabled={loading}
            autoComplete="off"
            className="pr-11"
          />
          <button
            type="button"
            className="absolute inset-y-0 right-0 flex w-10 items-center justify-center rounded-r-md text-muted-foreground transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-ring disabled:opacity-50"
            onClick={() => setShowPassword(!showPassword)}
            disabled={loading}
            title={showPassword ? "Masquer le mot de passe" : "Afficher le mot de passe"}
          >
            {showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
            <span className="sr-only">{showPassword ? "Masquer le mot de passe" : "Afficher le mot de passe"}</span>
          </button>
        </div>
        <LoadingButton type="submit" isLoading={loading} disabled={!password}>
          {loading ? "Enregistrement..." : "Enregistrer"}
        </LoadingButton>
      </div>
      {status ? (
        <p
          role="status"
          className={
            status.type === "success"
              ? "flex items-center gap-1.5 text-xs font-medium text-emerald-700"
              : "flex items-center gap-1.5 text-xs font-medium text-red-600"
          }
        >
          {status.type === "success" ? <Check className="size-3.5" /> : <CircleAlert className="size-3.5" />}
          {status.message}
        </p>
      ) : (
        <p className="text-xs text-muted-foreground">
          Mot de passe unique partagé par tous les bénévoles pour accéder au calendrier et s&apos;inscrire aux matchs.
        </p>
      )}
    </form>
  );
}
