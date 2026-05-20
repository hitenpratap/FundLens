import { useQuery } from '@tanstack/react-query';
import { fetchSchemeList } from '../api/mfapi';

export function useSchemeList() {
  return useQuery({
    queryKey: ['schemeList'],
    queryFn: fetchSchemeList,
    staleTime: Infinity,
    gcTime: Infinity,
  });
}
