import { useState, useRef, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Bot,
  User,
  Send,
  Sparkles,
  Brain,
  Zap,
  Heart,
  MessageSquare,
  CheckCircle,
  AlertCircle,
  Clock,
  Scale,
  FileText,
  Users,
  MapPin,
  Calendar,
  Eye,
  Edit,
  Check,
  X,
} from "lucide-react";
import { Case, AIPersona, TimelineFact, Person } from "@shared/types";
import { CaseManager } from "@/lib/case-management";
import { notifications } from "@/lib/notifications";

interface AIInterviewEngineProps {
  case: Case;
  onCaseUpdate: (updatedCase: Case) => void;
}

interface ExtractedFact {
  id: string;
  description: string;
  date: Date;
  source: string;
  verified: boolean;
  legalConcepts?: string[];
  translatedLanguage?: string;
  originalLanguage?: string;
  confidence: "high" | "medium" | "low";
  type: "event" | "statement" | "observation" | "communication";
}

interface ExtractedPerson {
  id: string;
  name: string;
  role: string;
  source: string;
  verified: boolean;
  confidence: "high" | "medium" | "low";
}

interface InterviewSession {
  id: string;
  phase: "analysis" | "briefing" | "verification" | "education" | "completion";
  currentFactIndex: number;
  extractedFacts: ExtractedFact[];
  extractedPersons: ExtractedPerson[];
  verifiedFacts: ExtractedFact[];
  pendingEducation: string[];
}

const PERSONA_ICONS = {
  strategist: Brain,
  guide: MessageSquare,
  razor: Zap,
  ally: Heart,
};

const PERSONA_COLORS = {
  strategist: "bg-blue-100 text-blue-800",
  guide: "bg-green-100 text-green-800",
  razor: "bg-orange-100 text-orange-800",
  ally: "bg-pink-100 text-pink-800",
};

