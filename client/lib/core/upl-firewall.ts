/**
 * LAYER 1: FOUNDATION - UPL Firewall System
 *
 * Constitutional firewall between education and unauthorized practice of law
 * The Handler educates but NEVER advises
 */

import { UPLCheck, HandlerPersona } from "../agents/types";

class UPLFirewallSystem {
  private readonly prohibitedPhrases = [
    "you should",
    "i recommend",
    "you need to",
    "the best strategy",
    "you should argue",
    "i suggest",
    "you must",
    "file this motion",
    "your case will win",
    "you have a strong case",
    "this violates",
    "that's illegal",
    "you can sue for",
    "that's excessive force",
    "that's a violation",
    "he used excessive force",
    "that violates graham",
    "he didn't have probable cause",
  ];

  private readonly educationalPhrases = [
    "let me show you how the law looks at",
    "the courts use this test",
    "legally, officers are allowed",
    "the law puts limits on",
    "courts generally look for",
    "the legal standard requires",
    "let me explain what",
    "here's what the law says",
    "the court asks for",
    "legally speaking",
  ];

  /**
   * Check if message violates UPL boundaries
   */
  checkUPLViolation(message: string): UPLCheck {
    const lowerMessage = message.toLowerCase();

    // Check for prohibited advisory language
    for (const phrase of this.prohibitedPhrases) {
      if (lowerMessage.includes(phrase)) {
        return {
          message,
          violatesUPL: true,
          reason: `Contains prohibited advisory phrase: "${phrase}"`,
          alternativePhrasing: this.getEducationalAlternative(phrase),
        };
      }
    }

    // Check if message makes legal conclusions
    if (this.containsLegalConclusion(lowerMessage)) {
      return {
        message,
        violatesUPL: true,
        reason: "Makes legal conclusion instead of explaining legal framework",
        alternativePhrasing:
          "Let me show you how courts typically analyze this type of situation...",
      };
    }

    return {
      message,
      violatesUPL: false,
    };
  }

  /**
   * Transform advisory language into educational language
   */
  transformToEducational(message: string, persona: HandlerPersona): string {
    let transformed = message;

    // Replace advisory phrases with educational ones
    const replacements: Record<string, string> = {
      "you should": "the law typically requires",
      "i recommend": "courts generally look for",
      "you need to": "the legal standard asks for",
      "the best strategy": "one approach the law recognizes",
      "you should argue": "the legal framework includes",
      "i suggest": "the law provides for",
      "you must": "the requirement under law is",
      "this violates": "this may not meet the legal standard for",
      "that's illegal": "that could fall outside the bounds of",
      "that's excessive force": "that may not meet the reasonableness standard",
    };

    for (const [prohibited, educational] of Object.entries(replacements)) {
      transformed = transformed.replace(
        new RegExp(prohibited, "gi"),
        educational,
      );
    }

    return this.addPersonaToEducationalContent(transformed, persona);
  }

  /**
   * Get Handler's standard educational response template
   */
  getEducationalTemplate(persona: HandlerPersona): string {
    const templates = {
      [HandlerPersona.STRATEGIST]:
        "That sounds overwhelming. I can only imagine what that felt like. But let me show you how the law looks at it, so we can get a better understanding.",
      [HandlerPersona.GUIDE]:
        "I understand this is frustrating. Let me walk you through how courts typically analyze situations like this.",
      [HandlerPersona.RAZOR]:
        "Alright, let's cut through the noise. Here's what the law actually says about situations like this.",
      [HandlerPersona.ALLY]:
        "I hear you. This is clearly important to you. Let me help you understand the legal framework that applies here.",
    };

    return templates[persona];
  }

  /**
   * Generate safe educational response
   */
  generateEducationalResponse(
    userInput: string,
    persona: HandlerPersona,
  ): string {
    const template = this.getEducationalTemplate(persona);

    // Add specific educational content based on user input
    if (userInput.toLowerCase().includes("force")) {
      return `${template}\n\nLegally, officers are allowed to use force. But the law puts limits on that — it must be:\n- Necessary\n- Reasonable\n- Proportionate to the situation\n\nSo we need to break down what was happening before the officer acted and what they saw or knew.`;
    }

    if (userInput.toLowerCase().includes("search")) {
      return `${template}\n\nThe law allows searches under certain circumstances, but requires either:\n- A warrant based on probable cause\n- Specific exceptions (consent, emergency, etc.)\n\nLet's look at what happened step by step to understand which legal standard applies.`;
    }

    return `${template}\n\nLet me help you understand what legal standards might apply to your situation.`;
  }

  /**
   * Check for legal conclusions
   */
  private containsLegalConclusion(message: string): boolean {
    const conclusionIndicators = [
      "this is clearly",
      "obviously illegal",
      "definitely violates",
      "without question",
      "this proves",
      "you have a case",
      "you'll win",
      "they're liable",
    ];

    return conclusionIndicators.some((indicator) =>
      message.includes(indicator),
    );
  }

  /**
   * Get educational alternative for prohibited phrase
   */
  private getEducationalAlternative(prohibitedPhrase: string): string {
    const alternatives: Record<string, string> = {
      "you should": "The legal standard typically requires...",
      "this violates": "This may not meet the legal standard for...",
      "that's illegal": "That could fall outside the legal bounds of...",
      "you have a strong case":
        "Let me show you what courts look for in cases like this...",
      "that's excessive force":
        "Let me explain how courts determine if force is reasonable...",
      "he didn't have probable cause":
        "Let me explain what probable cause means legally...",
    };

    return (
      alternatives[prohibitedPhrase] ||
      "Let me explain the legal framework that applies here..."
    );
  }

  /**
   * Add persona-specific tone to educational content
   */
  private addPersonaToEducationalContent(
    content: string,
    persona: HandlerPersona,
  ): string {
    const personalityMarkers = {
      [HandlerPersona.STRATEGIST]:
        "I want to make sure you understand this clearly.",
      [HandlerPersona.GUIDE]: "Let's work through this step by step.",
      [HandlerPersona.RAZOR]:
        "No sugarcoating — here's the straight legal analysis.",
      [HandlerPersona.ALLY]: "I'm here to help you understand this completely.",
    };

    return `${content}\n\n${personalityMarkers[persona]}`;
  }

  /**
   * Validate Handler response before sending to user
   */
  validateHandlerResponse(
    response: string,
    persona: HandlerPersona,
  ): { valid: boolean; correctedResponse?: string; violation?: string } {
    const uplCheck = this.checkUPLViolation(response);

    if (uplCheck.violatesUPL) {
      return {
        valid: false,
        correctedResponse: this.transformToEducational(response, persona),
        violation: uplCheck.reason,
      };
    }

    return { valid: true };
  }
}

// Singleton instance
export const uplFirewall = new UPLFirewallSystem();

// Core mindset for Handler AI
export const HANDLER_CORE_DIRECTIVE = `
You are not the lawyer.
You are the interpreter of the battlefield.
Your job is to teach the user how to speak in a language the law understands —
without ever speaking for them.

NEVER:
- Give legal advice
- Make legal conclusions
- Suggest what to do
- Coach on strategy

ALWAYS:
- Explain legal frameworks
- Provide definitions
- Show what courts look for
- Let user draw their own conclusions
`;
