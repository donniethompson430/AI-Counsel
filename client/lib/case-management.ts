import {
  Case,
  TimelineFact,
  EvidenceFile,
  Person,
  AIPersona,
} from "@shared/types";

// Case Management Utilities
export class CaseManager {
  private static instance: CaseManager;
  private cases: Map<string, Case> = new Map();
  private activeCase: Case | null = null;

  static getInstance(): CaseManager {
    if (!CaseManager.instance) {
      CaseManager.instance = new CaseManager();
    }
    return CaseManager.instance;
  }

  createCase(title: string, description?: string): Case {
    const id = `AIC-${Date.now().toString().slice(-6)}`;
    const newCase: Case = {
      id,
      title,
      description,
      createdAt: new Date(),
      updatedAt: new Date(),
      status: "active",
      timeline: [],
      evidence: [],
      persons: [],
      sources: [],
      documents: [],
      deadlines: [],
      notes: [],
    };

    this.cases.set(id, newCase);
    return newCase;
  }

  getCases(): Case[] {
    return Array.from(this.cases.values()).sort(
      (a, b) => b.updatedAt.getTime() - a.updatedAt.getTime(),
    );
  }

  getCase(id: string): Case | undefined {
    return this.cases.get(id);
  }

  setActiveCase(id: string): boolean {
    const case_ = this.cases.get(id);
    if (case_) {
      this.activeCase = case_;
      return true;
    }
    return false;
  }

  getActiveCase(): Case | null {
    return this.activeCase;
  }

  addTimelineFact(
    caseId: string,
    fact: Omit<TimelineFact, "id" | "factNumber" | "createdAt">,
  ): TimelineFact {
    const case_ = this.cases.get(caseId);
    if (!case_) throw new Error("Case not found");

    const newFact: TimelineFact = {
      ...fact,
      id: `fact-${Date.now()}`,
      factNumber: case_.timeline.length + 1,
      createdAt: new Date(),
    };

    case_.timeline.push(newFact);
    case_.timeline.sort(
      (a, b) => a.timestamp.getTime() - b.timestamp.getTime(),
    );
    case_.updatedAt = new Date();

    return newFact;
  }

  addEvidence(
    caseId: string,
    evidence: Omit<EvidenceFile, "id" | "uploadedAt">,
  ): EvidenceFile {
    const case_ = this.cases.get(caseId);
    if (!case_) throw new Error("Case not found");

    const newEvidence: EvidenceFile = {
      ...evidence,
      id: `evidence-${Date.now()}`,
      uploadedAt: new Date(),
    };

    case_.evidence.push(newEvidence);
    case_.updatedAt = new Date();

    return newEvidence;
  }

  addPerson(caseId: string, person: Omit<Person, "id">): Person {
    const case_ = this.cases.get(caseId);
    if (!case_) throw new Error("Case not found");

    const newPerson: Person = {
      ...person,
      id: `person-${Date.now()}`,
    };

    case_.persons.push(newPerson);
    case_.updatedAt = new Date();

    return newPerson;
  }

  updateCase(id: string, updates: Partial<Case>): boolean {
    const case_ = this.cases.get(id);
    if (!case_) return false;

    Object.assign(case_, updates, { updatedAt: new Date() });
    return true;
  }

  exportCaseData(caseId: string): string {
    const case_ = this.cases.get(caseId);
    if (!case_) throw new Error("Case not found");

    return JSON.stringify(case_, null, 2);
  }
}

// AI Personas
export const AI_PERSONAS: AIPersona[] = [
  {
    id: "strategist",
    name: "The Strategist",
    description:
      "Clear, concise, and objective. A no-nonsense professional focused on the facts and the most direct path to building your case.",
    chatTone: "professional",
    draftingStyle: "formal",
  },
  {
    id: "guide",
    name: "The Guide",
    description:
      "Patient, empathetic, and supportive. This AI acts as a calm mentor, designed to reduce stress and guide you through the process one step at a time.",
    chatTone: "supportive",
    draftingStyle: "explanatory",
  },
  {
    id: "razor",
    name: "The Razor",
    description:
      "Witty, blunt, and fiercely strategic, with a touch of gallows humor. This AI is your partner-in-crime, designed to keep you motivated by treating the law like a competitive sport.",
    chatTone: "witty",
    draftingStyle: "aggressive",
  },
  {
    id: "ally",
    name: "The Ally",
    description:
      "Relatable, modern, and direct. This AI cuts through the old-fashioned legal jargon and communicates like a savvy, tech-forward peer.",
    chatTone: "modern",
    draftingStyle: "plain-english",
  },
];

// Legal Concepts Detector
export class LegalConceptDetector {
  private static concepts = new Map([
    [
      "excessive force",
      [
        "force",
        "violence",
        "physical",
        "hit",
        "struck",
        "yanked",
        "grabbed",
        "pushed",
      ],
    ],
    [
      "unlawful search",
      ["search", "searched", "looked through", "went through", "checked"],
    ],
    [
      "false imprisonment",
      ["detained", "held", "wouldn't let", "prevented", "trapped"],
    ],
    [
      "due process violation",
      ["no warning", "no explanation", "didn't tell me", "sudden"],
    ],
    [
      "miranda violation",
      ["didn't read rights", "no miranda", "rights not read"],
    ],
  ]);

  static detectConcepts(text: string): string[] {
    const lowerText = text.toLowerCase();
    const detected: string[] = [];

    for (const [concept, keywords] of this.concepts) {
      const hasKeyword = keywords.some((keyword) =>
        lowerText.includes(keyword),
      );
      if (hasKeyword) {
        detected.push(concept);
      }
    }

    return detected;
  }
}

// Legal Education Content
export class LegalEducator {
  private static explanations = new Map([
    [
      "excessive force",
      {
        definition:
          "The use of physical force by law enforcement that exceeds what a reasonable officer would use under the circumstances.",
        standard:
          'Courts analyze excessive force claims under the Fourth Amendment using the "objective reasonableness" standard from Graham v. Connor.',
        elements: [
          "Severity of crime",
          "Immediate threat to safety",
          "Active resistance or flight attempt",
        ],
        keyCase: "Graham v. Connor, 490 U.S. 386 (1989)",
      },
    ],
    [
      "unlawful search",
      {
        definition:
          "A search conducted without a valid warrant, consent, or applicable exception to the warrant requirement.",
        standard:
          "The Fourth Amendment protects against unreasonable searches and seizures.",
        elements: ["No warrant", "No consent", "No applicable exception"],
        keyCase: "Terry v. Ohio, 392 U.S. 1 (1968)",
      },
    ],
  ]);

  static getExplanation(concept: string) {
    return this.explanations.get(concept);
  }

  static getAllConcepts(): string[] {
    return Array.from(this.explanations.keys());
  }
}
