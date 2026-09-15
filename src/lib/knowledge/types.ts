export type RoleLens = "business" | "ux" | "qa" | "engineering";

export type JourneyId = "checkout" | "payroll-api" | "registration" | "catalog";

export type Confidence = "high" | "medium" | "low";

export type SourceKind =
  | "code"
  | "jira"
  | "confluence"
  | "ux"
  | "test"
  | "release";

export type SourceRef = {
  id: string;
  title: string;
  kind: SourceKind;
  path: string;
  note?: string;
};

export type KnowledgeSection = {
  title: string;
  items: string[];
};

export type ConflictNote = {
  topic: string;
  statements: string[];
  action: string;
};

export type KnowledgeGap = {
  topic: string;
  detail: string;
};

export type KnowledgeAnswer = {
  useCase:
    | "functionality"
    | "rules"
    | "ux"
    | "edge"
    | "impact"
    | "decision"
    | "context-pack"
    | "fallback";
  title: string;
  summary: string;
  sections: KnowledgeSection[];
  sources: SourceRef[];
  conflicts: ConflictNote[];
  gaps: KnowledgeGap[];
  confidence: Confidence;
  ownership?: string[];
};

export type ChatRole = "user" | "assistant";

export type ChatMessage = {
  id: string;
  role: ChatRole;
  text?: string;
  answer?: KnowledgeAnswer;
  createdAt: number;
};

export type JourneyMeta = {
  id: JourneyId;
  label: string;
  status: "pilot" | "candidate" | "benchmark";
  blurb: string;
};
