import type { SchemeListItem, SchemeDetail } from '../types';

const BASE = 'https://api.mfapi.in/mf';

export async function fetchSchemeList(): Promise<SchemeListItem[]> {
  const res = await fetch(BASE);
  if (!res.ok) throw new Error('Failed to fetch scheme list');
  return res.json();
}

export async function fetchSchemeDetail(schemeCode: number): Promise<SchemeDetail> {
  const res = await fetch(`${BASE}/${schemeCode}`);
  if (!res.ok) throw new Error(`Failed to fetch scheme ${schemeCode}`);
  return res.json();
}
