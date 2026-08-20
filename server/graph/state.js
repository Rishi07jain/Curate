import { Annotation } from "@langchain/langgraph";

// This defines the "shape" of the shared state object that every node
// in our graph reads from and writes to. Think of it as a strongly-typed
// version of that "delivery box" analogy.
//
// Each field needs a `reducer` function that tells LangGraph HOW to merge
// a node's returned value into the existing state. `(x, y) => y` just means
// "replace the old value with whatever the node returns" — the simplest case.

export const CurateState = Annotation.Root({
  // ---- Inputs (set once, at graph invocation) ----
  jobDescription: Annotation({
    reducer: (x, y) => y ?? x,
    default: () => "",
  }),
  companyName: Annotation({
    reducer: (x, y) => y ?? x,
    default: () => "",
  }),
  companyUrl: Annotation({
    reducer: (x, y) => y ?? x,
    default: () => "",
  }),

  // ---- Filled in by the Extraction Agent (our first node) ----
  techStack: Annotation({
    reducer: (x, y) => y ?? x,
    default: () => [],
  }),
  domain: Annotation({
    reducer: (x, y) => y ?? x,
    default: () => "",
  }),
  seniority: Annotation({
    reducer: (x, y) => y ?? x,
    default: () => "",
  }),

  // ---- Filled in by the Project Architecture Agent ----
  projects: Annotation({
    reducer: (x, y) => y ?? x,
    default: () => [],
  }),

  // ---- Filled in by the LaTeX Formatter Agent ----
  formattedProjects: Annotation({
    reducer: (x, y) => y ?? x,
    default: () => [],
  }),

  // ---- Filled in by the Review Intelligence Agent ----
  rawReviews: Annotation({
    reducer: (x, y) => y ?? x,
    default: () => [],
  }),

  // ---- Filled in by the Sentiment & Feedback Summarizer Agent ----
  reviewSummary: Annotation({
    reducer: (x, y) => y ?? x,
    default: () => null,
  }),
});