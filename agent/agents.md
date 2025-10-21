# Agent Protocol & System Architecture: Task Management Application

**Version: 3.0**
**Status: ACTIVE**

## SECTION 1: PRIMARY DIRECTIVE & CORE PROTOCOLS

### 1.1. Mission Directive

Your function is to operate as the lead developer for this application. Your primary directive is the maintenance, enhancement, and refactoring of the codebase. You will ensure all functionality is robust, scalable, and strictly adheres to the architecture outlined in this document.

### 1.2. Core Protocols (Non-Negotiable Mandates)

These are the foundational rules of the codebase. Deviation is not permitted.

- **Protocol Alpha (Data Authority): Prisma is the Absolute Source of Truth.**

  - All application data is persisted in the SQLite database (`prisma/dev.db`).
  - All interactions with this data **MUST** be performed via the Prisma Client on the server side.

- **Protocol Bravo (State Management): React Query & Zustand are the State Authorities.**

  - **React Query (`@tanstack/react-query`) is the mandatory tool for all server state management.** This includes data fetching, caching, and all mutation operations (Create, Update, Delete). It is the source of truth for any data that persists on the server.
  - **Zustand is the designated tool for global, client-side UI state.** Its use is for non-persistent state that needs to be shared across components, such as filter settings, modal visibility, or theme toggles.
  - The previous `AppContext`-based system for data fetching is **explicitly deprecated**.

- **Protocol Charlie (Data Access): The API is the Sole Gateway.**

  - Frontend components are forbidden from accessing the database directly.
  - All data mutations **MUST** be executed via API calls orchestrated by React Query's `useMutation` hook. These hooks will call the Next.js API Routes located in `app/api/`.

- **Protocol Delta (Code Integrity): Path Aliases are Mandatory.**
  - **Historical Context:** Previous development generated inconsistent relative import paths (`../../../`). This is a critical-level violation of code style.
  - **The Rule:** All internal module imports **MUST** use the `@/` path alias rooted at the project's base directory (e.g., `import { Button } from "@/components/ui/button";`).

---

## SECTION 2: SYSTEM ARCHITECTURE DEEP DIVE

This section details the intricate relationships between the technologies used in this application.

### 2.1. Backend & Data Layer

**Flow:** `HTTP Request -> API Route -> Zod Validation -> Prisma Client -> SQLite Database`

1.  **Prisma (The ORM):**

    - **Schema (`prisma/schema.prisma`):** Defines the `Task` and `Note` models. This is the structural blueprint for your data.
    - **Client (`lib/prisma.ts`):** A singleton instance of the Prisma Client is instantiated and used exclusively by the API routes.

2.  **Next.js API Routes (The Gateway):**
    - **Location:** `app/api/`
    - **Function:** They are the server-side handlers for frontend requests orchestrated by React Query. They receive requests, validate data, use Prisma for database operations, and return JSON responses. After a successful mutation, they use Next.js's `revalidatePath` function to ensure server-side caches are cleared.

### 2.2. Frontend Architecture

**Flow:** `User Interaction -> Component -> React Query Mutation -> Optimistic UI Update -> API Call -> Cache Invalidation -> Final UI State`

1.  **React Query (Server State Management):**

    - **The Core:** Manages the entire server data lifecycle. It replaces all manual `fetch` calls and `useState` for loading/error states.
    - **`useQuery`:** Used for reading data (e.g., `useQuery({ queryKey: ['tasks'], queryFn: fetchTasks })`). Components bind to this hook to get cached data, loading status, and error information.
    - **`useMutation`:** Used for all Create, Update, and Delete operations.
    - **Instant UI Updates:** Mutations **MUST** be implemented with **optimistic updates**. The `onMutate` callback should update the local cache immediately, providing a seamless user experience. The `onError` callback must roll back this change if the API call fails.
    - **Cache Revalidation:** The `onSuccess` or `onSettled` callback in `useMutation` **MUST** invalidate the relevant query keys (e.g., `queryClient.invalidateQueries(['tasks'])`). This ensures that the local cache is refreshed with the true state from the database after a successful mutation.

2.  **Zustand (Global Client State):**

    - **Role:** Manages ephemeral UI state that is not persisted on the server.
    - **Example Store (`stores/ui-store.ts`):** A store might contain state like `isTaskModalOpen`, `taskModalData`, and functions to control them (`openTaskModal`, `closeTaskModal`). Components can then subscribe to this store to share UI state without prop drilling.

3.  **Shadcn/UI & Tailwind CSS (The Visual System):**
    - **Component Source:** All UI primitives are located in `components/ui/`.
    - **Styling:** Components are styled exclusively with Tailwind CSS utility classes.

---

## SECTION 3: STANDARD OPERATING PROCEDURES (SOPs)

Execute these workflows for common development tasks.

### SOP-1: Implementing a New Task Field (e.g., `effort: Int`)

1.  **Schema Definition:** Edit `prisma/schema.prisma`. Add `effort Int?` to the `Task` model.
2.  **Database Migration:** Execute `npx prisma migrate dev --name add_task_effort`.
3.  **Validation:** Edit `lib/schemas.ts`. Add `effort: z.number().optional()` to the Zod schemas.
4.  **API Endpoint:** Modify the relevant API routes in `app/api/` to handle the new `effort` field.
5.  **Frontend Mutation:** Update the React Query `useMutation` hook for updating tasks. Modify its function to include the `effort` field in the API call payload.
6.  **Frontend Form:** Edit `components/tasks/task-form-modal.tsx`. Add a new `FormField` to capture the effort.
7.  **UI Display:** Update components like `TaskCard.tsx` to display the new field, reading it from the data provided by the `useQuery(['tasks'])` hook.

### SOP-2: Deleting a Task

1.  **Component:** In the UI (e.g., `TaskCard.tsx`), create a "Delete" button.
2.  **Mutation Hook:** Create or use an existing `useMutation` hook for deleting tasks.
    - The `mutationFn` will call `DELETE /api/tasks/[id]`.
    - Implement `onMutate` for an optimistic update:
      - Cancel any outgoing refetches for the tasks list.
      - Snapshot the previous state of the tasks list from the query cache.
      - Manually remove the task from the cache using `queryClient.setQueryData(['tasks'], ...)`.
      - Return the snapshot context.
    - Implement `onError` to roll back the cache to the snapshot from context if the deletion fails.
    - Implement `onSettled` to invalidate the `['tasks']` query key to ensure the cache is in sync with the server.
3.  **Event Handler:** The `onClick` handler of the "Delete" button will call the `mutate` function from the `useMutation` hook.

---

This document supersedes all previous instructions. Adherence is required for mission success.
