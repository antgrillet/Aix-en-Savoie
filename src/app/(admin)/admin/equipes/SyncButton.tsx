'use client';

import { useState } from 'react';
import { RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

export function SyncButton() {
  const [isSyncing, setIsSyncing] = useState(false);

  const handleSync = async () => {
    setIsSyncing(true);

    try {
      toast.info('Synchronisation des matchs en cours...');

      const response = await fetch('/api/sync/matches', {
        method: 'GET',
      });

      const data = await response.json();

      if (data.success) {
        const { totalCreated, totalUpdated, totalSkipped, totalErrors } = data.stats;

        toast.success(
          `Synchronisation terminée: ${totalCreated} créés, ${totalUpdated} mis à jour, ${totalSkipped} ignorés${totalErrors > 0 ? `, ${totalErrors} erreurs` : ''}`
        );

        // Rafraîchir la page pour voir les changements
        window.location.reload();
      } else {
        toast.error(`Erreur: ${data.error || 'Synchronisation échouée'}`);
      }
    } catch (error) {
      console.error('Erreur lors de la synchronisation:', error);
      toast.error('Erreur lors de la synchronisation des matchs');
    } finally {
      setIsSyncing(false);
    }
  };

  return (
    <Button
      onClick={handleSync}
      disabled={isSyncing}
      variant="outline"
      className="border-primary-600 text-primary-600 hover:bg-primary-50"
    >
      <RefreshCw className={`w-4 h-4 mr-2 ${isSyncing ? 'animate-spin' : ''}`} />
      {isSyncing ? 'Synchronisation...' : 'Synchroniser les matchs'}
    </Button>
  );
}
