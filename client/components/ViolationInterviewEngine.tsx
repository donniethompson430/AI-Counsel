import { useState, useRef, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Scale,
  CheckCircle,
  AlertCircle,
  ArrowRight,
  ArrowLeft,
  Check,
  X,
  BookOpen,
  Gavel,
  Shield,
  Users,
} from "lucide-react";
import { Case, TimelineFact } from "@shared/types";
import { CaseManager } from "@/lib/case-management";

interface ViolationInterviewProps {
  case: Case;
  onCaseUpdate: (updatedCase: Case) => void;
}

interface LegalViolation {
  id: string;
  name: string;
  description: string;
  legalStandard: string;
  elements: ViolationElement[];
  icon: any;
  commonIn: string[];
}

interface ViolationElement {
  id: string;
  name: string;
  description: string;
  questions: InterviewQuestion[];
  required: boolean;
}

interface InterviewQuestion {
  id: string;
  question: string;
  type: "text" | "choice" | "datetime" | "yes_no";
  choices?: string[];
  followUpQuestions?: InterviewQuestion[];
}

interface ViolationAssessment {
  violationId: string;
  elements: ElementAssessment[];
  overallStrength: "strong" | "moderate" | "weak" | "insufficient";
  recommendedAction: string;
  facts: TimelineFact[];
}

interface ElementAssessment {
  elementId: string;
  satisfied: boolean;
  evidence: string[];
  notes: string;
}

