'use client';

import { useState, useEffect } from 'react';
import { RefreshCw, ExternalLink, CheckCircle, XCircle, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
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

  const getStatusIcon = () => {
    if (!lastRun) return null;
    if (lastRun.status === 'in_progress' || lastRun.status === 'queued') {
      return <Clock className="w-4 h-4 text-yellow-500" />;
    }
    if (lastRun.conclusion === 'success') {
      return <CheckCircle className="w-4 h-4 text-green-500" />;
    }
    return <XCircle className="w-4 h-4 text-red-500" />;
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleString('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div className="flex items-center gap-3">
      <Button
        onClick={handleSync}
        disabled={isSyncing}
        variant="outline"
        className="border-primary-600 text-primary-600 hover:bg-primary-50"
      >
        <RefreshCw className={`w-4 h-4 mr-2 ${isSyncing ? 'animate-spin' : ''}`} />
        {isSyncing ? 'Lancement...' : 'Synchroniser'}
      </Button>

      {lastRun && (
        <a
          href={lastRun.html_url}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"
        >
          {getStatusIcon()}
          <span>Dernière sync: {formatDate(lastRun.created_at)}</span>
          <ExternalLink className="w-3 h-3" />
        </a>
      )}
    </div>
  );
}
