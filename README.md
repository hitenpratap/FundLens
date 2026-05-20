# MF Tracker

Analyze Indian mutual fund returns month by month. Powered by [mfapi.in](https://www.mfapi.in/).

## Features

- **Scheme search** — fuzzy search over 10,000+ AMFI schemes, pick up to 5
- **Flexible time range** — 1, 2, 3, 5, 7, or 10 year analysis
- **Portfolio chart** — all schemes normalized to ₹100 at start, plus equal-weight portfolio line
- **Individual scheme NAV chart** — tabbed, shows raw NAV over time
- **Monthly returns heatmap** — month × scheme table with green/red intensity cells
- **Summary cards** — absolute return % and CAGR per scheme and portfolio
- **PDF export** — download the full dashboard as a PDF

## Tech Stack

| Layer | Library |
|---|---|
| UI | React 19 + TypeScript |
| Build | Vite 8 + Bun |
| Styling | Tailwind CSS v4 |
| Charts | Recharts v3 |
| Data fetching | TanStack Query v5 |
| Search | Fuse.js |
| PDF | jsPDF + html2canvas |

## Getting Started

Requires [Bun](https://bun.sh).

```bash
bun install
bun run dev
```

App runs at `http://localhost:5173`.

## Available Commands

```bash
make dev        # start dev server
make build      # type-check + production build
make preview    # preview production build
make lint       # run eslint
make install    # install dependencies
make clean      # delete dist/
```

Or directly with bun:

```bash
bun run dev
bun run build
bun run preview
bun run lint
```

## How It Works

1. On load, fetches the full AMFI scheme list from `api.mfapi.in/mf` (cached forever in memory).
2. User enters their name, selects a time period and up to 5 schemes.
3. On submit, fetches historical daily NAV for each scheme (cached 1 hour).
4. NAVs are grouped by month (last record per month), normalized to ₹100 at the start date.
5. Returns are computed: absolute %, CAGR, monthly delta per scheme and for the blended portfolio.

## API

Uses [mfapi.in](https://www.mfapi.in/) — free, no authentication, CORS open.

- `GET https://api.mfapi.in/mf` — list of all schemes
- `GET https://api.mfapi.in/mf/{schemeCode}` — historical NAVs for a scheme

## Project Structure

```
src/
├── types.ts                  # shared TypeScript types
├── api/mfapi.ts              # API fetch functions
├── hooks/
│   ├── useSchemeList.ts      # scheme list query (cached forever)
│   └── useSchemeNAV.ts       # per-scheme NAV queries
├── utils/returns.ts          # return calculation logic
└── components/
    ├── SetupForm/            # setup screen
    └── Dashboard/            # results screen
        ├── SummaryCards.tsx
        ├── PortfolioChart.tsx
        ├── SchemeChart.tsx
        ├── MonthlyTable.tsx
        └── PDFExport.tsx
```
