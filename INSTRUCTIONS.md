# Task Management App - Implementation Guide

## Overview
This is a fully functional task management application with calendar features, built with Next.js, React, and modern web technologies. The app is designed to be easily extended with real API calls.

## Tech Stack
- **Frontend Framework**: Next.js 15 (App Router)
- **UI Components**: shadcn/ui
- **Form Handling**: react-hook-form + Zod validation
- **State Management**: Zustand
- **Data Tables**: react-table
- **Charts**: Recharts
- **Date Utilities**: date-fns
- **URL Search Params**: nuqs
- **Animations**: Motion (ready for implementation)
- **API Layer**: tRPC + React Query (ready for implementation)

## Project Structure

\`\`\`
src/
├── app/                          # Next.js app router pages
│   ├── layout.tsx               # Root layout with providers
│   ├── page.tsx                 # Dashboard page
│   ├── calendar/page.tsx        # Calendar page
│   ├── tasks/page.tsx           # Tasks page
│   ├── analytics/page.tsx       # Analytics page
│   └── settings/page.tsx        # Settings page
├── components/
│   ├── layout/                  # Layout components
│   │   ├── main-layout.tsx      # Main layout wrapper
│   │   ├── sidebar.tsx          # Desktop sidebar
│   │   ├── bottom-nav.tsx       # Mobile bottom navigation
│   │   └── theme-toggle.tsx     # Theme switcher
│   ├── pages/                   # Page content components
│   ├── dashboard/               # Dashboard components
│   ├── calendar/                # Calendar components
│   ├── tasks/                   # Tasks components
│   ├── analytics/               # Analytics components
│   ├── ui/                      # shadcn/ui components
│   └── providers.tsx            # App providers
├── lib/
│   ├── schemas.ts              # Zod schemas for validation
│   ├── store.ts                # Zustand store (mock data)
│   └── utils.ts                # Utility functions
└── hooks/
    └── use-mobile.ts           # Mobile detection hook
\`\`\`

## Current Features

### Dashboard
- Today's tasks overview
- Quick statistics (completed, in-progress, overdue)
- Calendar preview with task indicators

### Calendar
- Full month calendar view
- Date selection
- Tasks filtered by selected date
- Month navigation

### Tasks
- Complete task table with sorting and filtering
- Filter by status, priority, category
- Search functionality
- Create new tasks with form validation
- Mark tasks as complete/incomplete
- Delete tasks

### Analytics
- Task status distribution chart
- Tasks by category pie chart
- Completion rate statistics
- High priority task count

### Settings
- Theme toggle (light/dark mode)
- Data export as JSON
- Task count display

## Implementing Real API Calls

### Step 1: Setup tRPC Backend

Create `server/api/routers/tasks.ts`:

\`\`\`typescript
import { router, publicProcedure } from '@/server/api/trpc'
import { CreateTaskSchema, UpdateTaskSchema } from '@/lib/schemas'

export const tasksRouter = router({
  // Get all tasks
  getAll: publicProcedure.query(async ({ ctx }) => {
    // Replace with your database query
    // Example: return await db.task.findMany()
  }),

  // Get task by ID
  getById: publicProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ input, ctx }) => {
      // Replace with your database query
      // Example: return await db.task.findUnique({ where: { id: input.id } })
    }),

  // Create task
  create: publicProcedure
    .input(CreateTaskSchema)
    .mutation(async ({ input, ctx }) => {
      // Replace with your database mutation
      // Example: return await db.task.create({ data: input })
    }),

  // Update task
  update: publicProcedure
    .input(z.object({ id: z.string(), data: UpdateTaskSchema }))
    .mutation(async ({ input, ctx }) => {
      // Replace with your database mutation
      // Example: return await db.task.update({ where: { id: input.id }, data: input.data })
    }),

  // Delete task
  delete: publicProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ input, ctx }) => {
      // Replace with your database mutation
      // Example: return await db.task.delete({ where: { id: input.id } })
    }),
})
\`\`\`

### Step 2: Replace Zustand Store with React Query

Update components to use React Query instead of Zustand:

\`\`\`typescript
import { useQuery, useMutation } from '@tanstack/react-query'
import { trpc } from '@/lib/trpc'

// In your component:
export function TasksComponent() {
  // Fetch tasks
  const { data: tasks } = trpc.tasks.getAll.useQuery()

  // Create task mutation
  const createMutation = trpc.tasks.create.useMutation({
    onSuccess: () => {
      // Invalidate and refetch
      queryClient.invalidateQueries({ queryKey: ['tasks'] })
    },
  })

  // Use createMutation.mutate() to create tasks
}
\`\`\`

### Step 3: Database Integration

Choose your database and ORM:

**Option A: Supabase + Drizzle ORM**
\`\`\`typescript
import { drizzle } from 'drizzle-orm/postgres-js'
import postgres from 'postgres'

const client = postgres(process.env.DATABASE_URL!)
export const db = drizzle(client)
\`\`\`

**Option B: Neon + Drizzle ORM**
\`\`\`typescript
import { drizzle } from 'drizzle-orm/neon-http'
import { neon } from '@neondatabase/serverless'

const sql = neon(process.env.DATABASE_URL!)
export const db = drizzle(sql)
\`\`\`

**Option C: Prisma**
\`\`\`typescript
import { PrismaClient } from '@prisma/client'

export const prisma = new PrismaClient()
\`\`\`

### Step 4: Environment Variables

Add to your `.env.local`:

\`\`\`
# Database
DATABASE_URL=your_database_url

# API
NEXT_PUBLIC_API_URL=http://localhost:3000
\`\`\`

## Responsive Design

The app is fully responsive with:
- **Mobile**: Bottom navigation bar, full-width content
- **Tablet**: Sidebar + content, optimized spacing
- **Desktop**: Fixed sidebar, multi-column layouts

Breakpoints used:
- `sm`: 640px
- `md`: 768px
- `lg`: 1024px
- `xl`: 1280px

## Styling

The app uses Tailwind CSS v4 with custom color variables:
- Light mode: Blue accents, white background
- Dark mode: Purple/blue gradient, dark background

All colors are defined in `app/globals.css` using CSS variables.

## Adding Animations

The app is ready for Motion animations. Example:

\`\`\`typescript
import { motion } from 'motion/react'

export function AnimatedTaskCard({ task }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
    >
      {/* Task content */}
    </motion.div>
  )
}
\`\`\`

## URL Search Parameters

Use nuqs for managing filters in URL:

\`\`\`typescript
import { useQueryState } from 'nuqs'

export function TaskFilters() {
  const [status, setStatus] = useQueryState('status')
  const [priority, setPriority] = useQueryState('priority')

  // Filters are now persisted in URL
}
\`\`\`

## Common Tasks

### Add a new page
1. Create `app/[page-name]/page.tsx`
2. Create corresponding component in `components/pages/`
3. Add navigation link in `components/layout/sidebar.tsx` and `components/layout/bottom-nav.tsx`

### Add a new task field
1. Update schema in `lib/schemas.ts`
2. Update Zustand store in `lib/store.ts`
3. Update form in `components/tasks/task-form-modal.tsx`
4. Update table in `components/tasks/tasks-table.tsx`

### Customize colors
Edit CSS variables in `app/globals.css`:
\`\`\`css
:root {
  --primary: oklch(0.205 0 0);
  --primary-foreground: oklch(0.985 0 0);
  /* ... other colors ... */
}
\`\`\`

## Troubleshooting

### Tasks not showing
- Check `lib/store.ts` for mock data
- Verify Zustand store is properly initialized
- Check browser console for errors

### Styling issues
- Ensure Tailwind CSS is properly configured
- Check `app/globals.css` for color variables
- Verify shadcn/ui components are installed

### Mobile layout broken
- Check `useIsMobile()` hook in `components/layout/main-layout.tsx`
- Verify responsive classes are applied (sm:, md:, lg:)
- Test with browser DevTools device emulation

## Next Steps

1. **Setup Database**: Choose and configure your database
2. **Implement tRPC**: Create API routers for tasks
3. **Replace Mock Data**: Update Zustand store to fetch from API
4. **Add Authentication**: Implement user authentication if needed
5. **Deploy**: Deploy to Vercel or your hosting platform

## Support

For issues or questions:
- Check the component files for implementation examples
- Review the schemas in `lib/schemas.ts` for data structure
- Refer to official documentation:
  - [Next.js](https://nextjs.org)
  - [shadcn/ui](https://ui.shadcn.com)
  - [Zustand](https://github.com/pmndrs/zustand)
  - [react-hook-form](https://react-hook-form.com)
  - [Zod](https://zod.dev)
