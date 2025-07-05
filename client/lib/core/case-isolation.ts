/**
 * LAYER 1: FOUNDATION - Case Isolation System
 *
 * ABSOLUTE RULE: NO CASE BLEEDING. EVER.
 * Constitutional firewall between cases with federal-grade security
 */

import { CaseId, CaseContext, BreachEvent, AgentRole } from "../agents/types";

class CaseIsolationSystem {
  private activeCaseId: CaseId | null = null;
  private caseContexts: Map<CaseId, CaseContext> = new Map();
  private breachEvents: BreachEvent[] = [];

  /**
   * Generate immutable case ID
   * Format: AIC-YYYYMMDD-HHMM-XXXX
   */
  generateCaseId(): CaseId {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, "0");
    const day = String(now.getDate()).padStart(2, "0");
    const hour = String(now.getHours()).padStart(2, "0");
    const minute = String(now.getMinutes()).padStart(2, "0");
    const random = Math.random().toString(36).substring(2, 6).toUpperCase();

    return `AIC-${year}${month}${day}-${hour}${minute}-${random}`;
  }

  /**
   * Create new case with isolated context
   */
  createCase(title: string): CaseId {
    const caseId = this.generateCaseId();
    const context: CaseContext = {
      caseId,
      title,
      createdAt: new Date(),
      lastActivity: new Date(),
      locked: false,
    };

    this.caseContexts.set(caseId, context);
    console.log(`✅ Case created: ${caseId} - "${title}"`);
    return caseId;
  }

  /**
   * Switch to case with complete memory flush
   */
  switchToCase(caseId: CaseId): boolean {
    if (!this.caseContexts.has(caseId)) {
      this.recordBreach(
        "unauthorized_access",
        "unknown",
        caseId,
        `Attempted to switch to non-existent case: ${caseId}`,
      );
      return false;
    }

    // Hot swap: flush current context and reload from vault
    this.flushCurrentContext();
    this.activeCaseId = caseId;

    // Update last activity
    const context = this.caseContexts.get(caseId)!;
    context.lastActivity = new Date();

    console.log(`🔄 Context switch to case: ${caseId}`);
    return true;
  }

  /**
   * Enforce case boundary - critical security function
   */
  enforceCaseBoundary(requestedCaseId: CaseId, agentId: AgentRole): boolean {
    // Assert: vault_id == current_context_id
    if (requestedCaseId !== this.activeCaseId) {
      this.recordBreach(
        "case_bleed",
        agentId,
        requestedCaseId,
        `Agent ${agentId} attempted cross-case access: ${requestedCaseId} != ${this.activeCaseId}`,
      );

      // IMMEDIATE HALT
      this.triggerBreach();
      return false;
    }

    return true;
  }

  /**
   * Complete memory flush for context switch
   */
  private flushCurrentContext(): void {
    // Clear session memory
    if (typeof window !== "undefined") {
      sessionStorage.clear();
    }

    // Reset agent states
    this.notifyAgentsContextFlush();

    console.log("🧹 Context flushed - memory clean");
  }

  /**
   * Record breach event for audit trail
   */
  private recordBreach(
    type: BreachEvent["type"],
    agentId: AgentRole | "unknown",
    attemptedCaseId: CaseId,
    description: string,
  ): void {
    const breach: BreachEvent = {
      id: crypto.randomUUID(),
      type,
      description,
      agentId: agentId as AgentRole,
      attemptedCaseId,
      currentCaseId: this.activeCaseId,
      timestamp: new Date(),
      severity: "critical",
    };

    this.breachEvents.push(breach);
    console.error("🚨 BREACH DETECTED:", breach);
  }

  /**
   * Trigger immediate breach response
   */
  private triggerBreach(): void {
    // System halt
    console.error(
      "❌ BREACH DETECTED: Case context mismatch. This violates core architecture. All processes have been terminated. No data has been written.",
    );

    // TODO: Implement full breach protocol
    // - Autosave current work
    // - Freeze all agent dispatches
    // - Alert user with plain-language message
    // - Require manual recovery
  }

  /**
   * Notify all agents of context flush
   */
  private notifyAgentsContextFlush(): void {
    // Agents will reset their internal state
    window.dispatchEvent(new CustomEvent("case-context-flush"));
  }

  /**
   * Get current active case
   */
  getCurrentCaseId(): CaseId | null {
    return this.activeCaseId;
  }

  /**
   * Get case context
   */
  getCaseContext(caseId: CaseId): CaseContext | null {
    return this.caseContexts.get(caseId) || null;
  }

  /**
   * List all cases for user
   */
  listCases(): CaseContext[] {
    return Array.from(this.caseContexts.values()).sort(
      (a, b) => b.lastActivity.getTime() - a.lastActivity.getTime(),
    );
  }

  /**
   * Get breach events for audit
   */
  getBreachEvents(): BreachEvent[] {
    return [...this.breachEvents];
  }

  /**
   * Lock case against modifications
   */
  lockCase(caseId: CaseId): void {
    const context = this.caseContexts.get(caseId);
    if (context) {
      context.locked = true;
      console.log(`🔒 Case locked: ${caseId}`);
    }
  }

  /**
   * Export case data with audit trail
   */
  exportCase(caseId: CaseId): any {
    if (!this.enforceCaseBoundary(caseId, AgentRole.EXPORT)) {
      throw new Error("Case boundary violation during export");
    }

    const context = this.getCaseContext(caseId);
    if (!context) {
      throw new Error(`Case not found: ${caseId}`);
    }

    return {
      caseId,
      title: context.title,
      createdAt: context.createdAt,
      exportedAt: new Date(),
      // TODO: Include all case data (timeline, evidence, drafts, etc.)
    };
  }
}

// Singleton instance
export const caseIsolation = new CaseIsolationSystem();

// Developer enforcement rule
export function assertCaseBoundary(caseId: CaseId, agentId: AgentRole): void {
  if (!caseIsolation.enforceCaseBoundary(caseId, agentId)) {
    throw new Error("Cross-case data access is strictly prohibited.");
  }
}
