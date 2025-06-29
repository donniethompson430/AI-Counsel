import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Clock,
  Plus,
  Eye,
  Network,
  Grid3X3,
  CheckCircle,
  AlertCircle,
  Calendar,
  FileText,
} from "lucide-react";
import { Case, TimelineFact } from "@shared/types";
import { CaseManager } from "@/lib/case-management";
import { toast } from "@/hooks/use-toast";

interface TimelineTabProps {
  case: Case;
  onCaseUpdate: (updatedCase: Case) => void;
}

type ViewMode = "chronology" | "relationship" | "evidence-matrix";

export default function TimelineTab({
  case: case_,
  onCaseUpdate,
}: TimelineTabProps) {
  const [viewMode, setViewMode] = useState<ViewMode>("chronology");
  const [showAddFact, setShowAddFact] = useState(false);
  const [newFact, setNewFact] = useState({
    description: "",
    timestamp: "",
    originalStatement: "",
  });
  const caseManager = CaseManager.getInstance();

  const handleAddFact = () => {
    if (!newFact.description.trim() || !newFact.timestamp) {
      toast({
        title: "Missing Information",
        description: "Please provide both description and timestamp",
        variant: "destructive",
      });
      return;
    }

    try {
      const factData = {
        description: newFact.description.trim(),
        timestamp: new Date(newFact.timestamp),
        originalStatement: newFact.originalStatement.trim(),
        verified: false,
        evidenceIds: [],
        personIds: [],
        legalConcepts: [],
      };

      caseManager.addTimelineFact(case_.id, factData);

      const updatedCase = caseManager.getCase(case_.id);
      if (updatedCase) {
        onCaseUpdate(updatedCase);
      }

      setNewFact({ description: "", timestamp: "", originalStatement: "" });
      setShowAddFact(false);

      toast({
        title: "Fact Added",
        description: "Timeline fact has been added to your case",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to add fact. Please try again.",
        variant: "destructive",
      });
    }
  };

  const formatDateTime = (date: Date) => {
    return new Intl.DateTimeFormat("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    }).format(new Date(date));
  };

  const getFactsByDate = () => {
    const sorted = [...case_.timeline].sort(
      (a, b) =>
        new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime(),
    );
    return sorted;
  };

  const renderChronologyView = () => {
    const facts = getFactsByDate();

    if (facts.length === 0) {
      return (
        <Card className="legal-card">
          <CardContent className="py-12 text-center">
            <Clock className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">
              No Timeline Facts Yet
            </h3>
            <p className="text-muted-foreground mb-4">
              Start building your case timeline by adding facts chronologically.
            </p>
            <Button
              onClick={() => setShowAddFact(true)}
              className="bg-legal-primary hover:bg-legal-primary/90"
            >
              <Plus className="h-4 w-4 mr-2" />
              Add First Fact
            </Button>
          </CardContent>
        </Card>
      );
    }

    return (
      <div className="space-y-4">
        {facts.map((fact, index) => (
          <Card key={fact.id} className="legal-card">
            <CardContent className="p-4">
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0">
                  <div className="w-8 h-8 rounded-full bg-legal-primary text-white text-sm flex items-center justify-center">
                    {fact.factNumber}
                  </div>
                </div>
                <div className="flex-1 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-legal-primary">
                      {formatDateTime(fact.timestamp)}
                    </span>
                    <div className="flex items-center gap-2">
                      {fact.verified ? (
                        <Badge className="bg-green-100 text-green-800">
                          <CheckCircle className="h-3 w-3 mr-1" />
                          Verified
                        </Badge>
                      ) : (
                        <Badge variant="outline">
                          <AlertCircle className="h-3 w-3 mr-1" />
                          Unverified
                        </Badge>
                      )}
                    </div>
                  </div>
                  <p className="text-foreground">{fact.description}</p>
                  {fact.originalStatement && (
                    <div className="bg-muted p-3 rounded-md">
                      <p className="text-sm text-muted-foreground mb-1">
                        Original Statement:
                      </p>
                      <p className="text-sm italic">
                        "{fact.originalStatement}"
                      </p>
                    </div>
                  )}
                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    <span>
                      Evidence: {fact.evidenceIds.length} file
                      {fact.evidenceIds.length !== 1 ? "s" : ""}
                    </span>
                    <span>
                      People: {fact.personIds.length} person
                      {fact.personIds.length !== 1 ? "s" : ""}
                    </span>
                    {fact.legalConcepts.length > 0 && (
                      <span>Legal concepts identified</span>
                    )}
                  </div>
                  {fact.legalConcepts.length > 0 && (
                    <div className="flex gap-2 flex-wrap">
                      {fact.legalConcepts.map((concept, i) => (
                        <Badge key={i} variant="secondary" className="text-xs">
                          {concept}
                        </Badge>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  };

  const renderRelationshipView = () => (
    <Card className="legal-card">
      <CardContent className="py-12 text-center">
        <Network className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
        <h3 className="text-lg font-semibold mb-2">Relationship Web</h3>
        <p className="text-muted-foreground mb-4">
          Interactive visualization showing connections between people, events,
          and evidence.
        </p>
        <Badge variant="secondary">Coming Soon</Badge>
      </CardContent>
    </Card>
  );

  const renderEvidenceMatrix = () => (
    <Card className="legal-card">
      <CardContent className="py-12 text-center">
        <Grid3X3 className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
        <h3 className="text-lg font-semibold mb-2">Evidence Matrix</h3>
        <p className="text-muted-foreground mb-4">
          Grid showing which evidence files support each timeline fact.
        </p>
        <Badge variant="secondary">Coming Soon</Badge>
      </CardContent>
    </Card>
  );

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-semibold flex items-center gap-2">
            <Clock className="h-6 w-6 text-legal-primary" />
            Factual Timeline
          </h2>
          <p className="text-muted-foreground">
            Build and visualize your case chronologically with multiple viewing
            modes.
          </p>
        </div>
        <Dialog open={showAddFact} onOpenChange={setShowAddFact}>
          <DialogTrigger asChild>
            <Button className="bg-legal-primary hover:bg-legal-primary/90">
              <Plus className="h-4 w-4 mr-2" />
              Add Fact
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Add Timeline Fact</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">
                  Date & Time *
                </label>
                <Input
                  type="datetime-local"
                  value={newFact.timestamp}
                  onChange={(e) =>
                    setNewFact({ ...newFact, timestamp: e.target.value })
                  }
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">
                  Fact Description *
                </label>
                <Textarea
                  placeholder="Describe what happened at this point in time..."
                  value={newFact.description}
                  onChange={(e) =>
                    setNewFact({ ...newFact, description: e.target.value })
                  }
                  rows={3}
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">
                  Original Statement (Optional)
                </label>
                <Textarea
                  placeholder="Your original words describing this event..."
                  value={newFact.originalStatement}
                  onChange={(e) =>
                    setNewFact({
                      ...newFact,
                      originalStatement: e.target.value,
                    })
                  }
                  rows={2}
                />
              </div>
              <div className="flex gap-2">
                <Button
                  onClick={handleAddFact}
                  className="bg-legal-primary hover:bg-legal-primary/90"
                >
                  Add Fact
                </Button>
                <Button variant="outline" onClick={() => setShowAddFact(false)}>
                  Cancel
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* View Mode Selector */}
      <Tabs value={viewMode} onValueChange={(v) => setViewMode(v as ViewMode)}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="chronology" className="flex items-center gap-2">
            <Clock className="h-4 w-4" />
            Chronology
          </TabsTrigger>
          <TabsTrigger value="relationship" className="flex items-center gap-2">
            <Network className="h-4 w-4" />
            Case Map
          </TabsTrigger>
          <TabsTrigger
            value="evidence-matrix"
            className="flex items-center gap-2"
          >
            <Grid3X3 className="h-4 w-4" />
            Evidence Matrix
          </TabsTrigger>
        </TabsList>

        <TabsContent value="chronology" className="space-y-4">
          {renderChronologyView()}
        </TabsContent>

        <TabsContent value="relationship" className="space-y-4">
          {renderRelationshipView()}
        </TabsContent>

        <TabsContent value="evidence-matrix" className="space-y-4">
          {renderEvidenceMatrix()}
        </TabsContent>
      </Tabs>

      {/* Timeline Stats */}
      {case_.timeline.length > 0 && (
        <Card className="legal-card">
          <CardHeader>
            <CardTitle className="text-lg">Timeline Statistics</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-legal-primary">
                  {case_.timeline.length}
                </div>
                <div className="text-sm text-muted-foreground">Total Facts</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">
                  {case_.timeline.filter((f) => f.verified).length}
                </div>
                <div className="text-sm text-muted-foreground">Verified</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-orange-600">
                  {case_.timeline.filter((f) => !f.verified).length}
                </div>
                <div className="text-sm text-muted-foreground">Need Review</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">
                  {
                    case_.timeline.filter((f) => f.legalConcepts.length > 0)
                      .length
                  }
                </div>
                <div className="text-sm text-muted-foreground">
                  Legal Issues
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
