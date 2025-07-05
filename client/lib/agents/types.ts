/**
 * LAYER 1: FOUNDATION - Agent Types & Interfaces
 *
 * Constitutional Weapon System for Pro Se Warriors
 * Multi-Agent Architecture with Military-Grade Security
 */

// Case ID Format: AIC-YYYYMMDD-HHMM-XXXX
export type CaseId = string;

// Agent IDs
export enum AgentRole {
  HANDLER = "agent_0_handler", // The Frontliner - only user-facing agent
  COMMANDER = "agent_1_commander", // The Strategist - master coordinator
  RESEARCH = "agent_2_research", // Legal Research specialist
  EVIDENCE = "agent_3_evidence", // Evidence Curator
  DRAFTING = "agent_4_drafting", // Document Drafter
  TIMELINE = "agent_5_timeline", // Timeline Builder
  ENTITY = "agent_6_entity", // People & Entities Registry
  CALENDAR = "agent_7_calendar", // Court Calendar & Deadlines
  EXPORT = "agent_8_export", // Export & Backup specialist
}

// Handler Personality Types
export enum HandlerPersona {
  STRATEGIST = "strategist", // Professional & Supportive
  GUIDE = "guide", // Direct & Confident
  RAZOR = "razor", // No BS & Aggressive
  ALLY = "ally", // Balanced approach
}

// Agent Task Status
export enum TaskStatus {
  PENDING = "pending",
  IN_PROGRESS = "in_progress",
  COMPLETED = "completed",
  FAILED = "failed",
  BLOCKED = "blocked",
}

// Memory Scopes
export enum MemoryScope {
  SESSION = "session", // Wiped when user exits case
  CASE = "case", // Persistent within case ID
  TASK = "task", // Wiped after task handoff
}

// Base Agent Interface
export interface BaseAgent {
  id: AgentRole;
  name: string;
  description: string;
  currentCaseId: CaseId | null;
  status: "idle" | "active" | "error" | "blocked";
  lastActivity: Date;
}

// Agent Task Interface
export interface AgentTask {
  id: string;
  from: AgentRole;
  to: AgentRole;
  caseId: CaseId;
  type: string;
  payload: any;
  status: TaskStatus;
  createdAt: Date;
  completedAt?: Date;
  result?: any;
  error?: string;
}

// Memory Object Interface
export interface MemoryObject {
  id: string;
  caseId: CaseId;
  scope: MemoryScope;
  type: string;
  data: any;
  source: AgentRole;
  createdAt: Date;
  tags?: string[];
}

// Legal Citation Interface
export interface LegalCitation {
  id: string;
  text: string;
  shortName: string;
  fullCitation: string;
  jurisdiction: "federal" | "texas" | "local";
  binding: boolean;
  sourceUrl: string;
  verified: boolean;
  verifiedBy: AgentRole;
  verifiedAt: Date;
  caseId: CaseId;
}

// Case Isolation Enforcement
export interface CaseContext {
  caseId: CaseId;
  title: string;
  createdAt: Date;
  lastActivity: Date;
  locked: boolean;
}

// Breach Detection
export interface BreachEvent {
  id: string;
  type: "case_bleed" | "unauthorized_access" | "validation_failure";
  description: string;
  agentId: AgentRole;
  attemptedCaseId: CaseId;
  currentCaseId: CaseId | null;
  timestamp: Date;
  severity: "low" | "medium" | "high" | "critical";
}

// Handler Communication Protocol
export interface HandlerResponse {
  message: string;
  persona: HandlerPersona;
  educationalContent?: string;
  suggestions?: string[];
  awaitingUserInput: boolean;
  triggerTask?: {
    agent: AgentRole;
    type: string;
    payload: any;
  };
}

// UPL Firewall Check
export interface UPLCheck {
  message: string;
  violatesUPL: boolean;
  reason?: string;
  alternativePhrasing?: string;
}
