import {
  Case,
  TimelineFact,
  EvidenceFile,
  Person,
  AIPersona,
} from "@shared/types";

// Case Management Utilities with AI and Persistence
export class CaseManager {
  private static instance: CaseManager;
  private cases: Map<string, Case> = new Map();
  private activeCase: Case | null = null;
  private activePersona: AIPersona = "guide";

  static getInstance(): CaseManager {
    if (!CaseManager.instance) {
      CaseManager.instance = new CaseManager();
      CaseManager.instance.loadFromStorage();
    }
    return CaseManager.instance;
  }

  private loadFromStorage(): void {
    try {
      const stored = localStorage.getItem("ai-counsel-cases");
      if (stored) {
        const data = JSON.parse(stored);
        this.cases = new Map(
          data.cases?.map((c: any) => [
            c.id,
            {
              ...c,
              createdAt: new Date(c.createdAt),
              updatedAt: new Date(c.updatedAt),
              timeline:
                c.timeline?.map((t: any) => ({
                  ...t,
                  date: new Date(t.date),
                  timestamp: new Date(t.timestamp),
                  createdAt: new Date(t.createdAt),
                })) || [],
              evidence:
                c.evidence?.map((e: any) => ({
                  ...e,
                  uploadedAt: new Date(e.uploadedAt),
                })) || [],
              deadlines:
                c.deadlines?.map((d: any) => ({
                  ...d,
                  dueDate: new Date(d.dueDate),
                  createdAt: new Date(d.createdAt),
                })) || [],
              notes:
                c.notes?.map((n: any) => ({
                  ...n,
                  createdAt: new Date(n.createdAt),
                })) || [],
            },
          ]) || [],
        );
        this.activePersona = data.activePersona || "guide";
      }
    } catch (error) {
      console.warn("Failed to load cases from storage:", error);
    }
  }

  private saveToStorage(): void {
    try {
      const data = {
        cases: Array.from(this.cases.values()),
        activePersona: this.activePersona,
      };
      localStorage.setItem("ai-counsel-cases", JSON.stringify(data));
    } catch (error) {
      console.warn("Failed to save cases to storage:", error);
    }
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
    this.saveToStorage();

    // Start AI interview process
    this.initiateAIInterview(id);

    return newCase;
  }

  private initiateAIInterview(caseId: string): void {
    const welcomeNote = {
      id: `note-${Date.now()}`,
      content: `🤖 **AI Counsel ${this.getPersonaName()} is ready to help!**

I've created your case workspace. Let's start building your legal case step by step.

**Next steps I recommend:**
1. **Upload key documents** - Start with the most important files (contracts, emails, photos)
2. **Tell me what happened** - I'll help translate your story into legal language
3. **Build your timeline** - I'll guide you through organizing events chronologically

Click on different tabs to explore your legal toolbox. I'm here to guide you through each step.

*Tip: Try uploading a document first - I'll automatically extract dates and create timeline entries!*`,
      createdAt: new Date(),
      tags: ["ai-generated", "welcome"],
      type: "ai-guidance" as any,
    };

    this.addNote(caseId, welcomeNote);
  }

  // AI Persona Management
  getPersonaName(): string {
    const personas = {
      strategist: "The Strategist",
      guide: "The Guide",
      razor: "Razor",
      ally: "The Ally",
    };
    return personas[this.activePersona];
  }

  getPersonaDescription(): string {
    const descriptions = {
      strategist:
        "Analytical and methodical. Focuses on evidence gaps and legal strategy.",
      guide:
        "Patient and educational. Explains legal concepts in simple terms.",
      razor: "Direct and decisive. Cuts through complexity to key issues.",
      ally: "Supportive and encouraging. Emphasizes your strengths and progress.",
    };
    return descriptions[this.activePersona];
  }

  setActivePersona(persona: AIPersona): void {
    this.activePersona = persona;
    this.saveToStorage();
  }

  getActivePersona(): AIPersona {
    return this.activePersona;
  }

  // AI Response Generation
  generateAIResponse(
    input: string,
    context: "file-upload" | "timeline" | "general" = "general",
  ): string {
    const persona = this.activePersona;

    switch (context) {
      case "file-upload":
        return this.generateFileUploadResponse(input, persona);
      case "timeline":
        return this.generateTimelineResponse(input, persona);
      default:
        return this.generateGeneralResponse(input, persona);
    }
  }

  private generateFileUploadResponse(
    input: string,
    persona: AIPersona,
  ): string {
    const responses = {
      strategist: `📊 **Evidence Analysis Complete**

I've processed your file and extracted key information. Here's what I found strategically important:

${input}

**My Strategic Assessment:**
- This document strengthens your position by providing concrete evidence
- I've automatically tagged relevant legal concepts for easy reference
- Consider how this connects to your timeline - I've added any dates I found

**Next Strategic Steps:**
1. Review the extracted information for accuracy
2. Link this evidence to relevant timeline facts
3. Consider what additional evidence might support this document`,

      guide: `📚 **File Processing Complete - Let me explain what happened**

I've successfully processed your file! Here's what I did:

${input}

**What this means for your case:**
- I extracted readable text so you can search through it later
- Any dates I found were automatically added to your timeline
- I tagged the file with relevant legal keywords I recognized

**Learning Moment:**
This is how we build strong legal cases - one document at a time. Each piece of evidence tells part of your story.`,

      razor: `⚡ **File Processed - Here's what matters:**

${input}

**Bottom Line:**
- File analyzed and catalogued
- Key dates extracted and added to timeline
- Ready for your next upload

**Action Required:**
Upload more evidence or move to timeline building. Don't overthink it.`,

      ally: `💪 **Great job uploading that file!**

You're building a strong foundation for your case. Here's what I accomplished:

${input}

**You're doing amazing:**
- Every document you upload strengthens your position
- I'm here to handle the technical details while you focus on your story
- Your case is becoming more organized with each step

**Keep going:**
You've got this! Upload more files or start building your timeline when you're ready.`,
    };

    return responses[persona];
  }

