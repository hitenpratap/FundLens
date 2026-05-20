export interface SchemeListItem {
  schemeCode: number;
  schemeName: string;
  isinGrowth: string | null;
  isinDivReinvestment: string | null;
}

export interface NavRecord {
  date: string; // "DD-MM-YYYY"
  nav: string;
}

export interface SchemeMeta {
  fund_house: string;
  scheme_type: string;
  scheme_category: string;
  scheme_code: number;
  scheme_name: string;
}

export interface SchemeDetail {
  meta: SchemeMeta;
  data: NavRecord[];
}

export interface MonthlyNav {
  month: string; // "YYYY-MM"
  label: string; // "Jan 2023"
  nav: number;
  normalizedValue: number; // normalized to 100 at start
  monthlyReturn: number | null; // % change from prev month
  investedToDate: number; // cumulative SIP invested up to and including this month
  fundValueToDate: number; // value of all accumulated units at this month's NAV
  marketGainINR: number | null; // unrealized gain on units held before this month's SIP
}

export interface SchemeReturns {
  schemeCode: number;
  schemeName: string;
  fundHouse: string;
  monthlyNavs: MonthlyNav[];
  startNav: number;
  currentNav: number;
  absoluteReturn: number;
  cagr: number;
  actualYears: number; // actual data span used to compute CAGR
  xirr: number | null; // annualized return on SIP cash flows; null when no SIP
  color: string;
  sipAmount: number;
  totalInvested: number;
  currentValue: number;
  absoluteGainINR: number;
}

export interface PortfolioMonth {
  month: string;
  label: string;
  portfolioValue: number; // avg normalized value
  monthlyReturn: number | null;
}

export interface SetupFormData {
  investorName: string;
  years: number;
  selectedSchemes: SchemeListItem[];
  sipAmounts: Record<number, number>;
}
