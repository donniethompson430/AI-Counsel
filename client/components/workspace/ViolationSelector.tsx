import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Shield,
  Users,
  Gavel,
  CheckCircle,
  ArrowRight,
  AlertCircle,
} from "lucide-react";
import { Case } from "@shared/types";

interface ViolationSelectorProps {
  case: Case;
  onViolationSelect: (violationIds: string[]) => void;
  onCaseUpdate: (updatedCase: Case) => void;
}

interface LegalViolation {
  id: string;
  name: string;
  description: string;
  legalStandard: string;
  elements: string[];
  icon: any;
  commonIn: string[];
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
      "Physical Force Applied",
      "Crime Severity Assessment",
      "Immediate Threat Level",
      "Resistance or Flight Analysis",
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
    elements: ["Detention/Arrest Occurred", "Lack of Probable Cause"],
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
    elements: ["Search Conducted", "No Warrant or Valid Consent"],
  },
];

export default function ViolationSelector({
  case: case_,
  onViolationSelect,
  onCaseUpdate,
}: ViolationSelectorProps) {
  const [selectedViolations, setSelectedViolations] = useState<string[]>([]);

  const handleViolationToggle = (violationId: string) => {
    console.log("Violation clicked:", violationId);
    setSelectedViolations((prev) => {
      const newSelections = prev.includes(violationId)
        ? prev.filter((id) => id !== violationId)
        : [...prev, violationId];
      console.log("Updated selections:", newSelections);
      return newSelections;
    });
  };

  const handleStartInterview = () => {
    if (selectedViolations.length === 0) return;
    onViolationSelect(selectedViolations);
  };

  return (
    <div className="space-y-6">
      <Card className="legal-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5 text-legal-primary" />
            Legal Violation Analysis
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Alert className="mb-6">
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
                  className={`cursor-pointer transition-all hover:shadow-md ${
                    isSelected
                      ? "border-legal-primary bg-legal-accent ring-2 ring-legal-primary ring-opacity-20"
                      : "hover:bg-muted"
                  }`}
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    handleViolationToggle(violation.id);
                  }}
                >
                  <CardContent className="p-4">
                    <div className="flex items-start gap-3">
                      <Icon
                        className={`h-6 w-6 mt-1 ${isSelected ? "text-legal-primary" : "text-muted-foreground"}`}
                      />
                      <div className="flex-1">
                        <div className="flex items-start justify-between mb-2">
                          <h4 className="font-semibold">{violation.name}</h4>
                          {isSelected && (
                            <CheckCircle className="h-5 w-5 text-legal-primary" />
                          )}
                        </div>
                        <p className="text-sm text-muted-foreground mb-3">
                          {violation.description}
                        </p>
                        <div className="mb-3">
                          <h5 className="text-xs font-medium text-muted-foreground mb-1">
                            LEGAL STANDARD:
                          </h5>
                          <p className="text-xs text-muted-foreground">
                            {violation.legalStandard}
                          </p>
                        </div>
                        <div>
                          <h5 className="text-xs font-medium text-muted-foreground mb-1">
                            REQUIRED ELEMENTS:
                          </h5>
                          <div className="flex flex-wrap gap-1">
                            {violation.elements.map((element, idx) => (
                              <Badge
                                key={idx}
                                variant="outline"
                                className="text-xs"
                              >
                                {element}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>

          <div className="mt-6">
            <Button
              onClick={handleStartInterview}
              disabled={selectedViolations.length === 0}
              className="w-full"
              size="lg"
            >
              <ArrowRight className="h-4 w-4 mr-2" />
              Start Violation Interview ({selectedViolations.length} selected)
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
