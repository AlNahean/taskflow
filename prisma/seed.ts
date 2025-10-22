// File: E:/projects/sorties/task-management/task-manager-app/prisma/seed.ts
import {
  PrismaClient,
  TaskStatus,
  TaskPriority,
  TaskCategory,
} from "@prisma/client";
import { addDays, subDays } from "date-fns";

const prisma = new PrismaClient();

async function main() {
  console.log(`Start seeding ...`);

  // Clear existing data
  await prisma.subTask.deleteMany();
  console.log("Deleted existing subtasks.");
  await prisma.suggestedTask.deleteMany();
  console.log("Deleted existing suggested tasks.");
  await prisma.note.deleteMany();
  console.log("Deleted existing notes.");
  await prisma.task.deleteMany();
  console.log("Deleted existing tasks.");

  const today = new Date();

  // --- Seed Notes ---
  console.log("Seeding notes...");
  const notes = [
    {
      title: "Q4 Marketing Strategy Meeting",
      content:
        "Meeting recap from today:\n- Finalize the budget for the new ad campaign by next Wednesday.\n- Sarah needs to prepare the presentation slides for the client meeting in two weeks.\n- The team needs to brainstorm a new slogan for the 'Project Phoenix' launch. This is urgent.\n- Also, I need to remember to order new business cards for myself.",
    },
    {
      title: "Weekend Plans & Errands",
      content:
        "- Must go grocery shopping tomorrow morning. Need milk, eggs, and bread.\n- The car needs its annual service, I should book an appointment for sometime next week.\n- Plan a hike for Saturday if the weather is good.\n- Finish reading 'Atomic Habits' by the end of the month.",
    },
    {
      title: "Health & Fitness Goals",
      content:
        "Doctor's appointment is scheduled for the 5th of next month. It's a high priority check-up. I also need to refill my prescription before then. My goal is to go to the gym 3 times this week.",
    },
    {
      title: "Project Ideas",
      content:
        "A simple idea for a new app: a personal CRM. Could start by designing the database schema and then creating the basic UI mockups. Maybe a low priority side project for now.",
    },
  ];

  for (const note of notes) {
    await prisma.note.create({
      data: note,
    });
  }
  console.log(`${notes.length} notes seeded.`);

  // --- Seed Tasks ---
  console.log("Seeding tasks...");
  const tasks = [
    // Work
    {
      title: "Finalize quarterly report",
      status: TaskStatus.in_progress,
      priority: TaskPriority.high,
      category: TaskCategory.work,
      daysFromNow: 5,
      subtasks: [
        { text: "Compile sales data", completed: true },
        { text: "Draft executive summary", completed: false },
        { text: "Review with finance team", completed: false },
      ],
    },
    {
      title: "Prepare for team meeting",
      status: TaskStatus.todo,
      priority: TaskPriority.medium,
      category: TaskCategory.work,
      daysFromNow: 1,
    },
    {
      title: "Review project proposal",
      status: TaskStatus.completed,
      priority: TaskPriority.high,
      category: TaskCategory.work,
      daysFromNow: -2,
    },
    {
      title: "Onboard new hire",
      status: TaskStatus.in_progress,
      priority: TaskPriority.medium,
      category: TaskCategory.work,
      daysFromNow: 10,
      subtasks: [
        { text: "Set up hardware", completed: true },
        { text: "Grant system access", completed: true },
        { text: "Schedule team introductions", completed: false },
      ],
    },
    {
      title: "Update client on project status",
      status: TaskStatus.todo,
      priority: TaskPriority.high,
      category: TaskCategory.work,
      daysFromNow: 0,
    },
    {
      title: "Debug production issue",
      status: TaskStatus.overdue,
      priority: TaskPriority.high,
      category: TaskCategory.work,
      daysFromNow: -1,
    },
    {
      title: "Brainstorm for new feature",
      status: TaskStatus.todo,
      priority: TaskPriority.low,
      category: TaskCategory.work,
      daysFromNow: 7,
    },
    {
      title: "Organize team-building event",
      status: TaskStatus.todo,
      priority: TaskPriority.low,
      category: TaskCategory.work,
      daysFromNow: 30,
    },
    {
      title: "Write documentation for API",
      status: TaskStatus.in_progress,
      priority: TaskPriority.medium,
      category: TaskCategory.work,
      daysFromNow: 12,
    },
    {
      title: "Performance review self-assessment",
      status: TaskStatus.todo,
      priority: TaskPriority.medium,
      category: TaskCategory.work,
      daysFromNow: 4,
    },
    {
      title: "Submit expense report",
      status: TaskStatus.completed,
      priority: TaskPriority.low,
      category: TaskCategory.work,
      daysFromNow: -3,
    },
    {
      title: "Research new marketing strategies",
      status: TaskStatus.in_progress,
      priority: TaskPriority.medium,
      category: TaskCategory.work,
      daysFromNow: 18,
    },
    {
      title: "Create presentation for stakeholders",
      status: TaskStatus.in_progress,
      priority: TaskPriority.high,
      category: TaskCategory.work,
      daysFromNow: 3,
      subtasks: [
        { text: "Gather Q3 metrics", completed: true },
        { text: "Create slide deck", completed: false },
        { text: "Rehearse presentation", completed: false },
      ],
    },
    {
      title: "Follow up with potential clients",
      status: TaskStatus.todo,
      priority: TaskPriority.high,
      category: TaskCategory.work,
      daysFromNow: 1,
    },
    {
      title: "Update company website content",
      status: TaskStatus.todo,
      priority: TaskPriority.low,
      category: TaskCategory.work,
      daysFromNow: 9,
    },
    {
      title: "Test new software update",
      status: TaskStatus.in_progress,
      priority: TaskPriority.medium,
      category: TaskCategory.work,
      daysFromNow: 2,
    },
    {
      title: "Analyze competitor products",
      status: TaskStatus.todo,
      priority: TaskPriority.low,
      category: TaskCategory.work,
      daysFromNow: 25,
    },
    {
      title: "Set up new development environment",
      status: TaskStatus.completed,
      priority: TaskPriority.medium,
      category: TaskCategory.work,
      daysFromNow: -5,
    },
    {
      title: "Interview candidate for designer role",
      status: TaskStatus.todo,
      priority: TaskPriority.high,
      category: TaskCategory.work,
      daysFromNow: 2,
    },
    {
      title: "Review Q3 budget proposals",
      status: TaskStatus.overdue,
      priority: TaskPriority.high,
      category: TaskCategory.work,
      daysFromNow: -3,
    },

    // Personal
    {
      title: "Plan weekend trip",
      status: TaskStatus.todo,
      priority: TaskPriority.low,
      category: TaskCategory.personal,
      daysFromNow: 14,
    },
    {
      title: "Read a chapter of a book",
      status: TaskStatus.in_progress,
      priority: TaskPriority.low,
      category: TaskCategory.personal,
      daysFromNow: 0,
    },
    {
      title: "Call parents",
      status: TaskStatus.todo,
      priority: TaskPriority.medium,
      category: TaskCategory.personal,
      daysFromNow: 0,
    },
    {
      title: "Organize digital files",
      status: TaskStatus.todo,
      priority: TaskPriority.low,
      category: TaskCategory.personal,
      daysFromNow: 7,
    },
    {
      title: "Learn a new song on guitar",
      status: TaskStatus.in_progress,
      priority: TaskPriority.low,
      category: TaskCategory.personal,
      daysFromNow: 20,
    },
    {
      title: "Water the plants",
      status: TaskStatus.completed,
      priority: TaskPriority.low,
      category: TaskCategory.personal,
      daysFromNow: -1,
    },
    {
      title: "Clean the apartment",
      status: TaskStatus.todo,
      priority: TaskPriority.medium,
      category: TaskCategory.personal,
      daysFromNow: 2,
      subtasks: [
        { text: "Clean the kitchen", completed: false },
        { text: "Vacuum the floors", completed: false },
        { text: "Wipe down bathroom", completed: false },
      ],
    },
    {
      title: "Watch a documentary",
      status: TaskStatus.todo,
      priority: TaskPriority.low,
      category: TaskCategory.personal,
      daysFromNow: 3,
    },
    {
      title: "Write in journal",
      status: TaskStatus.completed,
      priority: TaskPriority.low,
      category: TaskCategory.personal,
      daysFromNow: 0,
    },
    {
      title: "Pay electricity bill",
      status: TaskStatus.completed,
      priority: TaskPriority.high,
      category: TaskCategory.personal,
      daysFromNow: -4,
    },
    {
      title: "Fix leaky faucet",
      status: TaskStatus.overdue,
      priority: TaskPriority.medium,
      category: TaskCategory.personal,
      daysFromNow: -5,
    },
    {
      title: "Sort out closet",
      status: TaskStatus.todo,
      priority: TaskPriority.medium,
      category: TaskCategory.personal,
      daysFromNow: 11,
    },
    {
      title: "Plan birthday party",
      status: TaskStatus.in_progress,
      priority: TaskPriority.high,
      category: TaskCategory.personal,
      daysFromNow: 40,
      subtasks: [
        { text: "Create guest list", completed: true },
        { text: "Book venue", completed: false },
        { text: "Send invitations", completed: false },
      ],
    },
    {
      title: "Backup computer files",
      status: TaskStatus.todo,
      priority: TaskPriority.medium,
      category: TaskCategory.personal,
      daysFromNow: 6,
    },
    {
      title: "Renew library card",
      status: TaskStatus.todo,
      priority: TaskPriority.low,
      category: TaskCategory.personal,
      daysFromNow: 8,
    },
    {
      title: "Do laundry",
      status: TaskStatus.completed,
      priority: TaskPriority.medium,
      category: TaskCategory.personal,
      daysFromNow: -1,
    },
    {
      title: "Research new hobbies",
      status: TaskStatus.todo,
      priority: TaskPriority.low,
      category: TaskCategory.personal,
      daysFromNow: 15,
    },
    {
      title: "Meditate for 10 minutes",
      status: TaskStatus.completed,
      priority: TaskPriority.medium,
      category: TaskCategory.personal,
      daysFromNow: 0,
    },
    {
      title: "Update personal budget",
      status: TaskStatus.todo,
      priority: TaskPriority.medium,
      category: TaskCategory.personal,
      daysFromNow: 5,
    },
    {
      title: "Cancel unused subscriptions",
      status: TaskStatus.todo,
      priority: TaskPriority.medium,
      category: TaskCategory.personal,
      daysFromNow: 3,
    },

    // Shopping
    {
      title: "Buy groceries for the week",
      status: TaskStatus.todo,
      priority: TaskPriority.medium,
      category: TaskCategory.shopping,
      daysFromNow: 0,
      subtasks: [
        { text: "Milk", completed: false },
        { text: "Eggs", completed: false },
        { text: "Bread", completed: false },
        { text: "Chicken", completed: false },
      ],
    },
    {
      title: "Order new running shoes",
      status: TaskStatus.todo,
      priority: TaskPriority.medium,
      category: TaskCategory.shopping,
      daysFromNow: 1,
    },
    {
      title: "Get a birthday gift for Sarah",
      status: TaskStatus.in_progress,
      priority: TaskPriority.high,
      category: TaskCategory.shopping,
      daysFromNow: 3,
    },
    {
      title: "Buy new light bulbs",
      status: TaskStatus.completed,
      priority: TaskPriority.low,
      category: TaskCategory.shopping,
      daysFromNow: -6,
    },
    {
      title: "Purchase plane tickets for vacation",
      status: TaskStatus.todo,
      priority: TaskPriority.high,
      category: TaskCategory.shopping,
      daysFromNow: 7,
    },
    {
      title: "Find a new desk chair",
      status: TaskStatus.in_progress,
      priority: TaskPriority.medium,
      category: TaskCategory.shopping,
      daysFromNow: 10,
    },
    {
      title: "Buy pet food",
      status: TaskStatus.todo,
      priority: TaskPriority.medium,
      category: TaskCategory.shopping,
      daysFromNow: 0,
    },
    {
      title: "Get winter coat",
      status: TaskStatus.todo,
      priority: TaskPriority.medium,
      category: TaskCategory.shopping,
      daysFromNow: 50,
    },
    {
      title: "Order new books",
      status: TaskStatus.completed,
      priority: TaskPriority.low,
      category: TaskCategory.shopping,
      daysFromNow: -10,
    },
    {
      title: "Shop for a new laptop",
      status: TaskStatus.in_progress,
      priority: TaskPriority.high,
      category: TaskCategory.shopping,
      daysFromNow: 22,
    },
    {
      title: "Buy kitchen utensils",
      status: TaskStatus.todo,
      priority: TaskPriority.low,
      category: TaskCategory.shopping,
      daysFromNow: 4,
    },
    {
      title: "Return online order",
      status: TaskStatus.todo,
      priority: TaskPriority.medium,
      category: TaskCategory.shopping,
      daysFromNow: 1,
    },
    {
      title: "Get new batteries",
      status: TaskStatus.completed,
      priority: TaskPriority.low,
      category: TaskCategory.shopping,
      daysFromNow: -3,
    },
    {
      title: "Buy home decor items",
      status: TaskStatus.todo,
      priority: TaskPriority.low,
      category: TaskCategory.shopping,
      daysFromNow: 13,
    },
    {
      title: "Purchase gardening supplies",
      status: TaskStatus.todo,
      priority: TaskPriority.medium,
      category: TaskCategory.shopping,
      daysFromNow: 16,
    },
    {
      title: "Get ingredients for baking cake",
      status: TaskStatus.todo,
      priority: TaskPriority.medium,
      category: TaskCategory.shopping,
      daysFromNow: 2,
    },
    {
      title: "Buy new headphones",
      status: TaskStatus.in_progress,
      priority: TaskPriority.medium,
      category: TaskCategory.shopping,
      daysFromNow: 1,
    },
    {
      title: "Find a deal on a new TV",
      status: TaskStatus.in_progress,
      priority: TaskPriority.low,
      category: TaskCategory.shopping,
      daysFromNow: 35,
    },
    {
      title: "Pick up dry cleaning",
      status: TaskStatus.todo,
      priority: TaskPriority.medium,
      category: TaskCategory.shopping,
      daysFromNow: 1,
    },
    {
      title: "Get new workout clothes",
      status: TaskStatus.todo,
      priority: TaskPriority.low,
      category: TaskCategory.shopping,
      daysFromNow: 8,
    },

    // Health
    {
      title: "Schedule dentist appointment",
      status: TaskStatus.todo,
      priority: TaskPriority.medium,
      category: TaskCategory.health,
      daysFromNow: 10,
    },
    {
      title: "Go for a 30-minute run",
      status: TaskStatus.completed,
      priority: TaskPriority.medium,
      category: TaskCategory.health,
      daysFromNow: -1,
    },
    {
      title: "Annual physical check-up",
      status: TaskStatus.todo,
      priority: TaskPriority.high,
      category: TaskCategory.health,
      daysFromNow: 45,
    },
    {
      title: "Refill prescription",
      status: TaskStatus.todo,
      priority: TaskPriority.high,
      category: TaskCategory.health,
      daysFromNow: 2,
    },
    {
      title: "Meal prep for the week",
      status: TaskStatus.in_progress,
      priority: TaskPriority.medium,
      category: TaskCategory.health,
      daysFromNow: 0,
      subtasks: [
        { text: "Chop vegetables", completed: true },
        { text: "Cook chicken breast", completed: false },
        { text: "Portion into containers", completed: false },
      ],
    },
    {
      title: "Yoga session",
      status: TaskStatus.todo,
      priority: TaskPriority.low,
      category: TaskCategory.health,
      daysFromNow: 1,
    },
    {
      title: "Drink 8 glasses of water",
      status: TaskStatus.completed,
      priority: TaskPriority.low,
      category: TaskCategory.health,
      daysFromNow: 0,
    },
    {
      title: "Go to the gym",
      status: TaskStatus.in_progress,
      priority: TaskPriority.medium,
      category: TaskCategory.health,
      daysFromNow: 0,
    },
    {
      title: "Get a flu shot",
      status: TaskStatus.todo,
      priority: TaskPriority.medium,
      category: TaskCategory.health,
      daysFromNow: 28,
    },
    {
      title: "Schedule eye exam",
      status: TaskStatus.overdue,
      priority: TaskPriority.medium,
      category: TaskCategory.health,
      daysFromNow: -15,
    },
    {
      title: "Try a new healthy recipe",
      status: TaskStatus.todo,
      priority: TaskPriority.low,
      category: TaskCategory.health,
      daysFromNow: 3,
    },
    {
      title: "Stretch for 15 minutes",
      status: TaskStatus.completed,
      priority: TaskPriority.low,
      category: TaskCategory.health,
      daysFromNow: 0,
    },
    {
      title: "Go for a bike ride",
      status: TaskStatus.todo,
      priority: TaskPriority.medium,
      category: TaskCategory.health,
      daysFromNow: 4,
    },
    {
      title: "Research new vitamins",
      status: TaskStatus.todo,
      priority: TaskPriority.low,
      category: TaskCategory.health,
      daysFromNow: 9,
    },
    {
      title: "Take a mental health day",
      status: TaskStatus.todo,
      priority: TaskPriority.medium,
      category: TaskCategory.health,
      daysFromNow: 17,
    },
    {
      title: "Consult with a nutritionist",
      status: TaskStatus.todo,
      priority: TaskPriority.medium,
      category: TaskCategory.health,
      daysFromNow: 33,
    },
    {
      title: "Cut down on sugar intake",
      status: TaskStatus.in_progress,
      priority: TaskPriority.medium,
      category: TaskCategory.health,
      daysFromNow: 30,
    },
    {
      title: "Track daily calorie intake",
      status: TaskStatus.in_progress,
      priority: TaskPriority.low,
      category: TaskCategory.health,
      daysFromNow: 7,
    },
    {
      title: "Go hiking this weekend",
      status: TaskStatus.todo,
      priority: TaskPriority.medium,
      category: TaskCategory.health,
      daysFromNow: 5,
    },
    {
      title: "Get 8 hours of sleep",
      status: TaskStatus.in_progress,
      priority: TaskPriority.high,
      category: TaskCategory.health,
      daysFromNow: 0,
    },

    // Other
    {
      title: "Volunteer at the animal shelter",
      status: TaskStatus.todo,
      priority: TaskPriority.medium,
      category: TaskCategory.other,
      daysFromNow: 19,
    },
    {
      title: "Take car for service",
      status: TaskStatus.todo,
      priority: TaskPriority.high,
      category: TaskCategory.other,
      daysFromNow: 11,
      subtasks: [
        { text: "Oil change", completed: false },
        { text: "Tire rotation", completed: false },
      ],
    },
    {
      title: "Attend community meeting",
      status: TaskStatus.completed,
      priority: TaskPriority.low,
      category: TaskCategory.other,
      daysFromNow: -7,
    },
    {
      title: "Donate old clothes",
      status: TaskStatus.todo,
      priority: TaskPriority.low,
      category: TaskCategory.other,
      daysFromNow: 24,
    },
    {
      title: "File taxes",
      status: TaskStatus.overdue,
      priority: TaskPriority.high,
      category: TaskCategory.other,
      daysFromNow: -60,
    },
    {
      title: "Walk the dog",
      status: TaskStatus.completed,
      priority: TaskPriority.medium,
      category: TaskCategory.other,
      daysFromNow: 0,
    },
    {
      title: "Attend a webinar on investing",
      status: TaskStatus.todo,
      priority: TaskPriority.low,
      category: TaskCategory.other,
      daysFromNow: 6,
    },
    {
      title: "Clean the garage",
      status: TaskStatus.todo,
      priority: TaskPriority.medium,
      category: TaskCategory.other,
      daysFromNow: 26,
    },
    {
      title: "Mow the lawn",
      status: TaskStatus.completed,
      priority: TaskPriority.low,
      category: TaskCategory.other,
      daysFromNow: -4,
    },
    {
      title: "Take a photography class",
      status: TaskStatus.in_progress,
      priority: TaskPriority.low,
      category: TaskCategory.other,
      daysFromNow: 38,
    },
  ];

  const descriptions: Record<TaskCategory, (string | null)[]> = {
    work: [
      "Critical for the Q3 review.",
      "Follow up with the marketing team.",
      "Needs to be done before the client call.",
      "Check the latest requirements document.",
      "Awaiting feedback from John.",
      null,
    ],
    personal: [
      "Do this in the evening.",
      "Remember to call back if no answer.",
      "Set a reminder for this.",
      "This is a recurring task.",
      null,
    ],
    shopping: [
      "Check for discounts online first.",
      "Don't forget to use the coupon.",
      "Get the organic version if available.",
      "Compare prices between stores.",
      null,
    ],
    health: [
      "Schedule for the morning.",
      "Need to confirm insurance coverage.",
      "Don't skip this one.",
      "Track progress in the app.",
      null,
    ],
    other: [
      "Coordinate with family members.",
      "Check the weather forecast.",
      "Requires advance booking.",
      "Gather all necessary documents.",
      null,
    ],
  };

  const getRandomItem = <T>(arr: T[]): T =>
    arr[Math.floor(Math.random() * arr.length)];

  for (const task of tasks) {
    const dueDate = addDays(today, task.daysFromNow);
    const startDate = subDays(
      dueDate,
      Math.floor(
        Math.random() * (task.daysFromNow > 0 ? task.daysFromNow : 5)
      ) + 1
    );

    await prisma.task.create({
      data: {
        title: task.title,
        description: getRandomItem(descriptions[task.category]),
        status: task.status,
        priority: task.priority,
        category: task.category,
        startDate: startDate,
        dueDate: dueDate,
        subtasks: task.subtasks
          ? {
              create: task.subtasks,
            }
          : undefined,
      },
    });
  }
  console.log(`${tasks.length} tasks seeded.`);

  console.log(`Seeding finished.`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
