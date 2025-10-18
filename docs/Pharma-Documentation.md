## TiaMeds Pharma Application — End‑to‑End Documentation

### 1. Overview
TiaMeds Pharma is a Next.js 15 (App Router) application for pharmacy management. It provides secure authentication, role-aware navigation, and modules for billing, purchase entry, purchase orders, inventory, items, suppliers, patients, doctors, returns, GST/sales reports, stock analytics, and user management.

- **Tech stack**: Next.js 15, React 19, TypeScript, Tailwind CSS, Zustand, Zod, Axios, Chart.js/Recharts, React-Toastify
- **API**: Configured via `NEXT_PUBLIC_API_URL` and accessed with Axios instance at `src/utils/api.ts` (Bearer token from `token` cookie, request/response interceptors)
- **State**: `PharmaProvider` React Context for pharmacy selection and logged-in user; `zustand` store for authenticated user session
- **Routing**: App Router with middleware-based auth guards (`src/middleware.ts`)


### 2. Access and Authentication
- Public routes: `/` (marketing/landing), `/login` (auth)
- Protected routes: `/dashboard` and nested paths (all operational modules); `/admin` (if present)
- Middleware: if `token` cookie exists, redirects `/` and `/login` to `/dashboard`; if token missing and accessing protected routes, redirects to `/login`.

Login flow:
1. User submits credentials on `/login`.
2. `auth.Service.login` authenticates; on success, sets `token` cookie and persists user in `localStorage` (`user`).
3. Navigation to `/dashboard` occurs; `useUserStore.initializeUser()` hydrates the session from `localStorage`.


### 3. Core Concepts and Data
- **Pharmacy** (`PharmacyData`): id, name, address, GST/license, contact, active flag
- **User** (`UserData`): profile, roles, modules; stored in context `PharmaContex`
- **Billing** (`BillingData`): bill dates, patient type, payment info and amounts
- Additional types: items, variants, suppliers, patients, doctors, purchase entries/orders, returns, stock, and report DTOs under `src/app/types`

APIs are grouped in `src/app/services/*Service.ts`. The Axios instance in `src/utils/api.ts` adds Authorization header for all non-public endpoints and centralizes error handling.


### 4. Navigation and Layout
- Global layout: `src/app/layout.tsx` wraps app with `PharmaProvider` and `ToastContainer` and imports global styles
- Dashboard shell: `src/app/dashboard/layout.tsx` renders `SideBar` and the main content area; it initializes pharmacy context and selects current pharmacy (from API or `localStorage`), with a redirect to `/create-pharma` if no pharmacy is available
- Shared UI components under `src/app/components` (charts, table, buttons, modal, pagination, select, loader, CSV export)


### 5. Landing/Marketing Page (`/`)
File: `src/app/page.tsx`
- Highlights product value, features accordion, FAQ, and contact form (non-functional placeholder with toast).
- “Partner With Us” navigates to `/login`.


### 6. Authentication Module
- Route: `src/app/(auth)/login/page.tsx`
- Features: login form with validation feedback, show/hide password, link to in-flow register component, success/error toasts, sets `token` cookie and persists user details.
- Register: `src/app/(auth)/userRegister/component/UserRegister.tsx` (embedded in login flow on toggle).


### 7. Dashboard Home (`/dashboard`)
File: `src/app/dashboard/page.tsx`
- Personalized greeting using `useUserStore`
- Range selector: Today / This Week / This Month
- Widgets:
  - Bill Count Summary (Paid vs Pending)
  - Financial Summary (Cash/Card/UPI+Online)
  - Patient Summary (Walkin/IP/OP)
  - Sales Analytics (weekly bar chart)
  - Important Alerts (this week’s bill count and total, purchase invoice due/overdue, orders due/overdue)
- Data sources:
  - `getBilling()` for billing data aggregation
  - `getPurchase()` for invoice due/overdue (from `PurchaseEntryService`)
  - `getPurchaseOrder()` for delivery stats (from `PurchaseOrderService`)


### 8. Modules and Workflows
All modules are under `src/app/dashboard/*`. Pages are server components bridged to client components for interactivity.

- Billing (`/dashboard/billing`)
  - Components: `Billing.tsx`, `BillingSummary.tsx`
  - Services: `BillingService.ts` (list, get by id, create)
  - Workflow: search/add items, apply discounts/taxes, select payment type (cash/card/UPI, combined UPI+Cash supported), generate GST-compliant bill, mark paid/pending.

- Entry (Purchase Entry) (`/dashboard/entry`)
  - Components: `PurchaseEntry.tsx`, `Filter.tsx`, `OrderSummary.tsx`
  - Service: `PurchaseEntryService.ts`
  - Workflow: record supplier invoices, batch/expiry management, payment due date, payment status tracking.

- Purchase Order (`/dashboard/order` and `/dashboard/purchaseOrderDetails`)
  - Components: `PurchaseOrder.tsx`, `PurchaseOrderDetailsClient.tsx`
  - Service: `PurchaseOrderService.ts`
  - Workflow: create POs from low stock, set intended delivery dates, track undelivered/overdue.

- Inventory (`/dashboard/inventory`)
  - Component: `ViewStock.tsx`
  - Service: `InventoryService.ts`
  - Workflow: list stock with batch/expiry, low/expired stock detection.

- Items (`/dashboard/item`)
  - Component: `AddItem.tsx`
  - Service: `ItemService.ts`, `VariantService.ts`
  - Workflow: create/update SKUs, variants, HSN/GST, pack details.

- Suppliers (`/dashboard/supplier`)
  - Components under `supplier/component`
  - Service: `SupplierService.ts`
  - Workflow: manage supplier master, contacts, GSTIN, agreements.

