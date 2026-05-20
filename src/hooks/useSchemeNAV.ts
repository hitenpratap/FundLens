import { useQueries } from '@tanstack/react-query';
import { fetchSchemeDetail } from '../api/mfapi';

export function useSchemeNAVs(schemeCodes: number[]) {
  return useQueries({
    queries: schemeCodes.map(code => ({
      queryKey: ['schemeNAV', code],
      queryFn: () => fetchSchemeDetail(code),
      staleTime: 1000 * 60 * 60, // 1 hour
    })),
  });
}
