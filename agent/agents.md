# File: E:/projects/sorties/task-management/task-manager-app/agent/agents.md

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

## SECTION 4: APPLICATION PAGES & DATA FLOW

This section provides a high-level overview of each page within the application, its primary function, and how it interacts with the central database.

### Core Principle: Centralized Data

The application's state is built around a central database containing two primary models: **`Task`** and **`Note`**. All pages act as different "lenses" or views for this shared data. Due to the use of React Query, a change made on one page (e.g., updating a task) will be automatically and immediately reflected on all other pages that display that same piece of data.

### 1. Today / Dashboard (`/`)

- **Purpose:** The landing page, providing a focused summary of what is relevant _today_.
- **Functionality:**
  - Displays a list of tasks where the `dueDate` is the current date.
  - Features a "Week Calendar" for quick navigation to other days.
  - Includes an "AI Daily Summary" feature that generates a motivational overview of the day's tasks.
- **Data Connection:** **Reads** all `Tasks` and filters them on the client to show only today's.

### 2. Tasks (`/tasks`)

- **Purpose:** The main hub for all-encompassing task management.
- **Functionality:**
  - Displays the _entire_ list of tasks.
  - Offers multiple views: a traditional **List**, a visual **Card** grid, and a Kanban-style **Board**.
  - Includes real-time filtering by search, status, priority, and category.
  - Allows for direct task manipulation (e.g., drag-and-drop status changes).
- **Data Connection:** **Reads** all `Tasks` and **Writes** updates or deletions to individual tasks.

### 3. Task Edit Page (`/tasks/[id]`)

- **Purpose:** A dedicated form for modifying a single task.
- **Functionality:**
  - Allows editing of all task properties (title, description, dates, status, etc.).
- **Data Connection:** **Reads** a single `Task` by its ID and **Writes** updates back to it.

### 4. Notes (`/notes`)

- **Purpose:** The entry point for managing long-form text and ideas.
- **Functionality:**
  - Displays a grid-based list of all notes.
  - Allows for the creation of new, empty notes.
- **Data Connection:** **Reads** all `Notes`.

### 5. Note Detail Page (`/notes/[id]`)

- **Purpose:** The workspace for a single note, acting as the bridge between unstructured ideas and structured tasks.
- **Functionality:**
  - Provides a simple editor for the note's content.
  - Features the "Generate/Update Suggested Tasks" button, which uses AI to parse the note content into actionable `SuggestedTask` items.
  - Displays these suggestions and allows the user to approve them, which opens the task creation modal.
- **Data Connection:**
  - **Reads** a single `Note` and its related `SuggestedTasks`.
  - **Writes** new `SuggestedTasks` when the AI generation is triggered.
  - **Creates** a new `Task` when a suggestion is approved, and **updates** the original `SuggestedTask` to link it to the newly created task.

### 6. Calendar (`/calendar`)

- **Purpose:** Provides a traditional monthly calendar view for long-term planning.
- **Functionality:**
  - Shows a full month, with indicators on days that have tasks.
  - Clicking a day displays a list of all tasks due on that date.
- **Data Connection:** **Reads** all `Tasks` and groups them by `dueDate`.

### 7. Analytics (`/analytics`)

- **Purpose:** Offers data visualization to track productivity.
- **Functionality:**
  - Displays high-level stats (e.g., completion rate).
  - Includes charts for task distribution by status and category.
- **Data Connection:** **Reads** all `Tasks` and performs aggregations on the client to generate the visualizations.

### 8. Chat (`/chat`)

- **Purpose:** A conversational AI assistant that is aware of the user's data.
- **Functionality:**
  - Allows users to ask natural language questions about their tasks and notes.
  - Supports multiple AI models.
- **Data Connection:** **Reads all `Tasks` and `Notes`** to provide context to the AI for answering user queries. It does not write any data.

### 9. Settings (`/settings`)

- **Purpose:** A central location for user preferences and data management.
- **Functionality:**
  - Theme selection (Light/Dark mode).
  - Setting default values for new tasks and the default AI model.
  - Exporting all user data to JSON.
  - Deleting all user data from the database.
- **Data Connection:** Primarily interacts with browser `localStorage` for preferences. The "Delete All" function **writes** a delete command for all `Tasks` and `Notes` in the database.

---

## SECTION 5: STANDARDIZED LOGGING PROTOCOL

This section outlines the application-wide strategy for logging. The goal is to move beyond simple `console.log` statements to a structured, contextual, and environment-aware system that simplifies debugging and is ready for production environments.

### 5.1. Core Principles

- **Structured:** All logs are written as JSON objects, making them machine-readable, searchable, and filterable.
- **Contextual:** Every log message clearly indicates its origin (e.g., API route, client-side hook).
- **Layered:** Logging is implemented at every critical boundary: UI interaction, data mutation hooks, API routes, and database operations.
- **Environment-Aware:** The verbosity of logs is automatically controlled by the `NODE_ENV` environment variable.

### 5.2. Chosen Tools & Implementation

A dual-pronged approach is used to optimize for both server performance and client-side bundle size.

- **Server-Side Logging (Terminal):**

  - **Tool:** **Pino** is the standard for high-performance, low-overhead structured logging in Node.js.
  - **Development:** In `development` mode, logs are beautified using **`pino-pretty`** for maximum readability in the terminal. The log level is set to `info` to capture all important events.
  - **Production:** In `production` mode, the log level is automatically set to `error`. Only critical errors are logged, and they are written as raw JSON, which is the expected format for production log management services.

- **Client-Side Logging (Browser Console):**
  - **Tool:** A **lightweight custom wrapper** around the browser's native `console` object. This avoids adding unnecessary weight to the client bundle.
  - **Development:** The logger will print `info`, `warn`, and `error` messages with a consistent format.
  - **Production:** `info` and `debug` level logs are disabled (they become no-op functions). `warn` and `error` logs remain active to capture issues experienced by real users.

### 5.3. Centralized Logger

All logging logic is centralized in a new utility file: `lib/logger.ts`. This file exports two pre-configured loggers:

- `serverLogger`: For use in all server-side code (API routes, server components).
- `clientLogger`: For use in all client-side code (`"use client"` components and hooks).

### 5.4. Usage Example

```typescript
// Example from an API route
import { serverLogger } from "@/lib/logger";
import { ZodError } from "zod";

try {
  const validatedData = schema.parse(body);
  serverLogger.info({ data: validatedData }, "Validation successful");
  // ...
} catch (error) {
  if (error instanceof ZodError) {
    serverLogger.error({ err: error.issues }, "Zod validation failed");
  }
}
```

This protocol ensures that debugging is efficient and that the application's logging is scalable and secure for production.
This document supersedes all previous instructions. Adherence is required for mission success.