const VIOLATIONS: LegalViolation[] = [
  {
    id: "excessive_force",
    name: "Excessive Force",
    description:
      "Use of force that was objectively unreasonable under the circumstances",
    legalStandard:
      "Under Graham v. Connor, courts analyze whether force was 'objectively reasonable' from the perspective of a reasonable officer at the scene, considering: (1) severity of crime, (2) immediate threat to safety, (3) active resistance or flight attempt.",
    icon: Shield,
    commonIn: ["traffic_stops", "arrests", "searches"],
    elements: [
      {
        id: "force_used",
        name: "Physical Force Applied",
        description: "Officer used physical force against you",
        required: true,
        questions: [
          {
            id: "force_type",
            question: "What type of physical force did the officer use?",
            type: "choice",
            choices: [
              "Grabbed/pulled",
              "Pushed/shoved",
              "Hit/struck",
              "Threw to ground",
              "Tased",
              "Pepper spray",
              "Other",
            ],
          },
          {
            id: "force_description",
            question:
              "Describe exactly what the officer did (be specific about body parts, intensity, duration):",
            type: "text",
          },
          {
            id: "injuries",
            question: "Did you sustain any injuries?",
            type: "yes_no",
            followUpQuestions: [
              {
                id: "injury_details",
                question:
                  "Describe your injuries and any medical treatment received:",
                type: "text",
              },
            ],
          },
        ],
      },
      {
        id: "crime_severity",
        name: "Minor/Serious Crime",
        description: "The severity of the suspected offense",
        required: true,
        questions: [
          {
            id: "alleged_crime",
            question: "What was the stated reason for the stop/arrest?",
            type: "text",
          },
          {
            id: "crime_category",
            question: "What type of offense was this?",
            type: "choice",
            choices: [
              "Traffic violation",
              "Minor misdemeanor",
              "Felony",
              "No specific crime stated",
            ],
          },
        ],
      },
      {
        id: "threat_level",
        name: "Immediate Threat Assessment",
        description:
          "Whether you posed an immediate threat to officer or public safety",
        required: true,
        questions: [
          {
            id: "weapons",
            question: "Did you have any weapons?",
            type: "yes_no",
          },
          {
            id: "threatening_behavior",
            question: "Did you make any threatening gestures or movements?",
            type: "yes_no",
          },
          {
            id: "verbal_threats",
            question: "Did you make any verbal threats?",
            type: "yes_no",
          },
          {
            id: "officer_fear",
            question:
              "Did the officer state they felt threatened? If so, what did they say?",
            type: "text",
          },
        ],
      },
      {
        id: "resistance_flight",
        name: "Resistance or Flight",
        description:
          "Whether you were actively resisting or attempting to flee",
        required: true,
        questions: [
          {
            id: "physical_resistance",
            question: "Were you physically resisting arrest?",
            type: "yes_no",
            followUpQuestions: [
              {
                id: "resistance_details",
                question: "Describe your physical resistance:",
                type: "text",
              },
            ],
          },
          {
            id: "compliance",
            question: "Were you following the officer's commands?",
            type: "choice",
            choices: [
              "Fully compliant",
              "Asking questions but complying",
              "Refusing some commands",
              "Completely non-compliant",
            ],
          },
          {
            id: "flight_attempt",
            question: "Were you trying to flee or escape?",
            type: "yes_no",
          },
        ],
      },
    ],
  },
  {
    id: "false_arrest",
    name: "False Arrest/Unlawful Detention",
    description:
      "Arrest or detention without probable cause or legal justification",
    legalStandard:
      "An arrest is unlawful if the officer lacked probable cause - specific facts that would lead a reasonable person to believe you committed a crime. For traffic stops, officer needs reasonable suspicion of a traffic violation or criminal activity.",
    icon: Users,
    commonIn: ["traffic_stops", "searches", "investigations"],
    elements: [
      {
        id: "detention_arrest",
        name: "Detention/Arrest Occurred",
        description: "You were actually detained or arrested",
        required: true,
        questions: [
          {
            id: "detention_type",
            question: "What happened?",
            type: "choice",
            choices: [
              "Traffic stop/pulled over",
              "Detained for investigation",
              "Formally arrested",
              "Handcuffed",
              "Taken to station/jail",
            ],
          },
          {
            id: "duration",
            question: "How long were you detained?",
            type: "text",
          },
        ],
      },
      {
        id: "probable_cause",
        name: "Lack of Probable Cause",
        description: "Officer lacked sufficient facts to justify the arrest",
        required: true,
        questions: [
          {
            id: "stated_reason",
            question:
              "What reason did the officer give for stopping/arresting you?",
            type: "text",
          },
          {
            id: "crime_actually_committed",
            question:
              "Did you actually commit the offense they accused you of?",
            type: "yes_no",
          },
          {
            id: "officer_evidence",
            question:
              "What evidence did the officer have that you committed a crime?",
            type: "text",
          },
        ],
      },
    ],
  },
  {
    id: "unlawful_search",
    name: "Unlawful Search and Seizure",
    description:
      "Search conducted without warrant, consent, or legal exception",
    legalStandard:
      "Fourth Amendment requires searches be reasonable. Generally need warrant based on probable cause, unless: (1) consent given, (2) search incident to arrest, (3) plain view, (4) exigent circumstances, (5) automobile exception.",
    icon: Gavel,
    commonIn: ["traffic_stops", "home_searches", "person_searches"],
    elements: [
      {
        id: "search_occurred",
        name: "Search Conducted",
        description: "Officer searched your person, vehicle, or property",
        required: true,
        questions: [
          {
            id: "search_type",
            question: "What did the officer search?",
            type: "choice",
            choices: [
              "My person/clothing",
              "My vehicle",
              "My home/property",
              "My belongings/bags",
            ],
          },
          {
            id: "search_scope",
            question:
              "Describe what areas were searched and what they were looking for:",
            type: "text",
          },
        ],
      },
      {
        id: "warrant_consent",
        name: "No Warrant or Valid Consent",
        description: "Search lacked proper authorization",
        required: true,
        questions: [
          {
            id: "warrant_shown",
            question: "Did the officer show you a search warrant?",
            type: "yes_no",
          },
          {
            id: "consent_given",
            question: "Did you give permission for the search?",
            type: "choice",
            choices: [
              "Yes, I consented",
              "No, I refused",
              "I said nothing",
              "I said 'I don't consent'",
            ],
          },
          {
            id: "consent_details",
            question: "Describe exactly what was said about the search:",
            type: "text",
          },
        ],
      },
    ],
  },
];

