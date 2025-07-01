import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Bot,
  Brain,
  Shield,
  Scale,
  Heart,
  Settings,
  Save,
  RotateCcw,
} from "lucide-react";
import { Case } from "@shared/types";

interface AIPersonaPanelProps {
  case: Case;
  onCaseUpdate: (updatedCase: Case) => void;
}

interface AIPersona {
  id: string;
  name: string;
  description: string;
  icon: any;
  style: string;
  specialties: string[];
}

const PERSONAS: AIPersona[] = [
  {
    id: "strategist",
    name: "Legal Strategist",
    description:
      "Analytical and methodical. Focuses on legal precedents and case strategy.",
    icon: Brain,
    style: "formal and analytical",
    specialties: ["Case Analysis", "Legal Research", "Strategy Planning"],
  },
  {
    id: "guide",
    name: "Compassionate Guide",
    description:
      "Empathetic and supportive. Helps you navigate complex legal processes.",
    icon: Heart,
    style: "warm and supportive",
    specialties: ["Emotional Support", "Process Guidance", "Education"],
  },
  {
    id: "advocate",
    name: "Strong Advocate",
    description:
      "Assertive and direct. Focused on protecting your rights and interests.",
    icon: Shield,
    style: "assertive and protective",
    specialties: ["Rights Protection", "Document Drafting", "Negotiation"],
  },
  {
    id: "counselor",
    name: "Legal Counselor",
    description:
      "Balanced and professional. Provides comprehensive legal advice.",
    icon: Scale,
    style: "balanced and professional",
    specialties: ["Legal Advice", "Risk Assessment", "Compliance"],
  },
];

export default function AIPersonaPanel({
  case: case_,
  onCaseUpdate,
}: AIPersonaPanelProps) {
  const [selectedPersona, setSelectedPersona] = useState<string>("guide");
  const [customInstructions, setCustomInstructions] = useState("");
  const [communicationStyle, setCommunicationStyle] = useState("balanced");
  const [priorities, setPriorities] = useState<string[]>([]);

  const handlePersonaChange = (personaId: string) => {
    setSelectedPersona(personaId);
  };

  const handleSaveSettings = () => {
    // In a real app, this would save to the case or user preferences
    console.log("Saving AI settings:", {
      persona: selectedPersona,
      customInstructions,
      communicationStyle,
      priorities,
    });
  };

  const handleReset = () => {
    setSelectedPersona("guide");
    setCustomInstructions("");
    setCommunicationStyle("balanced");
    setPriorities([]);
  };

  const togglePriority = (priority: string) => {
    setPriorities((prev) =>
      prev.includes(priority)
        ? prev.filter((p) => p !== priority)
        : [...prev, priority],
    );
  };

  const getPersona = (id: string) => PERSONAS.find((p) => p.id === id);
  const currentPersona = getPersona(selectedPersona);

  const priorityOptions = [
    "Speed",
    "Accuracy",
    "Simplicity",
    "Detail",
    "Empathy",
    "Assertiveness",
  ];

  const styleOptions = [
    { id: "formal", label: "Formal" },
    { id: "casual", label: "Casual" },
    { id: "balanced", label: "Balanced" },
    { id: "technical", label: "Technical" },
  ];

  return (
    <div className="p-4 space-y-4 border-t border-legal-border">
      <div className="flex items-center gap-2 mb-4">
        <Bot className="h-4 w-4 text-legal-primary" />
        <h4 className="font-semibold text-sm">AI Assistant Settings</h4>
      </div>

      {/* Persona Selection */}
      <div className="space-y-2">
        <Label className="text-xs font-medium text-muted-foreground">
          AI PERSONA
        </Label>
        <div className="space-y-2">
          {PERSONAS.map((persona) => {
            const Icon = persona.icon;
            const isSelected = selectedPersona === persona.id;

            return (
              <Card
                key={persona.id}
                className={`cursor-pointer transition-all ${
                  isSelected
                    ? "border-legal-primary bg-legal-accent"
                    : "hover:bg-muted"
                }`}
                onClick={() => handlePersonaChange(persona.id)}
              >
                <CardContent className="p-3">
                  <div className="flex items-start gap-2">
                    <Icon
                      className={`h-4 w-4 mt-0.5 ${isSelected ? "text-legal-primary" : "text-muted-foreground"}`}
                    />
                    <div className="flex-1">
                      <h5 className="font-medium text-xs">{persona.name}</h5>
                      <p className="text-xs text-muted-foreground mt-1">
                        {persona.description}
                      </p>
                      <div className="flex flex-wrap gap-1 mt-2">
                        {persona.specialties.map((specialty) => (
                          <Badge
                            key={specialty}
                            variant="outline"
                            className="text-xs"
                          >
                            {specialty}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>

      {/* Communication Style */}
      <div className="space-y-2">
        <Label className="text-xs font-medium text-muted-foreground">
          COMMUNICATION STYLE
        </Label>
        <div className="grid grid-cols-2 gap-2">
          {styleOptions.map((style) => (
            <Button
              key={style.id}
              variant={communicationStyle === style.id ? "default" : "outline"}
              size="sm"
              onClick={() => setCommunicationStyle(style.id)}
              className="text-xs"
            >
              {style.label}
            </Button>
          ))}
        </div>
      </div>

      {/* Priorities */}
      <div className="space-y-2">
        <Label className="text-xs font-medium text-muted-foreground">
          PRIORITIES
        </Label>
        <div className="flex flex-wrap gap-1">
          {priorityOptions.map((priority) => (
            <Button
              key={priority}
              variant={priorities.includes(priority) ? "default" : "outline"}
              size="sm"
              onClick={() => togglePriority(priority)}
              className="text-xs"
            >
              {priority}
            </Button>
          ))}
        </div>
      </div>

      {/* Custom Instructions */}
      <div className="space-y-2">
        <Label className="text-xs font-medium text-muted-foreground">
          CUSTOM INSTRUCTIONS
        </Label>
        <Textarea
          value={customInstructions}
          onChange={(e) => setCustomInstructions(e.target.value)}
          placeholder="Any specific instructions for how the AI should help you..."
          className="text-xs"
          rows={3}
        />
      </div>

      {/* Current Settings Summary */}
      {currentPersona && (
        <Card className="bg-blue-50 border-blue-200">
          <CardContent className="p-3">
            <h5 className="font-medium text-xs text-blue-800 mb-1">
              Current AI: {currentPersona.name}
            </h5>
            <p className="text-xs text-blue-700">
              Style: {currentPersona.style}
            </p>
            {priorities.length > 0 && (
              <p className="text-xs text-blue-700 mt-1">
                Focus: {priorities.join(", ")}
              </p>
            )}
          </CardContent>
        </Card>
      )}

      {/* Action Buttons */}
      <div className="flex gap-2">
        <Button onClick={handleSaveSettings} size="sm" className="flex-1">
          <Save className="h-3 w-3 mr-1" />
          Save
        </Button>
        <Button onClick={handleReset} variant="outline" size="sm">
          <RotateCcw className="h-3 w-3" />
        </Button>
      </div>
    </div>
  );
}
