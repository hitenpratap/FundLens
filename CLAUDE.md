# MF Tracker — Claude Context

## Project
Mutual fund return tracker. Fetches historical NAV data from [mfapi.in](https://www.mfapi.in/) and visualizes month-by-month individual and collective returns for up to 5 schemes.

## Package Manager
**Always use Bun** — never npm, yarn, or pnpm.
```
bun add <package>        # install dep
bun add -d <package>     # install dev dep
bun run dev              # start dev server
bun run build            # type-check + build
bun run lint             # eslint
```

## Tech Stack
- React 19 + TypeScript + Vite 8
- Tailwind CSS v4 (via `@tailwindcss/vite` plugin — no `tailwind.config.js` needed)
- Recharts v3 — area/line charts
- @tanstack/react-query v5 — data fetching + caching
- Fuse.js — client-side fuzzy search over 10k+ scheme list
- jsPDF + html2canvas — PDF export

## Key Architecture

### App flow
`SetupForm` → user picks investor name, years (1/2/3/5/7/10), up to 5 schemes → `Dashboard`

### API
- `GET https://api.mfapi.in/mf` — full scheme list (cached forever, fetched once)
- `GET https://api.mfapi.in/mf/{schemeCode}` — historical NAVs for a scheme (cached 1 hour)
- No auth, CORS open. NAV records: `{date: "DD-MM-YYYY", nav: "123.456"}`, newest-first.

### Calculation logic (`src/utils/returns.ts`)
- Filter NAVs to `[today - N years, today]`
- Group by month → last record per month
- Normalize to 100 at start date
- CAGR = `(navLast/navFirst)^(1/N) - 1`
- Portfolio = equal-weight average of normalized scheme values

### File layout
```
src/
  types.ts                   # all shared types
  api/mfapi.ts               # fetchSchemeList(), fetchSchemeDetail()
  hooks/
    useSchemeList.ts          # react-query, staleTime: Infinity
    useSchemeNAV.ts           # react-query, staleTime: 1h
  utils/returns.ts            # computeSchemeReturns(), computePortfolio()
  components/
    SetupForm/                # investor name, year picker, scheme search
    Dashboard/
      SummaryCards.tsx        # portfolio + per-scheme return cards
      PortfolioChart.tsx      # combined normalized area chart
      SchemeChart.tsx         # per-scheme NAV chart (tabbed)
      MonthlyTable.tsx        # heatmap table, month × scheme
      PDFExport.tsx           # html2canvas + jsPDF download button
```

## Conventions
- No comments unless WHY is non-obvious
- Tailwind utility classes for all styling (no CSS modules, no inline style except dynamic colors)
- Dynamic scheme colors come from `getSchemeColor(index)` in `utils/returns.ts`
- PDF export targets `id="dashboard-content"` div

## Commits
- Always use [Conventional Commits](https://www.conventionalcommits.org/) format: `<type>(<scope>): <subject> <emoji>`
- Emoji goes at the **end** of the subject line
- Types: `feat`, `fix`, `docs`, `style`, `refactor`, `perf`, `test`, `build`, `ci`, `chore`, `revert`
- Emoji guide: `feat ✨`, `fix 🐛`, `docs 📝`, `style 💄`, `refactor ♻️`, `perf ⚡`, `test ✅`, `build 📦`, `ci 👷`, `chore 🔧`, `revert ⏪`
- Examples:
  - `feat(dashboard): add portfolio allocation pie chart ✨`
  - `fix(api): handle empty NAV response 🐛`
  - `docs: update setup instructions 📝`
