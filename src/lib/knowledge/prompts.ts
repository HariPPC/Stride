import type { JourneyMeta, RoleLens } from "./types";

export const journeys: JourneyMeta[] = [
  {
    id: "checkout",
    label: "Checkout",
    status: "pilot",
    blurb: "High-impact journey with rules, UX states, and dependencies.",
  },
  {
    id: "payroll-api",
    label: "Payroll API",
    status: "benchmark",
    blurb: "Validation benchmark for knowledge accuracy and traceability.",
  },
  {
    id: "registration",
    label: "Registration",
    status: "candidate",
    blurb: "Decision logic and customer-state handling.",
  },
  {
    id: "catalog",
    label: "Catalog visibility",
    status: "candidate",
    blurb: "Client / user-group variations and dependency discovery.",
  },
];

export const roleLenses: { id: RoleLens; label: string; hint: string }[] = [
  { id: "business", label: "Business", hint: "Outcomes & policy" },
  { id: "ux", label: "UX", hint: "Screens & states" },
  { id: "qa", label: "QA", hint: "Exceptions & tests" },
  { id: "engineering", label: "Engineering", hint: "Modules & APIs" },
];

export const starterPrompts = [
  {
    label: "How Checkout works",
    prompt: "How does Checkout currently work?",
    useCase: "Functionality",
  },
  {
    label: "Payment rules",
    prompt: "What rules determine whether a customer can proceed to payment?",
    useCase: "Business rules",
  },
  {
    label: "Screens & errors",
    prompt: "Show the existing Checkout screens and error states.",
    useCase: "UX discovery",
  },
  {
    label: "Edge cases",
    prompt: "What known edge cases exist for this Checkout flow?",
    useCase: "Edge cases",
  },
  {
    label: "Change impact",
    prompt: "If we change this Checkout validation, what else may be affected?",
    useCase: "Impact",
  },
  {
    label: "Context pack",
    prompt: "Prepare a discovery context pack for Checkout.",
    useCase: "Discovery brief",
  },
] as const;