- Patients (`/dashboard/patient`)
  - Component: `Patient.tsx`
  - Service: `PatientService.ts`
  - Workflow: manage patient profiles and visit types (Walkin/IP/OP) for billing.

- Doctors (`/dashboard/doctor`)
  - Component: `Doctor.tsx`
  - Service: `DoctorService.ts`
  - Workflow: manage prescribers tied to bills/returns.

- Returns
  - Purchase Return (`/dashboard/return`): `PurchaseReturn.tsx`, `PurchaseReturnService.ts`
  - Sales Return (`/dashboard/salesReturn`): `SalesReturnService.ts`

- Reports and Analytics
  - Billing Summary (`/dashboard/billingSummary`): `BillingSummaryService.ts`
  - Order Summary (`/dashboard/orderSummary`)
  - Sales Report (`/dashboard/salesReport`)
  - Sales GST Report (`/dashboard/salesGstReport`)
  - GST Summary (`/dashboard/gstsummary`)
  - Expiry Report (`/dashboard/expiryReport`) and Expired Stock (`/dashboard/expiredStock`)
  - Stock Report (`/dashboard/stockreport`) and Stock Valuation (`/dashboard/stockValuation`)
  - Export utilities: `ExportAsCSVService.ts` and UI `ExportAsCSV.tsx`

- User Management (`/dashboard/userManagement`)
  - Manage users/roles/modules; `UserService.ts`

- Pharmacy Profile (`/dashboard/pharmacy`)
  - View or create pharmacy details; `PharmacyService.ts` and `create-pharma` flow.


### 9. Shared Components
- Charts: `BarChart.tsx`, `DoughnutChart.tsx`, `recharts` components
- Tables and pagination: `Table.tsx`, `PaginationTable.tsx`
- Forms: `Input.tsx`, `InputField.tsx`, `SelectField.tsx`, `TextareaFeild.tsx`, `ToggleButton.tsx`, `ItemDropdown.tsx`
- Layout: `Navigation.tsx`, `SideBar.tsx`, `Footer.tsx`, `Drawer.tsx`, `Modal.tsx`, `Loader.tsx`, `EllipsisTooltip.tsx`, `PrintButton.tsx`


### 10. Environment and Configuration
- `NEXT_PUBLIC_API_URL` is required; example: `https://api.example.com/`
- Auth token is read from `token` cookie by `api` request interceptor
- Public endpoints excluded from auth header: `/public/login`, `/public/register`


### 11. Data Validation
- Zod schemas under `src/app/schema/*` define validation for Billing, Doctor, Item, Patient, Pharmacy, Purchase Entry/Return, Supplier, User, Register.


### 12. CSV/PDF/Export and Printing
- CSV export: `ExportAsCSV.tsx` and `ExportAsCSVService.ts`
- Printing: `PrintButton.tsx`
- PDF/image capture: `jspdf` and `html2canvas` dependencies (used where applicable in billing/summary pages).


### 13. Toasts and UX Feedback
- Global `ToastContainer` in root layout; modules use `react-toastify` for success/error user feedback


### 14. Typical User Workflows
- Onboarding
  1) Visit `/login` and authenticate
  2) On first load, if user has no pharmacies, redirected to `/create-pharma` to create one
  3) After creation or selection, current pharmacy is stored and used across modules

- Billing a walk-in sale
  1) Navigate to Billing
  2) Search/add items (batch-aware), set quantities, prices, discounts
  3) Select patient type (Walkin/IP/OP), choose payment type
  4) Generate bill; the bill appears in dashboard aggregations

- Recording a supplier invoice
  1) Navigate to Entry
  2) Add purchase items with cost, batch, expiry
  3) Set payment due date/status
  4) Save; invoices due/overdue appear in dashboard alerts

- Raising a purchase order
  1) Navigate to Order
  2) Create PO with intended delivery date
  3) Track in dashboard delivery alerts; details in Order Summary module


### 15. Error Handling & Security
- Axios response interceptor logs and can redirect on 401
- Middleware enforces route protection
- Sensitive actions require valid `token` cookie; ensure HTTPS and `Secure` cookie attributes in production


### 16. Development, Build, and Deployment
- Commands:
  - Dev: `npm run dev`
  - Build: `npm run build`
  - Start: `npm run start`
  - Lint: `npm run lint`
- Ensure `NEXT_PUBLIC_API_URL` is set and reachable; browsers must receive `token` cookie upon login
- Static assets reside under `public/`


### 17. Directory Reference
- `src/app/(auth)`: login, registration
- `src/app/dashboard`: all operational modules, layout, UI primitives
- `src/app/services`: API orchestration per domain
- `src/app/schema`: Zod validation schemas
- `src/app/types`: DTO/type definitions
- `src/app/components`: shared UI widgets and charts
- `src/app/context`: `PharmaProvider` and `zustand` store
- `src/utils/api.ts`: Axios instance and interceptors
- `src/middleware.ts`: auth guards


### 18. Extending the System
- Add a module:
  1) Create `src/app/dashboard/<module>/page.tsx` and any client components
  2) Add service file under `src/app/services`
  3) Define data types under `src/app/types`
  4) Add Zod schemas under `src/app/schema` as needed
  5) Link from `SideBar.tsx` navigation

- Add an endpoint:
  1) Implement function in a `*Service.ts` using `api`
  2) Handle success/error with typed responses and toasts where appropriate


### 19. Known Limitations
- Landing page contact form is a placeholder (shows “Feature coming soon”)
- Some admin routes are referenced but not included in this repository; integrate as needed


### 20. Support
For operational questions or enhancements, review the domain service files in `src/app/services` and associated types/schemas first. For authentication/session issues, check `src/middleware.ts`, `src/utils/api.ts`, and the `token` cookie setup during login.


