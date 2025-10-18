## TiaMeds Pharma — Pharmacy Management Application

TiaMeds Pharma is a Next.js 15 + React 19 application that streamlines day-to-day pharmacy operations: billing, purchase management, inventory, returns, reports, and analytics — with secure, role-aware access.

### Documentation
- Full product and technical documentation: `docs/Pharma-Documentation.md`

### Quick Start
1. Install dependencies:
```bash
npm install
```
2. Configure environment:
```bash
set NEXT_PUBLIC_API_URL=https://api.example.com/
```
3. Run the app:
```bash
npm run dev
```
Open http://localhost:3000

### Production
```bash
npm run build
npm run start
```

### Tech Highlights
- Next.js App Router, TypeScript, Tailwind CSS 4
- State: React Context (`PharmaProvider`), Zustand user store
- API: Axios with auth interceptors (`src/utils/api.ts`)
- Charts: Chart.js/Recharts, CSV export, jsPDF/html2canvas

### Auth & Routing
- Public: `/`, `/login`
- Protected: `/dashboard/*` (guarded by `src/middleware.ts` using `token` cookie)

### License
Proprietary — TiaMeds Technologies Ltd.
