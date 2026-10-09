'use client';

import { useState, useEffect } from 'react';
import { RefreshCw, ArrowUpRight, CheckCircle2, XCircle, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { formatParis } from '@/lib/match-format';
import { toast } from 'sonner';

interface LastRun {
  status: string;
  conclusion: string | null;
  created_at: string;
  html_url: string;
}

export function SyncButton() {
  const [isSyncing, setIsSyncing] = useState(false);
  const [lastRun, setLastRun] = useState<LastRun | null>(null);

  // Charger le statut du dernier workflow au montage
  useEffect(() => {
    fetchLastRun();
  }, []);

  const fetchLastRun = async () => {
    try {
      const response = await fetch('/api/sync/matches');
      const data = await response.json();
      if (data.success && data.lastRun) {
        setLastRun(data.lastRun);
      }
    } catch {
      // Ignorer les erreurs silencieusement
    }
  };

  const handleSync = async () => {
    setIsSyncing(true);

    try {
      const response = await fetch('/api/sync/matches', {
        method: 'POST',
      });

      const data = await response.json();

      if (data.success) {
        toast.success('Synchronisation lancée ! Vérifiez GitHub Actions pour le statut.');
        // Attendre un peu puis rafraîchir le statut
        setTimeout(fetchLastRun, 5000);
      } else {
        toast.error(`Erreur: ${data.error || 'Impossible de lancer la synchronisation'}`);
      }
    } catch (error) {
      console.error('Erreur:', error);
      toast.error('Erreur lors du déclenchement de la synchronisation');
    } finally {
      setIsSyncing(false);
    }
  };

  const getStatus = () => {
    if (!lastRun) return null;
    if (lastRun.status === 'in_progress' || lastRun.status === 'queued') {
      return { icon: <Clock className="size-3.5 text-primary-600" />, label: 'en cours' };
    }
    if (lastRun.conclusion === 'success') {
      return { icon: <CheckCircle2 className="size-3.5 text-emerald-600" />, label: 'réussie' };
    }
    return { icon: <XCircle className="size-3.5 text-red-600" />, label: 'en échec' };
  };

  const status = getStatus();

  return (
    <div className="flex flex-wrap items-center gap-x-3 gap-y-2">
      {lastRun && status && (
        <a
          href={lastRun.html_url}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1.5 rounded-sm text-xs text-muted-foreground transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          title={`Dernière synchronisation ${status.label}`}
        >
          {status.icon}
          <span>
            Dernière sync. {formatParis(lastRun.created_at, { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' })}
          </span>
          <ArrowUpRight className="size-3" />
        </a>
      )}

      <Button
        type="button"
        onClick={handleSync}
        disabled={isSyncing}
        variant="outline"
        title="Importer les matchs de toutes les équipes depuis FFHANDBALL"
      >
        <RefreshCw className={isSyncing ? 'animate-spin' : undefined} />
        {isSyncing ? 'Lancement…' : 'Synchroniser FFHB'}
      </Button>
    </div>
  );
}
