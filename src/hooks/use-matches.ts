import { useCallback, useEffect, useState } from 'react';
import { AppState } from 'react-native';

import { allPages, api } from '@/services/api';
import type { Match } from '@/services/types';

export function useMatches() {
  const [matches, setMatches] = useState<Match[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const reload = useCallback(
    () =>
      allPages<Match>('/merchant/matches')
        .then(
          (items) => {
            setMatches(items);
            setError(null);
          },
          (e: Error) => setError(e.message),
        )
        .finally(() => setLoading(false)),
    [],
  );

  useEffect(() => {
    void reload();
    const subscription = AppState.addEventListener('change', (state) => {
      if (state === 'active') void reload();
    });
    return () => subscription.remove();
  }, [reload]);

  const revoke = useCallback(
    async (matchId: string) => {
      await api(`/merchant/matches/${matchId}/revoke`, { method: 'POST', body: { confirm: true } });
      await reload();
    },
    [reload],
  );

  return { matches, loading, error, reload, revoke };
}