  private generateTimelineResponse(input: string, persona: AIPersona): string {
    const responses = {
      strategist: `⏳ **Timeline Analysis**

${input}

**Strategic Timeline Assessment:**
- Chronological organization strengthens your narrative
- Look for patterns and causal relationships between events
- Identify any gaps that need additional evidence

**Timeline Strategy:**
Focus on facts that directly support your legal claims.`,

      guide: `📅 **Timeline Building Progress**

${input}

**Understanding Your Timeline:**
Your timeline is the backbone of your case. It shows when things happened and how they connect.

**Why This Matters:**
Courts love clear chronologies. It helps them understand your story and make fair decisions.`,

      razor: `⚡ **Timeline Updated**

${input}

**Key Point:**
Timeline is your case roadmap. Keep it factual, keep it tight.`,

      ally: `🎯 **Timeline Looking Strong!**

${input}

**You're Building Something Powerful:**
Each fact you add makes your case clearer and stronger. You're turning scattered events into a compelling story.`,
    };

    return responses[persona];
  }

  private generateGeneralResponse(input: string, persona: AIPersona): string {
    const responses = {
      strategist: `🎯 **Strategic Analysis:** ${input}`,
      guide: `📖 **Here to Help:** ${input}`,
      razor: `⚡ **Direct Response:** ${input}`,
      ally: `💫 **You've Got This:** ${input}`,
    };

    return responses[persona];
  }

  // Case Management Methods
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

  updateCase(caseId: string, updates: Partial<Case>): Case {
    const case_ = this.cases.get(caseId);
    if (!case_) throw new Error("Case not found");

    Object.assign(case_, updates);
    case_.updatedAt = new Date();
    this.saveToStorage();
    return case_;
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
      timestamp: fact.date, // Ensure timestamp is set
    };

    case_.timeline.push(newFact);
    case_.timeline.sort(
      (a, b) => a.timestamp.getTime() - b.timestamp.getTime(),
    );
    case_.updatedAt = new Date();
    this.saveToStorage();

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
    this.saveToStorage();

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
    this.saveToStorage();

    return newPerson;
  }

  addNote(caseId: string, note: any): any {
    const case_ = this.cases.get(caseId);
    if (!case_) throw new Error("Case not found");

    case_.notes.push(note);
    case_.updatedAt = new Date();
    this.saveToStorage();

    return note;
  }

  // Legal Education and Verification
  educateUser(concept: string): string {
    const educationalContent: Record<string, string> = {
      "burden of proof":
        "The burden of proof is your responsibility to provide evidence that supports your claims. In civil cases, this is usually 'preponderance of the evidence' - meaning more likely than not.",
      damages:
        "Damages are the monetary compensation you seek for harm caused. They can be compensatory (to make you whole) or punitive (to punish wrongdoing).",
      discovery:
        "Discovery is the pre-trial process where both sides exchange evidence and information. This includes documents, depositions, and interrogatories.",
      settlement:
        "A settlement is an agreement to resolve the case without going to trial. Most cases settle - it saves time and money for everyone involved.",
      jurisdiction:
        "Jurisdiction is the court's authority to hear your case. You must file in the right geographic area and court level for your type of case.",
    };

    return (
      educationalContent[concept.toLowerCase()] ||
      `I don't have specific educational content for "${concept}" yet, but I can help you research this legal concept further.`
    );
  }

  detectLegalConcepts(text: string): string[] {
    const concepts = [
      "contract",
      "breach",
      "damages",
      "negligence",
      "fraud",
      "liability",
      "discovery",
      "settlement",
      "jurisdiction",
      "burden of proof",
      "evidence",
      "testimony",
      "witness",
      "plaintiff",
      "defendant",
      "motion",
      "appeal",
    ];

    return concepts.filter((concept) => text.toLowerCase().includes(concept));
  }

  translateToLegalLanguage(emotionalText: string): string {
    const translations: Record<string, string> = {
      "they screwed me over":
        "the defendant breached their contractual obligations",
      "they lied to me": "the defendant made material misrepresentations",
      "they stole from me": "the defendant unlawfully converted my property",
      "they hurt me": "the defendant's actions caused me harm and damages",
      "it's not fair":
        "the defendant's conduct violates established legal standards",
      "they refused to pay":
        "the defendant failed to fulfill their payment obligations",
    };

    let result = emotionalText;
    Object.entries(translations).forEach(([emotional, legal]) => {
      result = result.replace(new RegExp(emotional, "gi"), legal);
    });

    return result;
  }
}
