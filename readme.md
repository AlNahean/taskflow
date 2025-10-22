# TaskFlow: AI-Powered Task Management

![TaskFlow Banner](https://via.placeholder.com/1200x630/1a1a1a/ffffff?text=TaskFlow)

**TaskFlow** is a modern, full-stack task management application designed for productivity and ease of use. Built with a powerful tech stack including Next.js, Prisma, and Tailwind CSS, it features a rich user interface and leverages AI to streamline your workflow. From daily summaries to intelligent task suggestions, TaskFlow is your personal productivity assistant.

## ✨ Features

- **Comprehensive Task Management:** Create, edit, and delete tasks with details like status, priority, category, and due dates.
- **Sub-task Support:** Break down complex tasks into smaller, manageable steps.
- **Multiple Views:** Organize your tasks in the way that works for you with List, Card, and Kanban Board views.
- **Drag-and-Drop Board:** Intuitively update task statuses by dragging them between columns on the board.
- **AI-Powered Suggestions:** Generate actionable tasks directly from your notes with the click of a button.
- **AI Chat Assistant:** Ask natural language questions about your tasks and notes. Supports multiple models (GPT-4, Claude 3, Gemini).
- **AI Daily Summary:** Get a motivational, AI-generated summary of your tasks for the day.
- **Interactive Calendar:** A full-calendar view to visualize your schedule and plan ahead.
- **Productivity Analytics:** Track your progress with charts for task completion rates and category distribution.
- **Real-time Filtering:** Instantly filter tasks by status, priority, category, or a search query.
- **Global "Add Task" Button:** Create a new task from anywhere in the application.
- **Light & Dark Mode:** Beautifully crafted themes that adapt to your preference.
- **Settings & Data Management:** Customize default task values and export all your data to JSON.

## 🚀 Tech Stack

- **Framework:** [Next.js](https://nextjs.org/) (App Router)
- **Styling:** [Tailwind CSS](https://tailwindcss.com/) & [shadcn/ui](https://ui.shadcn.com/)
- **Database ORM:** [Prisma](https://www.prisma.io/)
- **Database:** SQLite
- **State Management:** [React Query](https://tanstack.com/query/latest) (Server State) & [Zustand](https://zustand-demo.pmnd.rs/) (Client State)
- **AI Integration:** [OpenAI API](https://openai.com/), [Anthropic API](https://www.anthropic.com/), [Google Gemini API](https://ai.google.dev/)
- **Drag & Drop:** [dnd-kit](https://dndkit.com/)
- **Form Management:** [React Hook Form](https://react-hook-form.com/) & [Zod](https://zod.dev/)
- **Deployment:** [Vercel](https://vercel.com/)

## 📸 Screenshots

\*(**Recommendation:\*** _Replace these placeholders with actual screenshots of your application. You can use a tool like Shottr or your OS's built-in screenshot utility.)_

| Dashboard                                                                           | Tasks Board                                                                         | Note Suggestions                                                                           |
| ----------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------ |
| ![Dashboard](https://via.placeholder.com/400x300/1a1a1a/ffffff?text=Dashboard+View) | ![Tasks Board](https://via.placeholder.com/400x300/1a1a1a/ffffff?text=Kanban+Board) | ![Note Suggestions](https://via.placeholder.com/400x300/1a1a1a/ffffff?text=AI+Suggestions) |

## 🏁 Getting Started

Follow these instructions to get a local copy up and running.

### Prerequisites

- [Node.js](https://nodejs.org/en/) (v18 or higher)
- [pnpm](https://pnpm.io/) (or npm/yarn)

### Installation

1.  **Clone the repository:**

    ```bash
    git clone https://github.com/YOUR_USERNAME/taskflow.git
    cd taskflow
    ```

2.  **Install dependencies:**

    ```bash
    pnpm install
    ```

3.  **Set up environment variables:**
    Create a file named `.env` in the root of the project and add the necessary API keys. You can copy the example file:

    ```bash
    cp .env.example .env
    ```

    Then, fill in the values in your new `.env` file.

4.  **Set up the database:**
    Prisma uses a local SQLite database, so setup is simple. Run the following command to apply the schema and seed the database with sample data:

    ```bash
    pnpm prisma migrate dev
    pnpm prisma db seed
    ```

5.  **Run the development server:**
    ```bash
    pnpm dev
    ```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result!

## 📜 License

This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for details.
