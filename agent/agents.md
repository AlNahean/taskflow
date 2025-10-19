# Agent Protocol & System Architecture: Task Management Application

**Version: 2.0**
**Status: ACTIVE**

## SECTION 1: PRIMARY DIRECTIVE & CORE PROTOCOLS

### 1.1. Mission Directive

Your function is to operate as the lead developer for this application. Your primary directive is the maintenance, enhancement, and refactoring of the codebase. You will ensure all functionality is robust, scalable, and strictly adheres to the architecture outlined in this document.

### 1.2. Core Protocols (Non-Negotiable Mandates)

These are the foundational rules of the codebase. Deviation is not permitted.

- **Protocol Alpha (Data Authority): Prisma is the Absolute Source of Truth.**

  - All task-related application data is persisted in the SQLite database (`prisma/dev.db`).
  - All interactions with this data **MUST** be performed via the Prisma Client.
  - **Zustand is explicitly deprecated** for task data management. Its presence in `package.json` is for potential minor, non-persistent UI state only. Do not use it for core application data.

- **Protocol Bravo (Data Access): The API is the Sole Gateway.**

  - Frontend components are forbidden from accessing the database directly.
  - All data mutations (Create, Read, Update, Delete) **MUST** be executed via `fetch` calls to the Next.js API Routes located in `app/api/`. This enforces a clean client-server separation.

- **Protocol Charlie (Code Integrity): Path Aliases are Mandatory.**
  - **Historical Context:** Previous development generated inconsistent relative import paths (`../../../`). This is now a critical-level violation of code style.
  - **The Rule:** All internal module imports **MUST** use the `@/` path alias rooted at the project's base directory (e.g., `import { Button } from "@/components/ui/button";`). This is enforced for readability and maintainability.

---

## SECTION 2: SYSTEM ARCHITECTURE DEEP DIVE

This section details the intricate relationships between the technologies used in this application.

### 2.1. Backend & Data Layer

**Flow:** `HTTP Request -> API Route -> Zod Validation -> Prisma Client -> SQLite Database`

1.  **Prisma (The ORM):**

    - **Schema (`prisma/schema.prisma`):** Defines the `Task` model. This is the structural blueprint for your data. Any change to data shapes starts here.
    - **Client (`lib/prisma.ts`):** A singleton instance of the Prisma Client is instantiated here and made available to the server-side parts of the application. This is your sole tool for database queries.
    - **Database (`prisma/dev.db`):** The live SQLite database file. To inspect it directly, run `npx prisma studio`.

2.  **Next.js API Routes (The Gateway):**
    - **Location:** `app/api/`
    - **Function:** They are the server-side handlers for frontend requests. They receive requests, parse and validate the body/params, use the Prisma Client for database operations, and return JSON responses.
    - **Example (`POST /api/tasks`):**
      1.  Client sends `fetch('/api/tasks', { method: 'POST', body: ... })`.
      2.  `app/api/tasks/route.ts` receives the request.
      3.  The request body is parsed into a JavaScript object.
      4.  This object is validated against the `CreateTaskSchema` from `lib/schemas.ts`. If validation fails, a 400 error is returned.
      5.  On success, `prisma.task.create({ data: validatedData })` is called.
      6.  The newly created task is returned as JSON with a 201 status code.

### 2.2. Frontend Architecture

**Flow:** `User Interaction -> Component -> Data Hook/API Fetch -> State Update -> UI Re-render`

1.  **Shadcn/UI & Tailwind CSS (The Visual System):**

    - **Component Source:** All UI primitives (Button, Card, Input, etc.) are located in `components/ui/`. These are not an installed library but actual source code in your project.
    - **Styling:** Components are styled exclusively with Tailwind CSS utility classes.
    - **Theming:** A sophisticated theming system is in place using CSS variables defined in `app/globals.css`. This allows components, including charts, to automatically adapt to light/dark mode.

2.  **Data Fetching & State (`hooks/use-tasks.ts`):**

    - This is the **primary hook** for components to read task data.
    - It encapsulates the `fetch` call to `GET /api/tasks`.
    - It manages a `loading` state, which components **MUST** use to display `Skeleton` components from `@/components/ui/skeleton` while data is being fetched.
    - It provides an `onTaskUpdate` (or `fetchTasks`) callback. This function **MUST** be called after any successful data mutation (create, update, delete) to ensure the UI is refreshed with the latest data from the server.

3.  **Analytics & Charting (Shadcn UI Charts):**
    - **Implementation:** The application uses `ChartContainer` and other components from `@/components/ui/chart`. This is a wrapper around `recharts`.
    - **Protocol:** Do not import from `recharts` directly in analytics components. Use the Shadcn UI Chart components. This ensures charts are theme-aware and consistent with the application's design system.
    - **Configuration:** Chart colors and labels are defined in a `chartConfig` object and passed to the `ChartContainer`. Colors should use the `hsl(var(--chart-N))` format to leverage the theming system.

---

## SECTION 3: STANDARD OPERATING PROCEDURES (SOPs)

Execute these workflows for common development tasks.

### SOP-1: Adding a New Task Field (e.g., `effort: Int`)

1.  **Schema Definition:** Edit `prisma/schema.prisma`. Add `effort Int?` to the `Task` model.
2.  **Database Migration:** Execute `npx prisma migrate dev --name add_task_effort` in the terminal.
3.  **Validation:** Edit `lib/schemas.ts`. Add `effort: z.number().optional()` to the Zod schemas.
4.  **API Endpoint:** Modify `app/api/tasks/route.ts` (for create) and `app/api/tasks/[id]/route.ts` (for update) to handle the new `effort` field in the request body and pass it to Prisma.
5.  **Frontend Form:** Edit `components/tasks/task-form-modal.tsx` and `components/pages/task-edit-page.tsx`. Add a new `FormField` with an `Input type="number"` to capture the effort.
6.  **UI Display:** Update components like `TaskCard.tsx` to display the new field.

### SOP-2: Implementing a New Chart

1.  **Data Aggregation:** In the analytics page component (e.g., `analytics-page.tsx`), process the raw task data from the `useTasks` hook into the shape required by the chart (e.g., an array of objects with `name` and `value` keys).
2.  **Chart Configuration:** Create a `chartConfig` object that defines the labels and `hsl` color variables for your data series.
3.  **Component Implementation:** In a new component file (e.g., `components/analytics/new-chart.tsx`), use the `<ChartContainer>`, `<BarChart>`/`<PieChart>`, and other components from `@/components/ui/chart` to build the visualization.
4.  **Integration:** Import and render your new chart component in the analytics page.

---

This document supersedes all previous instructions. Adherence is required for mission success.

```

```
