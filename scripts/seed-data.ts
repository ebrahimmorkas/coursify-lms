import type { Category } from "../src/lib/catalog";

export type SeedCourse = {
  title: string;
  subtitle: string;
  description: string;
  category: Category;
  level: "beginner" | "intermediate" | "advanced";
  priceCents: number;
  instructor: "sarah" | "marcus";
  videoId?: string;
  sections: { title: string; lessons: string[] }[];
};

export const seedCourses: SeedCourse[] = [
  {
    title: "Next.js 16: Build Full-Stack Apps",
    subtitle:
      "Master the App Router, Server Components and Server Actions by shipping a real product.",
    description:
      "Learn how modern React applications are built with Next.js. We cover routing, data fetching, caching, mutations with Server Actions, authentication and deployment. By the end you will have built and deployed a production-ready full-stack application.",
    category: "Web Development",
    level: "intermediate",
    priceCents: 4999,
    instructor: "sarah",
    videoId: "Sklc_fQBmcs",
    sections: [
      {
        title: "Getting started",
        lessons: [
          "Why Next.js?",
          "Project setup and folder structure",
          "Pages, layouts and routing",
        ],
      },
      {
        title: "Data fetching and rendering",
        lessons: [
          "Server Components vs Client Components",
          "Fetching data on the server",
          "Streaming with Suspense",
          "Caching and revalidation",
        ],
      },
      {
        title: "Mutations and auth",
        lessons: [
          "Server Actions and forms",
          "Validating input with Zod",
          "Session-based authentication",
        ],
      },
      {
        title: "Shipping to production",
        lessons: ["Environment variables", "Deploying with Docker"],
      },
    ],
  },
  {
    title: "TypeScript from Zero to Confident",
    subtitle: "Write safer JavaScript with types, generics and practical patterns.",
    description:
      "A practical introduction to TypeScript for JavaScript developers. You will learn the type system step by step and apply it to real-world code, from simple annotations to generics, utility types and type-safe APIs.",
    category: "Web Development",
    level: "beginner",
    priceCents: 0,
    instructor: "sarah",
    videoId: "zQnBQ4tB3ZA",
    sections: [
      {
        title: "Foundations",
        lessons: ["Installing TypeScript", "Basic types", "Functions and objects"],
      },
      {
        title: "Going deeper",
        lessons: ["Union and intersection types", "Generics in practice", "Utility types"],
      },
      { title: "Real-world TypeScript", lessons: ["Typing API responses", "Strict mode tips"] },
    ],
  },
  {
    title: "React Patterns for Scalable Frontends",
    subtitle:
      "Component architecture, state management and performance techniques used in production.",
    description:
      "Go beyond the basics of React. This course explores composition patterns, custom hooks, state colocation, context, memoization and rendering performance, with a focus on building maintainable frontends at scale.",
    category: "Web Development",
    level: "advanced",
    priceCents: 6999,
    instructor: "marcus",
    videoId: "Tn6-PIqc4UM",
    sections: [
      {
        title: "Composition",
        lessons: ["Compound components", "Render props vs hooks", "Building a headless component"],
      },
      {
        title: "State management",
        lessons: ["Where state should live", "Context without re-render storms", "Server state"],
      },
      { title: "Performance", lessons: ["Profiling renders", "Memoization done right"] },
    ],
  },
  {
    title: "Python for Data Analysis",
    subtitle: "Clean, explore and visualise data with pandas and matplotlib.",
    description:
      "Learn the core toolkit of every data analyst. We start with Python fundamentals and move on to loading, cleaning, transforming and visualising datasets with pandas and matplotlib through hands-on projects.",
    category: "Data Science",
    level: "beginner",
    priceCents: 3999,
    instructor: "marcus",
    videoId: "x7X9w_GIm1s",
    sections: [
      {
        title: "Python essentials",
        lessons: ["Variables and data types", "Lists and dictionaries", "Functions"],
      },
      {
        title: "Working with pandas",
        lessons: ["DataFrames and Series", "Cleaning messy data", "Grouping and aggregation"],
      },
      {
        title: "Visualisation",
        lessons: ["Plotting with matplotlib", "Telling stories with charts"],
      },
    ],
  },
  {
    title: "SQL & PostgreSQL Masterclass",
    subtitle: "Design schemas, write efficient queries and understand indexes.",
    description:
      "Everything you need to work confidently with relational databases. You will model data, write queries from simple selects to window functions, and learn how indexes and query plans affect performance in PostgreSQL.",
    category: "Data Science",
    level: "intermediate",
    priceCents: 5499,
    instructor: "sarah",
    videoId: "n2Fluyr3lbc",
    sections: [
      {
        title: "Modelling data",
        lessons: ["Tables and relationships", "Normalisation", "Constraints"],
      },
      {
        title: "Querying",
        lessons: [
          "Joins explained",
          "Aggregations",
          "Window functions",
          "Common table expressions",
        ],
      },
      { title: "Performance", lessons: ["How indexes work", "Reading EXPLAIN ANALYZE"] },
    ],
  },
  {
    title: "Docker & Kubernetes for Developers",
    subtitle: "Containerise applications and deploy them with confidence.",
    description:
      "Understand containers from first principles, write production-grade Dockerfiles, orchestrate services with Docker Compose and deploy to Kubernetes with deployments, services and config maps.",
    category: "DevOps",
    level: "intermediate",
    priceCents: 5999,
    instructor: "marcus",
    videoId: "Gjnup-PuquQ",
    sections: [
      {
        title: "Containers",
        lessons: ["What is a container?", "Writing a Dockerfile", "Multi-stage builds"],
      },
      { title: "Compose", lessons: ["Multi-service apps", "Volumes and networking"] },
      {
        title: "Kubernetes",
        lessons: ["Pods and deployments", "Services and ingress", "Configuration and secrets"],
      },
    ],
  },
  {
    title: "Git & GitHub Essentials",
    subtitle: "Version control workflows every developer should know.",
    description:
      "Learn Git the right way: commits, branches, merges and rebases, then collaborate on GitHub with pull requests, code reviews and protected branches.",
    category: "DevOps",
    level: "beginner",
    priceCents: 0,
    instructor: "sarah",
    videoId: "hwP7WQkmECE",
    sections: [
      {
        title: "Local workflow",
        lessons: ["Commits and history", "Branching", "Merging and conflicts"],
      },
      { title: "Collaboration", lessons: ["Pull requests", "Code review etiquette"] },
    ],
  },
  {
    title: "UI Design Fundamentals",
    subtitle: "Typography, colour, spacing and layout for developers.",
    description:
      "A design course for people who build interfaces. Learn the principles behind clean, accessible user interfaces and apply them to real screens using a simple, repeatable process.",
    category: "Design",
    level: "beginner",
    priceCents: 2999,
    instructor: "marcus",
    sections: [
      {
        title: "Principles",
        lessons: ["Visual hierarchy", "Typography basics", "Colour and contrast"],
      },
      { title: "Layout", lessons: ["Spacing systems", "Grids", "Designing responsive screens"] },
    ],
  },
  {
    title: "Building Mobile Apps with React Native",
    subtitle: "Ship cross-platform iOS and Android apps with one codebase.",
    description:
      "Use your React knowledge to build native mobile apps. Covers navigation, styling, device APIs, offline storage and publishing to the app stores.",
    category: "Mobile Development",
    level: "intermediate",
    priceCents: 5999,
    instructor: "sarah",
    sections: [
      { title: "Foundations", lessons: ["Setting up Expo", "Core components", "Styling"] },
      {
        title: "App features",
        lessons: ["Navigation", "Working with device APIs", "Offline storage"],
      },
      { title: "Release", lessons: ["Building for production", "Publishing to the stores"] },
    ],
  },
  {
    title: "Product Management for Engineers",
    subtitle: "Prioritise, plan and communicate like a product leader.",
    description:
      "Engineers who understand product make better decisions. Learn discovery, prioritisation frameworks, writing specs and measuring outcomes.",
    category: "Business",
    level: "beginner",
    priceCents: 1999,
    instructor: "marcus",
    sections: [
      { title: "Discovery", lessons: ["Understanding users", "Defining problems"] },
      {
        title: "Delivery",
        lessons: ["Prioritisation frameworks", "Writing a good spec", "Measuring success"],
      },
    ],
  },
];

export const reviewComments = [
  "Clear explanations and great pacing. Exactly what I needed.",
  "The practical examples made everything click for me.",
  "Solid course. Some sections could go deeper, but overall excellent.",
  "One of the best courses I have taken on this topic.",
  "Well structured and easy to follow. Highly recommended.",
  "Good content, though I would love more exercises.",
  "The instructor explains complex topics in a simple way.",
  "Worth every minute. I applied what I learned at work the same week.",
];

export const studentNames = [
  "Aisha Khan",
  "Liam Walker",
  "Sofia Rossi",
  "Noah Kim",
  "Emma Fischer",
  "Omar Haddad",
  "Mia Novak",
  "Lucas Silva",
  "Chloe Martin",
  "Ethan Park",
  "Zara Ahmed",
  "Daniel Moore",
  "Hannah Lee",
  "Arjun Patel",
  "Grace Turner",
];