export default function ViolationInterviewEngine({
  case: case_,
  onCaseUpdate,
}: ViolationInterviewProps) {
  const [currentPhase, setCurrentPhase] = useState<
    "selection" | "interview" | "assessment"
  >("selection");
  const [selectedViolations, setSelectedViolations] = useState<string[]>([]);
  const [currentViolationIndex, setCurrentViolationIndex] = useState(0);
  const [currentElementIndex, setCurrentElementIndex] = useState(0);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, any>>({});
  const [assessments, setAssessments] = useState<ViolationAssessment[]>([]);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const caseManager = CaseManager.getInstance();

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [
    currentPhase,
    currentViolationIndex,
    currentElementIndex,
    currentQuestionIndex,
  ]);

  const handleViolationSelection = (violationId: string) => {
    console.log("Violation clicked:", violationId);
    setSelectedViolations((prev) => {
      const newSelections = prev.includes(violationId)
        ? prev.filter((id) => id !== violationId)
        : [...prev, violationId];
      console.log("Updated selections:", newSelections);
      return newSelections;
    });
  };

  const startInterview = () => {
    if (selectedViolations.length === 0) return;
    setCurrentPhase("interview");
    setCurrentViolationIndex(0);
    setCurrentElementIndex(0);
    setCurrentQuestionIndex(0);
  };

  const getCurrentViolation = () =>
    VIOLATIONS.find((v) => v.id === selectedViolations[currentViolationIndex]);
  const getCurrentElement = () =>
    getCurrentViolation()?.elements[currentElementIndex];
  const getCurrentQuestion = () =>
    getCurrentElement()?.questions[currentQuestionIndex];

  const handleAnswer = (answer: any) => {
    const violation = getCurrentViolation();
    const element = getCurrentElement();
    const question = getCurrentQuestion();

    if (!violation || !element || !question) return;

    const answerKey = `${violation.id}.${element.id}.${question.id}`;
    setAnswers((prev) => ({ ...prev, [answerKey]: answer }));

    // Move to next question
    moveToNextQuestion();
  };

  const moveToNextQuestion = () => {
    const currentViolation = getCurrentViolation();
    const currentElement = getCurrentElement();

    if (!currentViolation || !currentElement) return;

    // Check if there are more questions in current element
    if (currentQuestionIndex < currentElement.questions.length - 1) {
      setCurrentQuestionIndex((prev) => prev + 1);
      return;
    }

    // Move to next element
    if (currentElementIndex < currentViolation.elements.length - 1) {
      setCurrentElementIndex((prev) => prev + 1);
      setCurrentQuestionIndex(0);
      return;
    }

    // Move to next violation
    if (currentViolationIndex < selectedViolations.length - 1) {
      setCurrentViolationIndex((prev) => prev + 1);
      setCurrentElementIndex(0);
      setCurrentQuestionIndex(0);
      return;
    }

    // Interview complete
    completeInterview();
  };

  const completeInterview = () => {
    // Generate assessments and facts based on answers
    const newAssessments = generateAssessments();
    setAssessments(newAssessments);
    setCurrentPhase("assessment");

    // Add facts to timeline
    newAssessments.forEach((assessment) => {
      assessment.facts.forEach((fact) => {
        caseManager.addTimelineFact(case_.id, fact);
      });
    });

    // Update case
    const updatedCase = caseManager.getCase(case_.id);
    if (updatedCase) {
      onCaseUpdate(updatedCase);
    }
  };

  const generateAssessments = (): ViolationAssessment[] => {
    return selectedViolations.map((violationId) => {
      const violation = VIOLATIONS.find((v) => v.id === violationId)!;
      const elementAssessments: ElementAssessment[] = [];
      const facts: TimelineFact[] = [];

      violation.elements.forEach((element) => {
        const elementAnswers = Object.entries(answers).filter(([key]) =>
          key.startsWith(`${violationId}.${element.id}.`),
        );

        // Analyze answers to determine if element is satisfied
        const satisfied = analyzeElementSatisfaction(element, elementAnswers);

        elementAssessments.push({
          elementId: element.id,
          satisfied,
          evidence: elementAnswers.map(([_, answer]) => String(answer)),
          notes: `Based on interview responses for ${element.name}`,
        });

        // Generate facts from answers
        elementAnswers.forEach(([key, answer]) => {
          const questionId = key.split(".").pop()!;
          const question = element.questions.find((q) => q.id === questionId);
          if (question && answer) {
            facts.push({
              id: `fact-${Date.now()}-${key}`,
              factNumber: facts.length + 1,
              description: `${question.question}: ${answer}`,
              date: new Date(),
              timestamp: new Date(),
              source: "Violation Interview",
              verified: true,
              linkedEvidenceIds: [],
              linkedPersonIds: [],
              tags: [violation.name, element.name],
              createdAt: new Date(),
            });
          }
        });
      });

      const overallStrength = calculateOverallStrength(elementAssessments);

      return {
        violationId,
        elements: elementAssessments,
        overallStrength,
        recommendedAction: generateRecommendation(violation, overallStrength),
        facts,
      };
    });
  };

  const analyzeElementSatisfaction = (
    element: ViolationElement,
    answers: [string, any][],
  ): boolean => {
    // Simple heuristic - this could be much more sophisticated
    return (
      answers.length > 0 &&
      answers.some(
        ([_, answer]) => answer && answer !== "No" && answer !== "false",
      )
    );
  };

  const calculateOverallStrength = (
    elements: ElementAssessment[],
  ): "strong" | "moderate" | "weak" | "insufficient" => {
    const satisfiedCount = elements.filter((e) => e.satisfied).length;
    const requiredCount = elements.length;
    const ratio = satisfiedCount / requiredCount;

    if (ratio >= 0.8) return "strong";
    if (ratio >= 0.6) return "moderate";
    if (ratio >= 0.4) return "weak";
    return "insufficient";
  };

  const generateRecommendation = (
    violation: LegalViolation,
    strength: string,
  ): string => {
    switch (strength) {
      case "strong":
        return `You have strong evidence for a ${violation.name} claim. Consider proceeding with legal action.`;
      case "moderate":
        return `You have some evidence for a ${violation.name} claim. Gather additional evidence to strengthen your case.`;
      case "weak":
        return `Limited evidence for a ${violation.name} claim. Focus on gathering more supporting evidence.`;
      default:
        return `Insufficient evidence for a ${violation.name} claim at this time.`;
    }
  };

  const renderSelectionPhase = () => (
    <div className="space-y-6">
      <Card className="legal-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Scale className="h-5 w-5 text-legal-primary" />
            Select Potential Violations
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Alert className="mb-4">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              <strong>Focus on Violations First:</strong> Instead of extracting
              random facts, let's identify what legal violations may have
              occurred. I'll then interview you specifically about the elements
              needed to prove each violation.
            </AlertDescription>
          </Alert>

          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Based on your case type, select which violations you believe may
              have occurred:
            </p>

            {selectedViolations.length > 0 && (
              <div className="bg-green-50 border border-green-200 p-3 rounded-lg">
                <p className="text-sm text-green-800">
                  <strong>Selected:</strong> {selectedViolations.length}{" "}
                  violation(s)
                </p>
                <div className="flex flex-wrap gap-1 mt-2">
                  {selectedViolations.map((id) => {
                    const violation = VIOLATIONS.find((v) => v.id === id);
                    return (
                      <Badge key={id} className="bg-green-100 text-green-800">
                        {violation?.name}
                      </Badge>
                    );
                  })}
                </div>
              </div>
            )}

            {VIOLATIONS.map((violation) => {
              const Icon = violation.icon;
              const isSelected = selectedViolations.includes(violation.id);

              return (
                <Card
                  key={violation.id}
                  className={`cursor-pointer transition-colors ${
                    isSelected
                      ? "border-legal-primary bg-legal-accent"
                      : "hover:bg-muted"
                  }`}
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    handleViolationSelection(violation.id);
                  }}
                >
                  <CardContent className="p-4">
                    <div className="flex items-start gap-3">
                      <Icon
                        className={`h-5 w-5 mt-1 ${isSelected ? "text-legal-primary" : "text-muted-foreground"}`}
                      />
                      <div className="flex-1">
                        <h4 className="font-semibold mb-1">{violation.name}</h4>
                        <p className="text-sm text-muted-foreground mb-2">
                          {violation.description}
                        </p>
                        <div className="text-xs text-muted-foreground">
                          <strong>Legal Standard:</strong>{" "}
                          {violation.legalStandard}
                        </div>
                      </div>
                      {isSelected && (
                        <CheckCircle className="h-5 w-5 text-legal-primary" />
                      )}
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>

          <div className="mt-6 flex gap-2">
            <Button
              onClick={startInterview}
              disabled={selectedViolations.length === 0}
              className="flex-1"
            >
              <ArrowRight className="h-4 w-4 mr-2" />
              Start Violation Interview ({selectedViolations.length} selected)
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );

  const renderInterviewPhase = () => {
    const violation = getCurrentViolation();
    const element = getCurrentElement();
    const question = getCurrentQuestion();

    if (!violation || !element || !question) return null;

    const progress =
      ((currentViolationIndex * 100 +
        currentElementIndex * 25 +
        currentQuestionIndex * 5) /
        (selectedViolations.length * 100)) *
      100;

    return (
      <div className="space-y-6">
        <Card className="legal-card">
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Scale className="h-5 w-5 text-legal-primary" />
                Violation Interview: {violation.name}
              </div>
              <Badge variant="outline">
                {currentViolationIndex + 1} of {selectedViolations.length}
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <Progress value={progress} className="w-full" />

            {/* Current Element Context */}
            <div className="bg-blue-50 border border-blue-200 p-4 rounded-lg">
              <h4 className="font-semibold mb-2">
                Legal Element: {element.name}
              </h4>
              <p className="text-sm text-blue-800">{element.description}</p>
              {element.required && (
                <Badge className="mt-2 bg-red-100 text-red-800">
                  Required Element
                </Badge>
              )}
            </div>

            {/* Question */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">{question.question}</h3>

              {question.type === "text" && (
                <Textarea
                  placeholder="Describe in detail..."
                  className="min-h-[100px]"
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && e.ctrlKey) {
                      handleAnswer(e.currentTarget.value);
                    }
                  }}
                />
              )}

              {question.type === "choice" && question.choices && (
                <div className="grid gap-2">
                  {question.choices.map((choice, index) => (
                    <Button
                      key={index}
                      variant="outline"
                      className="justify-start text-left h-auto p-3"
                      onClick={() => handleAnswer(choice)}
                    >
                      {choice}
                    </Button>
                  ))}
                </div>
              )}

              {question.type === "yes_no" && (
                <div className="flex gap-2">
                  <Button
                    onClick={() => handleAnswer("Yes")}
                    className="flex-1"
                  >
                    Yes
                  </Button>
                  <Button
                    onClick={() => handleAnswer("No")}
                    variant="outline"
                    className="flex-1"
                  >
                    No
                  </Button>
                </div>
              )}

              {question.type === "datetime" && (
                <Input
                  type="datetime-local"
                  onChange={(e) => handleAnswer(e.target.value)}
                />
              )}
            </div>

            <div className="flex justify-between">
              <Button variant="outline" onClick={() => handleAnswer("Skip")}>
                Skip Question
              </Button>
              <div className="text-xs text-muted-foreground">
                Press Ctrl+Enter to submit text answers
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  };

  const renderAssessmentPhase = () => (
    <div className="space-y-6">
      <Card className="legal-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CheckCircle className="h-5 w-5 text-green-600" />
            Violation Assessment Complete
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-6">
            <CheckCircle className="h-16 w-16 text-green-600 mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">
              Legal Analysis Complete!
            </h3>
            <p className="text-muted-foreground mb-4">
              I've analyzed your responses and built a legal framework for your
              case.
            </p>
          </div>

          {assessments.map((assessment, index) => {
            const violation = VIOLATIONS.find(
              (v) => v.id === assessment.violationId,
            )!;
            const strengthColor = {
              strong: "text-green-600 bg-green-100",
              moderate: "text-yellow-600 bg-yellow-100",
              weak: "text-orange-600 bg-orange-100",
              insufficient: "text-red-600 bg-red-100",
            }[assessment.overallStrength];

            return (
              <Card key={index} className="mb-4">
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <span>{violation.name}</span>
                    <Badge className={strengthColor}>
                      {assessment.overallStrength.toUpperCase()}
                    </Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm mb-4">{assessment.recommendedAction}</p>

                  <div className="space-y-2">
                    <h5 className="font-semibold text-sm">
                      Elements Analysis:
                    </h5>
                    {assessment.elements.map((element, idx) => {
                      const elementDef = violation.elements.find(
                        (e) => e.id === element.elementId,
                      )!;
                      return (
                        <div
                          key={idx}
                          className="flex items-center gap-2 text-sm"
                        >
                          {element.satisfied ? (
                            <Check className="h-4 w-4 text-green-600" />
                          ) : (
                            <X className="h-4 w-4 text-red-600" />
                          )}
                          <span
                            className={
                              element.satisfied
                                ? "text-green-800"
                                : "text-red-800"
                            }
                          >
                            {elementDef.name}
                          </span>
                        </div>
                      );
                    })}
                  </div>

                  <div className="mt-3 text-xs text-muted-foreground">
                    Generated {assessment.facts.length} timeline facts from this
                    violation
                  </div>
                </CardContent>
              </Card>
            );
          })}

          <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <h4 className="font-semibold mb-2">📈 What's Next:</h4>
            <ul className="text-sm space-y-1">
              <li>• Review your Timeline tab to see all generated facts</li>
              <li>• Upload supporting evidence for weak elements</li>
              <li>• Consider additional violations if applicable</li>
              <li>• Move to Documents tab when ready to draft complaints</li>
            </ul>
          </div>

          <Button
            onClick={() => setCurrentPhase("selection")}
            className="w-full mt-4"
          >
            Start New Violation Analysis
          </Button>
        </CardContent>
      </Card>
    </div>
  );

  return (
    <div className="p-6">
      {currentPhase === "selection" && renderSelectionPhase()}
      {currentPhase === "interview" && renderInterviewPhase()}
      {currentPhase === "assessment" && renderAssessmentPhase()}
      <div ref={messagesEndRef} />
    </div>
  );
}