export default function AIInterviewEngine({
  case: case_,
  onCaseUpdate,
}: AIInterviewEngineProps) {
  const [session, setSession] = useState<InterviewSession | null>(null);
  const [selectedPersona, setSelectedPersona] = useState<AIPersona>("guide");
  const [isProcessing, setIsProcessing] = useState(false);
  const [currentEducationTopic, setCurrentEducationTopic] = useState<
    string | null
  >(null);
  const [userInput, setUserInput] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const caseManager = CaseManager.getInstance();

  // Listen for verification requests and file uploads
  useEffect(() => {
    const unsubscribeVerification = notifications.subscribe(
      "verification-requested",
      (data) => {
        if (data.caseId === case_.id && !session && case_.evidence.length > 0) {
          console.log("Verification requested for case:", case_.id);
          setTimeout(() => {
            if (!session) {
              initiateAnalysisSession();
            }
          }, 500);
        }
      },
    );

    const unsubscribeFileUpload = notifications.subscribe(
      "file-uploaded",
      (data) => {
        if (data.caseId === case_.id && !session) {
          console.log(
            "File uploaded, ready for verification:",
            data.payload?.fileName,
          );
          // Could auto-start here or wait for explicit verification request
        }
      },
    );

    return () => {
      unsubscribeVerification();
      unsubscribeFileUpload();
    };
  }, [case_.id, session, case_.evidence.length]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [session]);

  const initiateAnalysisSession = async () => {
    setIsProcessing(true);

    // Analyze all uploaded files
    const extractedFacts = await analyzeAllFiles();
    const extractedPersons = await extractPersonsFromFiles();

    const newSession: InterviewSession = {
      id: `session-${Date.now()}`,
      phase: "briefing",
      currentFactIndex: 0,
      extractedFacts,
      extractedPersons,
      verifiedFacts: [],
      pendingEducation: [],
    };

    setSession(newSession);
    setIsProcessing(false);
  };

  const analyzeAllFiles = async (): Promise<ExtractedFact[]> => {
    const facts: ExtractedFact[] = [];

    for (const evidence of case_.evidence) {
      if (evidence.extractedText) {
        // Extract events and statements from text
        const extractedEvents = extractEventsFromText(
          evidence.extractedText,
          evidence.fileName,
        );
        facts.push(...extractedEvents);
      }
    }

    // Filter out gibberish facts and limit to most relevant (max 20)
    const validFacts = facts.filter((fact) => !isGibberish(fact.description));

    // If no valid facts were extracted, create helpful placeholders
    if (validFacts.length === 0 && case_.evidence.length > 0) {
      return [
        {
          id: `manual-fact-${Date.now()}`,
          description:
            "No readable text could be extracted from your files. Please describe the key events manually.",
          date: new Date(),
          source: "Manual Entry Needed",
          verified: false,
          confidence: "low",
          type: "statement",
        },
      ];
    }

    return validFacts.slice(0, 20);
  };

  const extractEventsFromText = (
    text: string,
    source: string,
  ): ExtractedFact[] => {
    const facts: ExtractedFact[] = [];

    // Clean and filter the text first
    const cleanedText = cleanExtractedText(text);
    if (!cleanedText || cleanedText.length < 50) return facts;

    const sentences = cleanedText
      .split(/[.!?]+/)
      .map((s) => s.trim())
      .filter((s) => s.length > 20 && s.length < 500) // Reasonable sentence lengths
      .filter((s) => isReadableText(s)); // Filter out gibberish

    sentences.forEach((sentence, index) => {
      // Look for action verbs and temporal indicators
      const actionWords = [
        "pulled",
        "stopped",
        "told",
        "said",
        "grabbed",
        "hit",
        "arrested",
        "searched",
        "asked",
        "ordered",
        "forced",
        "threw",
        "kicked",
        "shot",
        "tased",
        "handcuffed",
        "approached",
        "called",
        "responded",
        "issued",
        "wrote",
        "documented",
        "observed",
        "witnessed",
        "occurred",
      ];

      const hasAction = actionWords.some((word) =>
        sentence.toLowerCase().includes(word),
      );

      // Look for legal/police terminology to increase relevance
      const legalTerms = [
        "officer",
        "police",
        "arrest",
        "citation",
        "violation",
        "suspect",
        "defendant",
        "plaintiff",
        "court",
        "judge",
        "attorney",
        "law",
      ];

      const hasLegalTerm = legalTerms.some((term) =>
        sentence.toLowerCase().includes(term),
      );

      if (hasAction || hasLegalTerm) {
        // Try to extract date from context
        const dateMatch = sentence.match(
          /(\d{1,2}\/\d{1,2}\/\d{4}|\d{1,2}-\d{1,2}-\d{4}|January|February|March|April|May|June|July|August|September|October|November|December)\s+\d{1,2},?\s+\d{4}/i,
        );
        const estimatedDate = dateMatch ? new Date(dateMatch[0]) : new Date();

        // Detect legal concepts
        const legalConcepts = detectLegalConcepts(sentence);

        // Determine if emotional language needs translation
        const emotionalWords = [
          "yanked",
          "grabbed",
          "threw",
          "slammed",
          "screamed",
          "terrified",
          "scared",
          "humiliated",
          "rough",
          "aggressive",
        ];
        const needsTranslation = emotionalWords.some((word) =>
          sentence.toLowerCase().includes(word),
        );

        facts.push({
          id: `fact-${Date.now()}-${index}`,
          description: sentence,
          date: estimatedDate,
          source,
          verified: false,
          legalConcepts,
          originalLanguage: needsTranslation ? sentence : undefined,
          confidence: hasAction && hasLegalTerm ? "high" : "medium",
          type: "event",
        });
      }
    });

    // Filter out gibberish facts and limit to most relevant (max 20)
    const validFacts = facts.filter((fact) => !isGibberish(fact.description));
    return validFacts.slice(0, 20);
  };

  const extractPersonsFromFiles = async (): Promise<ExtractedPerson[]> => {
    const persons: ExtractedPerson[] = [];
    const seenNames = new Set<string>();

    for (const evidence of case_.evidence) {
      if (evidence.extractedText) {
        const cleanedText = cleanExtractedText(evidence.extractedText);
        if (!cleanedText) continue;

        // Extract officer names with specific patterns
        const officerPatterns = [
          /Officer\s+([A-Z][a-z]{2,15}(?:\s+[A-Z][a-z]{2,15})?)/gi,
          /Detective\s+([A-Z][a-z]{2,15}(?:\s+[A-Z][a-z]{2,15})?)/gi,
          /Sergeant\s+([A-Z][a-z]{2,15}(?:\s+[A-Z][a-z]{2,15})?)/gi,
          /Lieutenant\s+([A-Z][a-z]{2,15}(?:\s+[A-Z][a-z]{2,15})?)/gi,
        ];

        officerPatterns.forEach((pattern) => {
          let match;
          while ((match = pattern.exec(cleanedText)) !== null) {
            const name = match[1].trim();
            if (
              name &&
              !seenNames.has(name.toLowerCase()) &&
              isValidPersonName(name)
            ) {
              seenNames.add(name.toLowerCase());
              persons.push({
                id: `person-${Date.now()}-${name.replace(/\s+/g, "-")}`,
                name,
                role: "Police Officer",
                source: evidence.fileName,
                verified: false,
                confidence: "high",
              });
            }
          }
        });

        // Extract general names more carefully
        const namePattern = /\b[A-Z][a-z]{2,15}\s+[A-Z][a-z]{2,15}\b/g;
        const names = cleanedText.match(namePattern) || [];

        names.forEach((name) => {
          const normalizedName = name.trim();
          if (
            !seenNames.has(normalizedName.toLowerCase()) &&
            isValidPersonName(normalizedName) &&
            !isCommonPhrase(normalizedName) &&
            isInLegalContext(normalizedName, cleanedText)
          ) {
            seenNames.add(normalizedName.toLowerCase());
            persons.push({
              id: `person-${Date.now()}-${normalizedName.replace(/\s+/g, "-")}`,
              name: normalizedName,
              role: "Unknown",
              source: evidence.fileName,
              verified: false,
              confidence: "medium",
            });
          }
        });
      }
    }

    // Limit to reasonable number and sort by confidence
    return persons
      .sort((a, b) => (a.confidence === "high" ? -1 : 1))
      .slice(0, 10);
  };

  const detectLegalConcepts = (text: string): string[] => {
    const concepts = [];
    const lower = text.toLowerCase();

    if (
      lower.includes("force") ||
      lower.includes("grabbed") ||
      lower.includes("hit")
    ) {
      concepts.push("Excessive Force");
    }
    if (lower.includes("search") || lower.includes("looked")) {
      concepts.push("Fourth Amendment Search");
    }
    if (lower.includes("arrest") || lower.includes("handcuff")) {
      concepts.push("False Arrest");
    }
    if (lower.includes("stop") || lower.includes("pulled over")) {
      concepts.push("Traffic Stop");
    }

    return concepts;
  };

  const cleanExtractedText = (text: string): string => {
    if (!text) return "";

    // First, check if this looks like gibberish
    if (isGibberish(text)) {
      return "";
    }

    return (
      text
        // Remove excessive whitespace and newlines
        .replace(/\s+/g, " ")
        // Remove control characters and non-printable characters
        .replace(/[\x00-\x1F\x7F-\x9F]/g, "")
        // Remove obvious OCR artifacts and gibberish patterns
        .replace(/[^\w\s.,!?;:()'"'-]/g, " ")
        // Remove sequences of repeated characters that are likely OCR errors
        .replace(/(.)\1{4,}/g, "$1")
        // Remove standalone single characters that are likely OCR noise
        .replace(/\b\w\b/g, " ")
        // Clean up multiple spaces
        .replace(/\s+/g, " ")
        .trim()
    );
  };

  const isGibberish = (text: string): boolean => {
    if (!text || text.length < 5) return true;

    // Check for common OCR gibberish patterns
    const gibberishPatterns = [
      /[A-Z]{3,}[a-z]{1,2}[A-Z]{2,}/g, // Mixed case nonsense like "GitcTOT1"
      /\b\w{1,3}[0-9]+[A-Z]+\w*\b/g, // Alphanumeric gibberish
      /\b[bcdfghjklmnpqrstvwxyzBCDFGHJKLMNPQRSTVWXYZ]{4,}\b/g, // Too many consonants
      /[A-Z]{2,}[0-9]+[A-Z]{2,}/g, // Pattern like "JD QjeVr5"
    ];

    const hasGibberishPattern = gibberishPatterns.some((pattern) =>
      pattern.test(text),
    );
    if (hasGibberishPattern) return true;

    // Check vowel ratio (real text should have reasonable vowels)
    const vowelCount = (text.match(/[aeiouAEIOU]/g) || []).length;
    const letterCount = (text.match(/[a-zA-Z]/g) || []).length;
    const vowelRatio = vowelCount / Math.max(letterCount, 1);

    if (vowelRatio < 0.15 || vowelRatio > 0.6) return true;

    // Check for random character sequences
    const words = text.split(/\s+/).filter((w) => w.length > 2);
    const validWords = words.filter((w) => {
      // Must be mostly letters, reasonable length, and have vowels
      return (
        /^[a-zA-Z]+$/.test(w) &&
        w.length <= 20 &&
        /[aeiou]/i.test(w) &&
        !/[bcdfghjklmnpqrstvwxyz]{4,}/i.test(w) // No 4+ consonants in a row
      );
    });

    const validWordRatio = validWords.length / Math.max(words.length, 1);
    return validWordRatio < 0.6;
  };

  const isReadableText = (text: string): boolean => {
    if (!text || text.length < 10) return false;

    // Quick gibberish check
    if (isGibberish(text)) return false;

    // Check ratio of alphabetic characters to total characters
    const alphaCount = (text.match(/[a-zA-Z]/g) || []).length;
    const alphaRatio = alphaCount / text.length;

    // Check for reasonable word structure
    const words = text.split(/\s+/).filter((w) => w.length > 1);
    const validWords = words.filter(
      (w) => /^[a-zA-Z]+$/.test(w) && w.length <= 20,
    );
    const wordRatio = validWords.length / Math.max(words.length, 1);

    return alphaRatio > 0.7 && wordRatio > 0.5 && words.length >= 3;
  };

  const isValidPersonName = (name: string): boolean => {
    if (!name || name.length < 4 || name.length > 50) return false;

    const parts = name.split(/\s+/);
    if (parts.length < 2 || parts.length > 4) return false;

    // Each part should be a reasonable name component
    return parts.every(
      (part) =>
        /^[A-Z][a-z]{1,15}$/.test(part) &&
        part.length >= 2 &&
        part.length <= 15,
    );
  };

  const isInLegalContext = (name: string, fullText: string): boolean => {
    const contextWindow = 100; // characters before and after
    const nameIndex = fullText.toLowerCase().indexOf(name.toLowerCase());
    if (nameIndex === -1) return false;

    const start = Math.max(0, nameIndex - contextWindow);
    const end = Math.min(
      fullText.length,
      nameIndex + name.length + contextWindow,
    );
    const context = fullText.slice(start, end).toLowerCase();

    const legalContextWords = [
      "officer",
      "detective",
      "sergeant",
      "lieutenant",
      "police",
      "cop",
      "defendant",
      "plaintiff",
      "witness",
      "victim",
      "suspect",
      "attorney",
      "lawyer",
      "judge",
      "court",
      "arrest",
      "citation",
      "ticket",
      "violation",
      "report",
      "incident",
      "case",
      "complaint",
      "statement",
    ];

    return legalContextWords.some((word) => context.includes(word));
  };

  const isCommonPhrase = (text: string): boolean => {
    const common = [
      "United States",
      "Police Department",
      "District Court",
      "Supreme Court",
      "State Police",
      "County Sheriff",
      "City Hall",
      "Fire Department",
      "Emergency Services",
      "Public Safety",
      "Motor Vehicle",
      "Traffic Court",
      "Justice Department",
      "Law Enforcement",
      "Public Records",
      "Case Number",
      "File Number",
      "Report Number",
      "Badge Number",
      "License Number",
    ];
    return common.some((phrase) => text.includes(phrase));
  };

  const verifyCurrentFact = (approved: boolean, editedText?: string) => {
    if (!session) return;

    const currentFact = session.extractedFacts[session.currentFactIndex];
    if (approved) {
      const verifiedFact = {
        ...currentFact,
        verified: true,
        description: editedText || currentFact.description,
      };

      // Add to case timeline
      const timelineFact = {
        description: verifiedFact.description,
        date: verifiedFact.date,
        timestamp: verifiedFact.date,
        source: verifiedFact.source,
        verified: true,
        linkedEvidenceIds: [],
        linkedPersonIds: [],
        tags: verifiedFact.legalConcepts || [],
      };

      caseManager.addTimelineFact(case_.id, timelineFact);

      setSession((prev) => ({
        ...prev!,
        verifiedFacts: [...prev!.verifiedFacts, verifiedFact],
        currentFactIndex: prev!.currentFactIndex + 1,
        phase:
          prev!.currentFactIndex + 1 >= prev!.extractedFacts.length
            ? "completion"
            : "verification",
      }));

      // Update case
      const updatedCase = caseManager.getCase(case_.id);
      if (updatedCase) {
        onCaseUpdate(updatedCase);
      }
    } else {
      // Skip this fact
      setSession((prev) => ({
        ...prev!,
        currentFactIndex: prev!.currentFactIndex + 1,
        phase:
          prev!.currentFactIndex + 1 >= prev!.extractedFacts.length
            ? "completion"
            : "verification",
      }));
    }
  };

  const translateEmotionalLanguage = (text: string): string => {
    const translations: Record<string, string> = {
      yanked: "forcibly removed",
      grabbed: "seized",
      threw: "forcibly moved",
      slammed: "forcibly contacted",
      screamed: "spoke in a loud voice",
      terrified: "caused fear and distress",
      scared: "intimidated",
      humiliated: "subjected to degrading treatment",
    };

    let translated = text;
    Object.entries(translations).forEach(([emotional, legal]) => {
      translated = translated.replace(new RegExp(emotional, "gi"), legal);
    });

    return translated;
  };

  const educateOnConcept = (concept: string): string => {
    const education: Record<string, string> = {
      "Excessive Force": `**Excessive Force** under the Fourth Amendment is analyzed using the "objective reasonableness" standard from Graham v. Connor. The court considers:

• **Severity of the crime** - Was this a serious offense or minor violation?
• **Immediate threat** - Did you pose a threat to officer or public safety?
• **Active resistance** - Were you resisting arrest or attempting to flee?

The force must be reasonable from the perspective of a reasonable officer at the scene, not with 20/20 hindsight.`,

      "Fourth Amendment Search": `**Fourth Amendment Protection** against unreasonable searches requires either:

• **Probable Cause + Warrant** - A judge authorized the search based on evidence
• **Recognized Exception** - Like plain view, consent, search incident to arrest, or exigent circumstances

**Key Point:** You have the right to refuse consent to searches. Saying "I do not consent" preserves your rights even if they search anyway.`,

      "False Arrest": `**False Arrest** occurs when you're detained without legal justification. Officers need:

• **Probable Cause** - Facts that would lead a reasonable person to believe you committed a crime
• **Warrant** - For arrests in your home (with exceptions)
• **Lawful Authority** - The power to make the arrest

**Element to Prove:** The arrest lacked probable cause or legal authority.`,

      "Traffic Stop": `**Traffic Stops** are "seizures" under the Fourth Amendment requiring:

• **Reasonable Suspicion** - Specific facts suggesting traffic violation or criminal activity
• **Scope Limitation** - Stop must be reasonably related to the justification
• **Duration** - Must be reasonably brief

**Key Point:** You can ask "Am I free to leave?" to clarify if you're detained.`,
    };

    return (
      education[concept] ||
      `I don't have specific educational content for "${concept}" yet, but this is a legal concept worth researching further.`
    );
  };

  const renderAnalysisPhase = () => (
    <Card className="legal-card">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Brain className="h-5 w-5 text-legal-primary animate-pulse" />
          AI Analysis in Progress
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="flex items-center justify-center py-8">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-legal-primary mx-auto mb-4"></div>
              <p className="text-sm text-muted-foreground">
                Analyzing uploaded files and extracting key information...
              </p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );

  const renderBriefingPhase = () => {
    if (!session) return null;

    return (
      <Card className="legal-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5 text-legal-primary" />
            AI Analysis Complete - Ready for Verification
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              <strong>Important Legal Notice:</strong> I am your AI legal
              assistant, not your lawyer. I provide legal information and help
              organize your case, but YOU are the final authority on all facts
              and legal decisions. This is your case, and you are representing
              yourself.
            </AlertDescription>
          </Alert>

          <div className="bg-muted p-4 rounded-lg">
            <h3 className="font-semibold mb-3">📊 Analysis Summary</h3>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <div className="font-medium">📅 Facts Extracted</div>
                <div className="text-2xl font-bold text-legal-primary">
                  {
                    session.extractedFacts.filter(
                      (f) => !isGibberish(f.description),
                    ).length
                  }
                </div>
              </div>
              <div>
                <div className="font-medium">👥 People Identified</div>
                <div className="text-2xl font-bold text-legal-primary">
                  {session.extractedPersons.length}
                </div>
              </div>
            </div>
            {session.extractedFacts.length === 0 && (
              <div className="mt-3 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                <p className="text-sm text-yellow-800">
                  📄 <strong>Note:</strong> No readable text could be extracted
                  from your uploaded files. This might be due to scanned images
                  or corrupted PDFs. You can manually add facts during
                  verification.
                </p>
              </div>
            )}
          </div>

          <div className="space-y-2">
            <p className="text-sm">
              <strong>Next Step:</strong> I need to verify each fact with you.
              For each one, I will:
            </p>
            <ul className="text-sm text-muted-foreground space-y-1 ml-4">
              <li>• Show you what I found</li>
              <li>• Translate any emotional language into legal terms</li>
              <li>• Educate you on relevant legal concepts</li>
              <li>• Help you create an accurate, legally-sound fact</li>
            </ul>
          </div>

          <div className="flex gap-2">
            <Button
              onClick={() =>
                setSession((prev) => ({ ...prev!, phase: "verification" }))
              }
              className="flex-1"
            >
              ✓ I Understand - Begin Verification
            </Button>
            <Button variant="outline" onClick={() => setSession(null)}>
              Cancel
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  };

  const renderVerificationPhase = () => {
    if (!session || session.extractedFacts.length === 0) return null;

    // Check if session contains gibberish facts and restart if needed
    const hasGibberishFacts = session.extractedFacts.some(
      (fact) =>
        isGibberish(fact.description) && fact.source !== "Manual Entry Needed",
    );

    if (hasGibberishFacts) {
      console.log("Session contains gibberish facts, restarting analysis...");
      setTimeout(() => {
        setSession(null);
        initiateAnalysisSession();
      }, 100);

      return (
        <Card className="legal-card">
          <CardContent className="p-6 text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-legal-primary mx-auto mb-4"></div>
            <p className="text-sm text-muted-foreground">
              Filtering corrupted text and restarting analysis...
            </p>
          </CardContent>
        </Card>
      );
    }

    const currentFact = session.extractedFacts[session.currentFactIndex];
    const progress =
      (session.currentFactIndex / session.extractedFacts.length) * 100;

    return (
      <Card className="legal-card">
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Eye className="h-5 w-5 text-legal-primary" />
              Verifying Fact #{session.currentFactIndex + 1}
            </div>
            <Badge variant="outline">
              {session.currentFactIndex + 1} of {session.extractedFacts.length}
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <Progress value={progress} className="w-full" />

          {/* Original Statement */}
          <div
            className={`p-4 rounded-lg ${
              currentFact.source === "Manual Entry Needed"
                ? "bg-blue-50 border border-blue-200"
                : "bg-muted"
            }`}
          >
            <h4 className="font-semibold mb-2">
              {currentFact.source === "Manual Entry Needed"
                ? "📝 Manual Entry Required:"
                : "📝 What I Found in Your Files:"}
            </h4>
            <p className="text-sm italic">"{currentFact.description}"</p>
            <p className="text-xs text-muted-foreground mt-2">
              Source: {currentFact.source} | Confidence:{" "}
              {currentFact.confidence}
            </p>
            {currentFact.source === "Manual Entry Needed" && (
              <div className="mt-2 p-2 bg-blue-100 rounded text-xs text-blue-800">
                💡 <strong>Tip:</strong> Use the text area below to describe
                what happened in your own words. I'll help you convert it to
                proper legal language.
              </div>
            )}
          </div>

          {/* Legal Concept Translation */}
          {currentFact.legalConcepts &&
            currentFact.legalConcepts.length > 0 && (
              <div className="border border-legal-border p-4 rounded-lg">
                <h4 className="font-semibold mb-2 flex items-center gap-2">
                  <Scale className="h-4 w-4" />
                  Legal Concept Detected
                </h4>
                <div className="space-y-2">
                  {currentFact.legalConcepts.map((concept, index) => (
                    <div key={index}>
                      <Badge className="mb-2">{concept}</Badge>
                      <Button
                        variant="link"
                        size="sm"
                        onClick={() => setCurrentEducationTopic(concept)}
                        className="ml-2 p-0 h-auto"
                      >
                        📚 Learn About This
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
            )}

          {/* Education Section */}
          {currentEducationTopic && (
            <div className="bg-blue-50 border border-blue-200 p-4 rounded-lg">
              <h4 className="font-semibold mb-2 flex items-center gap-2">
                <MessageSquare className="h-4 w-4" />
                Legal Education: {currentEducationTopic}
              </h4>
              <div className="prose prose-sm max-w-none">
                {educateOnConcept(currentEducationTopic)
                  .split("\n")
                  .map((line, i) => (
                    <p key={i} className="mb-2">
                      {line}
                    </p>
                  ))}
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentEducationTopic(null)}
                className="mt-2"
              >
                Got It
              </Button>
            </div>
          )}

          {/* Translation */}
          {currentFact.originalLanguage && (
            <div className="bg-green-50 border border-green-200 p-4 rounded-lg">
              <h4 className="font-semibold mb-2">
                🔄 Legal Language Translation
              </h4>
              <div className="space-y-2">
                <p className="text-sm">
                  <strong>Your Words:</strong> "{currentFact.originalLanguage}"
                </p>
                <p className="text-sm">
                  <strong>Legal Translation:</strong> "
                  {translateEmotionalLanguage(currentFact.originalLanguage)}"
                </p>
                <p className="text-xs text-muted-foreground">
                  Courts prefer objective, factual language over emotional
                  descriptions.
                </p>
              </div>
            </div>
          )}

          {/* Guided Questions for Legal Elements */}
          {currentFact.legalConcepts &&
            currentFact.legalConcepts.includes("Excessive Force") && (
              <div className="bg-yellow-50 border border-yellow-200 p-4 rounded-lg">
                <h4 className="font-semibold mb-3">
                  📋 Guided Questions for Excessive Force Claim
                </h4>
                <div className="space-y-3 text-sm">
                  <div>
                    <p className="font-medium">
                      1. Regarding the Suspected Crime:
                    </p>
                    <p className="text-muted-foreground">
                      What was the stated reason for the stop/arrest?
                    </p>
                    <Input
                      placeholder="e.g., Expired registration, speeding, etc."
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <p className="font-medium">
                      2. Regarding Any Potential Threat:
                    </p>
                    <p className="text-muted-foreground">
                      Before force was used, did you make any threats or sudden
                      movements?
                    </p>
                    <Input
                      placeholder="e.g., I was cooperative, just asked questions"
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <p className="font-medium">3. Regarding Resistance:</p>
                    <p className="text-muted-foreground">
                      Were you physically resisting or just verbally
                      questioning?
                    </p>
                    <Input
                      placeholder="e.g., I just asked why I had to get out"
                      className="mt-1"
                    />
                  </div>
                </div>
                <p className="text-xs text-muted-foreground mt-3">
                  💡 These answers help structure your fact to address the legal
                  elements courts examine.
                </p>
              </div>
            )}

          {/* Fact Editor */}
          <div className="space-y-2">
            <label className="text-sm font-medium">
              Proposed Legal Fact (edit as needed):
            </label>
            <Textarea
              value={
                userInput ||
                (currentFact.originalLanguage
                  ? translateEmotionalLanguage(currentFact.description)
                  : currentFact.description)
              }
              onChange={(e) => setUserInput(e.target.value)}
              placeholder="Edit the fact description..."
              className="min-h-[100px]"
            />
            <p className="text-xs text-muted-foreground">
              This will be added to your official timeline as a verified fact.
            </p>
          </div>

          {/* Verification Buttons */}
          <div className="flex gap-2">
            <Button
              onClick={() => verifyCurrentFact(true, userInput || undefined)}
              className="flex-1"
            >
              <Check className="h-4 w-4 mr-2" />✓ Approve & Add to Timeline
            </Button>
            <Button variant="outline" onClick={() => verifyCurrentFact(false)}>
              <X className="h-4 w-4 mr-2" />
              Skip This Fact
            </Button>
          </div>

          <p className="text-xs text-muted-foreground text-center">
            💡 You can always edit facts later in your Timeline tab
          </p>
        </CardContent>
      </Card>
    );
  };

  const renderCompletionPhase = () => (
    <Card className="legal-card">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <CheckCircle className="h-5 w-5 text-green-600" />
          Verification Complete!
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="text-center py-6">
          <CheckCircle className="h-16 w-16 text-green-600 mx-auto mb-4" />
          <h3 className="text-lg font-semibold mb-2">Excellent Work!</h3>
          <p className="text-muted-foreground mb-4">
            You've successfully verified {session?.verifiedFacts.length} facts
            and built the foundation of your legal case.
          </p>
        </div>

        <div className="bg-muted p-4 rounded-lg">
          <h4 className="font-semibold mb-2">📈 What's Next:</h4>
          <ul className="text-sm space-y-1">
            <li>• Review your Timeline tab to see all verified facts</li>
            <li>• Check the Evidence tab to link files to specific facts</li>
            <li>
              • Visit Persons & Entities to verify the people I identified
            </li>
            <li>• Continue building your case with additional evidence</li>
          </ul>
        </div>

        <Button onClick={() => setSession(null)} className="w-full">
          🎯 Continue Building My Case
        </Button>
      </CardContent>
    </Card>
  );

  if (isProcessing) {
    return renderAnalysisPhase();
  }

  if (!session) {
    return (
      <Card className="legal-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bot className="h-5 w-5 text-legal-primary" />
            AI Counsel Interview Engine
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <Sparkles className="h-12 w-12 text-legal-primary mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">
              Ready to Analyze Your Case
            </h3>
            <p className="text-muted-foreground mb-4">
              Upload files in the Dashboard tab, and I'll automatically start
              the verification process to help you build a strong legal case.
            </p>
            <Button
              onClick={initiateAnalysisSession}
              disabled={case_.evidence.length === 0}
            >
              🔍 Start AI Analysis
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  switch (session.phase) {
    case "briefing":
      return renderBriefingPhase();
    case "verification":
      return renderVerificationPhase();
    case "completion":
      return renderCompletionPhase();
    default:
      return null;
  }
}
