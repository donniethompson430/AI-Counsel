/**
 * LAYER 1: FOUNDATION - Agent System Manager
 *
 * Central coordination system for all agents
 * Enforces hierarchy and case isolation
 */

import { HandlerAgent } from "./handler-agent";
import { CommanderAgent } from "./commander-agent";
import {
  AgentRole,
  CaseId,
  HandlerPersona,
  HandlerResponse,
  TaskStatus,
} from "./types";
import { caseIsolation } from "../core/case-isolation";

class AgentSystemManager {
  private handler: HandlerAgent;
  private commander: CommanderAgent;
  private initialized: boolean = false;

  constructor() {
    this.handler = new HandlerAgent();
    this.commander = new CommanderAgent();
  }

  /**
   * Initialize the agent system
   */
  async initialize(): Promise<void> {
    if (this.initialized) {
      return;
    }

    // Register Commander with Handler (for task delegation)
    this.commander.registerAgent(this.handler);

    // TODO: Register specialist agents (Research, Evidence, Drafting, etc.)
    // These will be created in subsequent phases

    this.initialized = true;
    console.log("🚀 Agent System initialized");
  }

  /**
   * Create new case and switch all agents to it
   */
  async createCase(title: string): Promise<CaseId> {
    const caseId = caseIsolation.createCase(title);

    // Switch all agents to new case
    this.handler.switchToCase(caseId);
    this.commander.switchToCase(caseId);

    console.log(`📁 New case created: ${caseId} - "${title}"`);
    return caseId;
  }

  /**
   * Switch to existing case
   */
  async switchToCase(caseId: CaseId): Promise<boolean> {
    const success = caseIsolation.switchToCase(caseId);

    if (success) {
      // Switch all agents to the case
      this.handler.switchToCase(caseId);
      this.commander.switchToCase(caseId);

      console.log(`🔄 Switched to case: ${caseId}`);
    }

    return success;
  }

  /**
   * Main user interaction - only through Handler
   */
  async sendMessage(message: string, caseId: CaseId): Promise<HandlerResponse> {
    if (!this.initialized) {
      await this.initialize();
    }

    // Ensure we're in the correct case context
    if (!this.switchToCase(caseId)) {
      throw new Error(`Failed to switch to case: ${caseId}`);
    }

    // All user interaction goes through Handler only
    const response = await this.handler.respondToUser(message, caseId);

    // If Handler triggered a task, send it to Commander
    if (response.triggerTask) {
      try {
        await this.commander.dispatch(
          response.triggerTask.agent,
          caseId,
          response.triggerTask.type,
          response.triggerTask.payload,
        );
      } catch (error) {
        console.error("❌ Failed to dispatch task to Commander:", error);
      }
    }

    return response;
  }

  /**
   * Set Handler personality
   */
  setHandlerPersona(persona: HandlerPersona): void {
    this.handler.setPersona(persona);
  }

  /**
   * Get conversation history for current case
   */
  getConversationHistory(caseId: CaseId): Array<{
    user: string;
    handler: string;
    timestamp: Date;
  }> {
    if (this.handler.currentCaseId === caseId) {
      return this.handler.getConversationHistory();
    }
    return [];
  }

  /**
   * Get system status for debugging
   */
  getSystemStatus(): {
    initialized: boolean;
    currentCaseId: CaseId | null;
    agents: Record<string, any>;
    taskChains: any[];
    breachEvents: any[];
  } {
    return {
      initialized: this.initialized,
      currentCaseId: caseIsolation.getCurrentCaseId(),
      agents: {
        handler: this.handler.getStatus(),
        commander: this.commander.getStatus(),
      },
      taskChains: this.commander.getActiveTaskChains(),
      breachEvents: caseIsolation.getBreachEvents(),
    };
  }

  /**
   * List all cases
   */
  listCases(): Array<{
    caseId: CaseId;
    title: string;
    createdAt: Date;
    lastActivity: Date;
    locked: boolean;
  }> {
    return caseIsolation.listCases();
  }

  /**
   * Export case data
   */
  async exportCase(caseId: CaseId): Promise<any> {
    return caseIsolation.exportCase(caseId);
  }

  /**
   * Emergency breach response
   */
  handleBreach(): void {
    console.error("🚨 EMERGENCY BREACH RESPONSE TRIGGERED");

    // Halt all agent operations
    this.handler.status = "blocked";
    this.commander.status = "blocked";

    // TODO: Implement full breach protocol
    // - Save current state
    // - Alert user
    // - Require manual recovery
  }

  /**
   * Get Handler's core directive for display
   */
  getHandlerDirective(): string {
    return this.handler.getCoreDirective();
  }

  /**
   * Validate system integrity
   */
  validateIntegrity(): {
    valid: boolean;
    issues: string[];
  } {
    const issues: string[] = [];

    // Check agent consistency
    const handlerCase = this.handler.currentCaseId;
    const commanderCase = this.commander.currentCaseId;
    const systemCase = caseIsolation.getCurrentCaseId();

    if (handlerCase !== commanderCase || handlerCase !== systemCase) {
      issues.push("Case context mismatch between agents");
    }

    // Check for memory leaks
    const breachEvents = caseIsolation.getBreachEvents();
    if (breachEvents.length > 0) {
      issues.push(`${breachEvents.length} breach events detected`);
    }

    return {
      valid: issues.length === 0,
      issues,
    };
  }
}

// Singleton instance
export const agentSystem = new AgentSystemManager();

// Export for testing and debugging
export { AgentSystemManager };
