// AI Counsel Application Types

export interface Case {
  id: string;
  title: string;
  description?: string;
  createdAt: Date;
  updatedAt: Date;
  status: "active" | "filing" | "litigation" | "closed";
  jurisdiction?: string;
  court?: string;
  timeline: TimelineFact[];
  evidence: EvidenceFile[];
  persons: Person[];
  sources: LegalSource[];
  documents: GeneratedDocument[];
  deadlines: Deadline[];
  notes: CaseNote[];
}

export interface TimelineFact {
  id: string;
  factNumber: number;
  timestamp: Date;
  description: string;
  originalStatement?: string;
  translatedStatement?: string;
  verified: boolean;
  evidenceIds: string[];
  personIds: string[];
  legalConcepts: string[];
  createdAt: Date;
}

export interface EvidenceFile {
  id: string;
  fileName: string;
  fileType: string;
  fileSize: number;
  uploadedAt: Date;
  extractedText?: string;
  factIds: string[];
  tags: string[];
  redacted: boolean;
}

export interface Person {
  id: string;
  name: string;
  role:
    | "plaintiff"
    | "defendant"
    | "witness"
    | "officer"
    | "official"
    | "other";
  affiliation?: string;
  badgeNumber?: string;
  contactInfo?: string;
  factIds: string[];
  notes?: string;
}

export interface LegalSource {
  id: string;
  type: "case" | "statute" | "constitutional" | "regulation";
  citation: string;
  title: string;
  summary: string;
  url?: string;
  relevantFacts: string[];
  addedAt: Date;
}

export interface GeneratedDocument {
  id: string;
  type: "complaint" | "motion" | "response" | "letter" | "form";
  title: string;
  content: string;
  status: "draft" | "reviewed" | "finalized" | "filed";
  createdAt: Date;
  finalizedAt?: Date;
  courtRequirements?: string[];
}

export interface Deadline {
  id: string;
  title: string;
  dueDate: Date;
  type: "filing" | "response" | "hearing" | "discovery" | "custom";
  completed: boolean;
  description?: string;
  associatedDocument?: string;
  priority: "low" | "medium" | "high" | "critical";
}

export interface CaseNote {
  id: string;
  content: string;
  createdAt: Date;
  private: boolean;
  tags: string[];
}

export interface AIPersona {
  id: string;
  name: string;
  description: string;
  chatTone: string;
  draftingStyle: string;
}

export interface InterviewSession {
  id: string;
  caseId: string;
  type: "fact-verification" | "document-review" | "legal-analysis";
  currentStep: number;
  totalSteps: number;
  inProgress: boolean;
  responses: InterviewResponse[];
}

export interface InterviewResponse {
  question: string;
  answer: string;
  legalConcept?: string;
  suggestedRevision?: string;
  approved: boolean;
}

export interface VisualizationMode {
  id: string;
  name: string;
  description: string;
  type: "chronology" | "relationship" | "evidence-matrix";
}

export interface TaskChecklistItem {
  id: string;
  title: string;
  description: string;
  type: "task" | "document";
  completed: boolean;
  required: boolean;
  courtSpecific: boolean;
  dependencies: string[];
}
