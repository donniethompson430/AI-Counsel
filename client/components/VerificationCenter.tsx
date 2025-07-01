import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  Clock,
  Users,
  FileText,
  CheckCircle,
  AlertCircle,
  Eye,
  ArrowRight,
} from "lucide-react";
import { Case } from "@shared/types";

interface VerificationCenterProps {
  case: Case;
  onStartVerification: () => void;
}

export default function VerificationCenter({
  case: case_,
  onStartVerification,
}: VerificationCenterProps) {
  // Calculate verification statistics
  const totalFacts = case_.timeline.length;
  const verifiedFacts = case_.timeline.filter((f) => f.verified).length;
  const totalPersons = case_.persons.length;
  const verifiedPersons = case_.persons.filter((p) => p.verified).length;
  const totalEvidence = case_.evidence.length;
  const linkedEvidence = case_.evidence.filter(
    (e) => e.factIds && e.factIds.length > 0,
  ).length;

  // Mock unverified items for demonstration
  const unverifiedItems = [
    {
      type: "event",
      description: "Traffic stop initiated at 10:15 PM",
      source: "Police Report",
      confidence: "high" as const,
    },
    {
      type: "person",
      description: "Officer Smith",
      source: "Police Report",
      confidence: "high" as const,
    },
    {
      type: "event",
      description: "Plaintiff ordered out of vehicle",
      source: "Bodycam.mp4",
      confidence: "medium" as const,
    },
    {
      type: "event",
      description: "Physical force applied during removal",
      source: "Bodycam.mp4",
      confidence: "high" as const,
    },
  ];

  const getItemIcon = (type: string) => {
    switch (type) {
      case "event":
        return Clock;
      case "person":
        return Users;
      default:
        return FileText;
    }
  };

  const getConfidenceColor = (confidence: string) => {
    switch (confidence) {
      case "high":
        return "bg-green-100 text-green-800";
      case "medium":
        return "bg-yellow-100 text-yellow-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <div className="space-y-6">
      {/* AI Briefing Card */}
      <Card className="legal-card border-legal-primary">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CheckCircle className="h-5 w-5 text-legal-primary" />
            AI Analysis Complete - Ready for Verification
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="bg-legal-accent p-4 rounded-lg">
            <p className="text-sm leading-relaxed">
              <strong>I have finished the initial analysis</strong> of the{" "}
              <strong>[{totalEvidence}]</strong> files you uploaded. I have
              identified a preliminary list of{" "}
              <strong>
                [{unverifiedItems.filter((i) => i.type === "event").length}]
              </strong>{" "}
              potential events and{" "}
              <strong>
                [{unverifiedItems.filter((i) => i.type === "person").length}]
              </strong>{" "}
              people of interest.
            </p>
            <p className="text-sm leading-relaxed mt-3">
              <strong>Let's begin the verification process</strong> to ensure
              every fact is 100% correct and legally structured.
            </p>
            <p className="text-sm leading-relaxed mt-3 font-medium">
              Ready to review the first event I found?
            </p>
          </div>

          <div className="flex gap-3">
            <Button onClick={onStartVerification} className="flex-1">
              <ArrowRight className="h-4 w-4 mr-2" />
              Yes, Let's Start Verification
            </Button>
            <Button variant="outline">Remind Me Later</Button>
          </div>
        </CardContent>
      </Card>

      {/* Case Status at a Glance */}
      <Card className="legal-card">
        <CardHeader>
          <CardTitle className="text-sm">📊 Case Status at a Glance</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center p-3 bg-muted rounded-lg">
              <div className="text-lg font-bold text-legal-primary">
                {verifiedFacts} /{" "}
                {Math.max(
                  totalFacts,
                  unverifiedItems.filter((i) => i.type === "event").length,
                )}
              </div>
              <div className="text-xs text-muted-foreground">
                Facts Verified
              </div>
              <Progress
                value={
                  (verifiedFacts /
                    Math.max(
                      1,
                      Math.max(
                        totalFacts,
                        unverifiedItems.filter((i) => i.type === "event")
                          .length,
                      ),
                    )) *
                  100
                }
                className="mt-2 h-2"
              />
            </div>
            <div className="text-center p-3 bg-muted rounded-lg">
              <div className="text-lg font-bold text-legal-primary">
                {linkedEvidence} / {totalEvidence}
              </div>
              <div className="text-xs text-muted-foreground">
                Evidence Linked
              </div>
              <Progress
                value={(linkedEvidence / Math.max(1, totalEvidence)) * 100}
                className="mt-2 h-2"
              />
            </div>
            <div className="text-center p-3 bg-muted rounded-lg">
              <div className="text-lg font-bold text-legal-primary">
                {verifiedPersons} /{" "}
                {Math.max(
                  totalPersons,
                  unverifiedItems.filter((i) => i.type === "person").length,
                )}
              </div>
              <div className="text-xs text-muted-foreground">
                Persons Verified
              </div>
              <Progress
                value={
                  (verifiedPersons /
                    Math.max(
                      1,
                      Math.max(
                        totalPersons,
                        unverifiedItems.filter((i) => i.type === "person")
                          .length,
                      ),
                    )) *
                  100
                }
                className="mt-2 h-2"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Unverified Items Queue */}
      <Card className="legal-card">
        <CardHeader>
          <CardTitle className="text-sm flex items-center gap-2">
            <AlertCircle className="h-4 w-4" />
            📋 Unverified Items Queue
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground mb-4">
            These items need your review and verification:
          </p>
          <div className="space-y-3">
            {unverifiedItems.map((item, index) => {
              const IconComponent = getItemIcon(item.type);
              return (
                <div
                  key={index}
                  className="flex items-center gap-3 p-3 border border-legal-border rounded-lg hover:bg-muted/50 transition-colors"
                >
                  <IconComponent className="h-4 w-4 text-legal-primary flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">
                      {item.description}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Source: {item.source}
                    </p>
                  </div>
                  <Badge className={getConfidenceColor(item.confidence)}>
                    {item.confidence}
                  </Badge>
                  <Eye className="h-4 w-4 text-muted-foreground" />
                </div>
              );
            })}
          </div>
          <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
            <p className="text-sm text-blue-800">
              💡 <strong>Pro Tip:</strong> Click "Yes, Let's Start Verification"
              above to begin the interactive interview process. I'll guide you
              through each item step-by-step.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
