import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Plus, Scale, FileText, Clock, Users, AlertCircle } from "lucide-react";
import { Case } from "@shared/types";
import { CaseManager } from "@/lib/case-management";
import { toast } from "@/hooks/use-toast";

export default function Dashboard() {
  const [cases, setCases] = useState<Case[]>([]);
  const [newCaseTitle, setNewCaseTitle] = useState("");
  const [newCaseDescription, setNewCaseDescription] = useState("");
  const [showNewCaseForm, setShowNewCaseForm] = useState(false);
  const navigate = useNavigate();
  const caseManager = CaseManager.getInstance();

  useEffect(() => {
    // Load existing cases
    setCases(caseManager.getCases());
  }, []);

  const handleCreateCase = () => {
    if (!newCaseTitle.trim()) {
      toast({
        title: "Error",
        description: "Please enter a title for your case",
        variant: "destructive",
      });
      return;
    }

    try {
      const newCase = caseManager.createCase(
        newCaseTitle.trim(),
        newCaseDescription.trim(),
      );
      setCases(caseManager.getCases());
      setNewCaseTitle("");
      setNewCaseDescription("");
      setShowNewCaseForm(false);

      toast({
        title: "Case Created",
        description: `Successfully created case '${newCase.title}' with ID ${newCase.id}`,
      });

      // Navigate to the new case
      navigate(`/case/${newCase.id}`);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to create case. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleOpenCase = (caseId: string) => {
    navigate(`/case/${caseId}`);
  };

  const getStatusColor = (status: Case["status"]) => {
    switch (status) {
      case "active":
        return "bg-blue-100 text-blue-800";
      case "filing":
        return "bg-yellow-100 text-yellow-800";
      case "litigation":
        return "bg-orange-100 text-orange-800";
      case "closed":
        return "bg-gray-100 text-gray-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    }).format(new Date(date));
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-legal-secondary via-white to-legal-accent">
      {/* Header */}
      <header className="bg-white border-b border-legal-accent shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Scale className="h-8 w-8 text-legal-primary" />
              <div>
                <h1 className="text-2xl font-bold text-legal-primary">
                  AI Counsel
                </h1>
                <p className="text-sm text-muted-foreground">
                  Legal Case Management Assistant
                </p>
              </div>
            </div>
            <Button
              onClick={() => setShowNewCaseForm(true)}
              className="bg-legal-primary hover:bg-legal-primary/90"
            >
              <Plus className="h-4 w-4 mr-2" />
              New Case
            </Button>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-foreground mb-2">
            ⚖️ My Cases
          </h2>
          <p className="text-muted-foreground">
            Manage your legal cases with AI-powered assistance. Build timelines,
            organize evidence, and generate professional documents.
          </p>
        </div>

        {/* New Case Form */}
        {showNewCaseForm && (
          <Card className="mb-8 legal-card animate-fade-in">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Plus className="h-5 w-5" />
                Create New Case
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label
                  htmlFor="case-title"
                  className="block text-sm font-medium mb-2"
                >
                  Case Title *
                </label>
                <Input
                  id="case-title"
                  placeholder="e.g., Traffic Stop - January 5th, 2024"
                  value={newCaseTitle}
                  onChange={(e) => setNewCaseTitle(e.target.value)}
                  className="w-full"
                />
              </div>
              <div>
                <label
                  htmlFor="case-description"
                  className="block text-sm font-medium mb-2"
                >
                  Description (Optional)
                </label>
                <Textarea
                  id="case-description"
                  placeholder="Brief description of the incident or case details..."
                  value={newCaseDescription}
                  onChange={(e) => setNewCaseDescription(e.target.value)}
                  rows={3}
                />
              </div>
              <div className="flex gap-2">
                <Button
                  onClick={handleCreateCase}
                  className="bg-legal-primary hover:bg-legal-primary/90"
                >
                  Create Case
                </Button>
                <Button
                  variant="outline"
                  onClick={() => {
                    setShowNewCaseForm(false);
                    setNewCaseTitle("");
                    setNewCaseDescription("");
                  }}
                >
                  Cancel
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Cases Grid */}
        <div className="space-y-6">
          {cases.length === 0 ? (
            <Card className="legal-card">
              <CardContent className="py-12 text-center">
                <Scale className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">No Cases Yet</h3>
                <p className="text-muted-foreground mb-4">
                  Create your first case to get started with AI-powered legal
                  assistance.
                </p>
                <Button
                  onClick={() => setShowNewCaseForm(true)}
                  className="bg-legal-primary hover:bg-legal-primary/90"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Create Your First Case
                </Button>
              </CardContent>
            </Card>
          ) : (
            <>
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {cases.map((case_) => (
                  <Card
                    key={case_.id}
                    className="legal-card cursor-pointer hover:shadow-lg transition-all duration-200"
                  >
                    <CardHeader className="pb-3">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <CardTitle className="text-lg font-semibold line-clamp-2 mb-1">
                            {case_.title}
                          </CardTitle>
                          <p className="text-sm text-muted-foreground font-mono">
                            ID: {case_.id}
                          </p>
                        </div>
                        <Badge className={getStatusColor(case_.status)}>
                          {case_.status}
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      {case_.description && (
                        <p className="text-sm text-muted-foreground line-clamp-2">
                          {case_.description}
                        </p>
                      )}

                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div className="flex items-center gap-2">
                          <Clock className="h-4 w-4 text-muted-foreground" />
                          <span>{case_.timeline.length} facts</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <FileText className="h-4 w-4 text-muted-foreground" />
                          <span>{case_.evidence.length} files</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Users className="h-4 w-4 text-muted-foreground" />
                          <span>{case_.persons.length} people</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <AlertCircle className="h-4 w-4 text-muted-foreground" />
                          <span>
                            {case_.deadlines.filter((d) => !d.completed).length}{" "}
                            deadlines
                          </span>
                        </div>
                      </div>

                      <div className="pt-2 border-t">
                        <div className="flex items-center justify-between text-xs text-muted-foreground mb-2">
                          <span>Created: {formatDate(case_.createdAt)}</span>
                          <span>Updated: {formatDate(case_.updatedAt)}</span>
                        </div>
                        <Button
                          onClick={() => handleOpenCase(case_.id)}
                          className="w-full bg-legal-primary hover:bg-legal-primary/90"
                          size="sm"
                        >
                          Open Case
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </>
          )}
        </div>

        {/* Quick Stats */}
        {cases.length > 0 && (
          <div className="mt-8 grid gap-4 md:grid-cols-4">
            <Card className="legal-card">
              <CardContent className="p-4">
                <div className="flex items-center gap-2">
                  <div className="p-2 bg-blue-100 rounded-lg">
                    <Scale className="h-4 w-4 text-blue-600" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Total Cases</p>
                    <p className="text-xl font-semibold">{cases.length}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="legal-card">
              <CardContent className="p-4">
                <div className="flex items-center gap-2">
                  <div className="p-2 bg-green-100 rounded-lg">
                    <FileText className="h-4 w-4 text-green-600" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">
                      Evidence Files
                    </p>
                    <p className="text-xl font-semibold">
                      {cases.reduce((acc, c) => acc + c.evidence.length, 0)}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="legal-card">
              <CardContent className="p-4">
                <div className="flex items-center gap-2">
                  <div className="p-2 bg-orange-100 rounded-lg">
                    <Clock className="h-4 w-4 text-orange-600" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">
                      Timeline Facts
                    </p>
                    <p className="text-xl font-semibold">
                      {cases.reduce((acc, c) => acc + c.timeline.length, 0)}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="legal-card">
              <CardContent className="p-4">
                <div className="flex items-center gap-2">
                  <div className="p-2 bg-red-100 rounded-lg">
                    <AlertCircle className="h-4 w-4 text-red-600" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">
                      Pending Deadlines
                    </p>
                    <p className="text-xl font-semibold">
                      {cases.reduce(
                        (acc, c) =>
                          acc + c.deadlines.filter((d) => !d.completed).length,
                        0,
                      )}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}
