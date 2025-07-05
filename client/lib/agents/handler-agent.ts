/**
 * AGENT 0: THE HANDLER - "The Frontliner"
 *
 * The ONLY agent that talks to the user
 * Uses personality system, never processes data
 * Educational firewall - teaches but never advises
 */

import { Agent } from "./base-agent";
import {
  AgentRole,
  AgentTask,
  HandlerPersona,
  HandlerResponse,
  CaseId,
} from "./types";
import { uplFirewall, HANDLER_CORE_DIRECTIVE } from "../core/upl-firewall";

export class HandlerAgent extends Agent {
  private persona: HandlerPersona = HandlerPersona.STRATEGIST;
  private conversationHistory: Array<{
    user: string;
    handler: string;
    timestamp: Date;
  }> = [];

  constructor() {
    super(
      AgentRole.HANDLER,
      "Handler (The Frontliner)",
      "The only user-facing interface. Translates user needs to Commander. Never processes data directly.",
    );
  }

  /**
   * Set Handler personality
   */
  setPersona(persona: HandlerPersona): void {
    this.persona = persona;
    console.log(`🎭 Handler persona set to: ${persona}`);
  }

  /**
   * Main user interaction method
   */
  async respondToUser(
    userInput: string,
    caseId: CaseId,
  ): Promise<HandlerResponse> {
    this.assertCaseAccess(caseId);

    // Store user input in conversation history
    const timestamp = new Date();

    // Analyze user input for legal triggers
    const legalTriggers = this.detectLegalTriggers(userInput);

    // Generate educational response
    let response = this.generateEducationalResponse(userInput, legalTriggers);

    // Apply UPL firewall
    const uplCheck = uplFirewall.validateHandlerResponse(
      response,
      this.persona,
    );
    if (!uplCheck.valid) {
      response = uplCheck.correctedResponse || response;
      console.warn(`⚠️ UPL violation corrected: ${uplCheck.violation}`);
    }

    // Determine if we need to trigger background tasks
    const triggerTask = this.shouldTriggerTask(userInput, legalTriggers);

    const handlerResponse: HandlerResponse = {
      message: response,
      persona: this.persona,
      awaitingUserInput: !triggerTask,
      triggerTask,
    };

    // Store conversation
    this.conversationHistory.push({
      user: userInput,
      handler: response,
      timestamp,
    });

    this.storeMemory("conversation", { userInput, response, timestamp });

    return handlerResponse;
  }

  /**
   * Detect legal triggers in user input
   */
  private detectLegalTriggers(input: string): string[] {
    const triggers: string[] = [];
    const lowerInput = input.toLowerCase();

    // Constitutional rights triggers
    if (lowerInput.includes("force") || lowerInput.includes("violence")) {
      triggers.push("excessive_force");
    }

    if (lowerInput.includes("search") || lowerInput.includes("seizure")) {
      triggers.push("fourth_amendment");
    }

    if (lowerInput.includes("arrest") || lowerInput.includes("detained")) {
      triggers.push("unlawful_detention");
    }

    if (lowerInput.includes("property") || lowerInput.includes("towed")) {
      triggers.push("property_seizure");
    }

    if (lowerInput.includes("discrimination") || lowerInput.includes("race")) {
      triggers.push("civil_rights");
    }

    // Procedural triggers
    if (lowerInput.includes("court") || lowerInput.includes("filing")) {
      triggers.push("court_procedure");
    }

    if (lowerInput.includes("deadline") || lowerInput.includes("response")) {
      triggers.push("deadlines");
    }

    return triggers;
  }

  /**
   * Generate educational response based on persona and triggers
   */
  private generateEducationalResponse(
    userInput: string,
    triggers: string[],
  ): string {
    const baseTemplate = uplFirewall.getEducationalTemplate(this.persona);

    if (triggers.includes("excessive_force")) {
      return this.getForceEducationalResponse(baseTemplate);
    }

    if (triggers.includes("fourth_amendment")) {
      return this.getSearchEducationalResponse(baseTemplate);
    }

    if (triggers.includes("court_procedure")) {
      return this.getCourtProcedureResponse(baseTemplate);
    }

    // Default educational response
    return `${baseTemplate}\n\nI can help you understand the legal framework that might apply to your situation. What specific aspect would you like me to explain?`;
  }

  /**
   * Educational response for force-related issues
   */
  private getForceEducationalResponse(template: string): string {
    return `${template}

Legally, officers are allowed to use force. But the law puts limits on that — it must be:
• Necessary
• Reasonable  
• Proportionate to the situation

So we need to break down:
• What was happening before the officer acted?
• What did they see or know?
• Was there a threat? Resistance? Confusion?

Because the law asks: 'What would another reasonable officer have done in that moment?'

Would you like me to show you what courts use to decide if that force was excessive under the law?`;
  }

  /**
   * Educational response for search/seizure issues
   */
  private getSearchEducationalResponse(template: string): string {
    return `${template}

The law allows searches under certain circumstances, but generally requires either:
• A warrant based on probable cause
• Specific exceptions (consent, emergency, etc.)

For seizures, courts look at whether it was:
• Justified at its inception
• Reasonably related in scope to the circumstances

Let's explore what happened step by step to understand which legal standard applies to your situation.`;
  }

  /**
   * Educational response for court procedure
   */
  private getCourtProcedureResponse(template: string): string {
    return `${template}

Court procedures have specific rules and deadlines that must be followed. The law provides frameworks for:
• Filing requirements
• Response deadlines
• Service of process
• Evidence presentation

Let me help you understand what procedural requirements might apply to your situation.`;
  }

  /**
   * Determine if user input should trigger background tasks
   */
  private shouldTriggerTask(
    userInput: string,
    triggers: string[],
  ): HandlerResponse["triggerTask"] | undefined {
    const lowerInput = userInput.toLowerCase();

    // User asking for legal research
    if (
      lowerInput.includes("show me") ||
      lowerInput.includes("what does the law say") ||
      lowerInput.includes("legal standard")
    ) {
      return {
        agent: AgentRole.COMMANDER,
        type: "research_legal_standard",
        payload: { triggers, userQuery: userInput },
      };
    }

    // User wants to start building timeline
    if (
      lowerInput.includes("what happened") ||
      lowerInput.includes("timeline") ||
      lowerInput.includes("sequence of events")
    ) {
      return {
        agent: AgentRole.COMMANDER,
        type: "build_timeline",
        payload: { userInput },
      };
    }

    return undefined;
  }

  /**
   * Get conversation history for current case
   */
  getConversationHistory(): Array<{
    user: string;
    handler: string;
    timestamp: Date;
  }> {
    return [...this.conversationHistory];
  }

  /**
   * Task execution (Handler doesn't process data directly)
   */
  protected async executeTask(task: AgentTask): Promise<any> {
    throw new Error(
      "Handler Agent does not process tasks directly. All tasks route through Commander.",
    );
  }

  /**
   * Handler capabilities
   */
  getCapabilities(): string[] {
    return [
      "User interaction",
      "Educational responses",
      "Legal framework explanation",
      "UPL firewall enforcement",
      "Conversation management",
      "Task triggering",
    ];
  }

  /**
   * Get Handler's core directive for reference
   */
  getCoreDirective(): string {
    return HANDLER_CORE_DIRECTIVE;
  }
}
