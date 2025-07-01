import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  Scale,
  Clock,
  FolderOpen,
  Users,
  BookOpen,
  FileText,
  Calendar,
  StickyNote,
  Shield,
  Settings,
  Heart,
  Bot,
  Network,
  BarChart3,
  Zap,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Case } from "@shared/types";
import { CaseManager } from "@/lib/case-management";
import { toast } from "@/hooks/use-toast";

// Import workspace components
import TimelineTab from "@/components/workspace/TimelineTab";
import EvidenceTab from "@/components/workspace/EvidenceTab";
import PersonsTab from "@/components/workspace/PersonsTab";
import SourcesTab from "@/components/workspace/SourcesTab";
import DocumentsTab from "@/components/workspace/DocumentsTab";
import DeadlinesTab from "@/components/workspace/DeadlinesTab";
import NotesTab from "@/components/workspace/NotesTab";
import CenterArea from "@/components/workspace/CenterArea";
import RightSidebar from "@/components/workspace/RightSidebar";
import AIPersonaPanel from "@/components/workspace/AIPersonaPanel";
import QuickActions from "@/components/workspace/QuickActions";

type TabType =
  | "summary"
  | "violations"
  | "ai"
  | "timeline"
  | "evidence"
  | "persons"
  | "sources"
  | "documents"
  | "deadlines"
  | "notes";

const TABS = [
  { id: "summary", name: "📊 Case Summary", icon: BarChart3 },
  { id: "violations", name: "⚖️ Violations", icon: Shield },
  { id: "ai", name: "🤖 AI Settings", icon: Bot },
  { id: "timeline", name: "⏳ Timeline", icon: Clock },
  { id: "evidence", name: "🗄 Evidence", icon: FolderOpen },
  { id: "persons", name: "👥 Persons", icon: Users },
  { id: "sources", name: "📚 Sources", icon: BookOpen },
  { id: "documents", name: "✍️ Documents", icon: FileText },
  { id: "deadlines", name: "📅 Deadlines", icon: Calendar },
  { id: "notes", name: "📝 Notes", icon: StickyNote },
] as const;

type RightPanelView = "nodes" | "timeline" | "stats" | "activity";

export default function CaseWorkspace() {
  const { caseId } = useParams<{ caseId: string }>();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<TabType>("summary");
  const [case_, setCase] = useState<Case | null>(null);
  const [wellnessMode, setWellnessMode] = useState(false);
  const [rightPanelView, setRightPanelView] = useState<RightPanelView>("nodes");
  const caseManager = CaseManager.getInstance();

  useEffect(() => {
    if (!caseId) {
      navigate("/");
      return;
    }

    const foundCase = caseManager.getCase(caseId);
    if (!foundCase) {
      toast({
        title: "Case Not Found",
        description: "The requested case could not be found.",
        variant: "destructive",
      });
      navigate("/");
      return;
    }

    setCase(foundCase);
    caseManager.setActiveCase(caseId);
  }, [caseId, navigate]);

  const handleBackToDashboard = () => {
    navigate("/");
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

  const renderSidebarContent = () => {
    if (!case_) return null;

    // For tabs that need special handling in the sidebar
    switch (activeTab) {
      case "ai":
        return <AIPersonaPanel case={case_} onCaseUpdate={setCase} />;
      default:
        return null;
    }
  };

  const renderCenterContent = () => {
    if (!case_) return null;

    // All interactive content goes in the center area
    switch (activeTab) {
      case "summary":
      case "violations":
      case "ai":
        return (
          <CenterArea
            case={case_}
            activeTab={activeTab}
            onCaseUpdate={setCase}
            onTabChange={setActiveTab}
          />
        );
      case "timeline":
        return <TimelineTab case={case_} onCaseUpdate={setCase} />;
      case "evidence":
        return <EvidenceTab case={case_} onCaseUpdate={setCase} />;
      case "persons":
        return <PersonsTab case={case_} onCaseUpdate={setCase} />;
      case "sources":
        return <SourcesTab case={case_} onCaseUpdate={setCase} />;
      case "documents":
        return <DocumentsTab case={case_} onCaseUpdate={setCase} />;
      case "deadlines":
        return <DeadlinesTab case={case_} onCaseUpdate={setCase} />;
      case "notes":
        return <NotesTab case={case_} onCaseUpdate={setCase} />;
      default:
        return <div className="p-6">Content not implemented yet.</div>;
    }
  };

  if (!case_) {
    return (
      <div className="min-h-screen bg-legal-secondary flex items-center justify-center">
        <div className="text-center">
          <Scale className="h-16 w-16 text-legal-primary mx-auto mb-4 animate-spin" />
          <p className="text-muted-foreground">Loading case...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-legal-secondary flex">
      {/* Left Sidebar - Navigation */}
      <div className="w-64 bg-white border-r border-legal-border shadow-sm flex flex-col">
        {/* Header */}
        <div className="p-4 border-b border-legal-border">
          <div className="flex items-center gap-2 mb-3">
            <Scale className="h-6 w-6 text-legal-primary" />
            <span className="font-semibold text-legal-primary">AI Counsel</span>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={handleBackToDashboard}
            className="w-full justify-start"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Cases
          </Button>
        </div>

        {/* Case Info */}
        <div className="p-4 border-b border-legal-border">
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Badge className={getStatusColor(case_.status)}>
                {case_.status}
              </Badge>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setWellnessMode(!wellnessMode)}
                className="h-8 w-8 p-0"
              >
                <Heart
                  className={`h-4 w-4 ${wellnessMode ? "fill-red-500 text-red-500" : ""}`}
                />
              </Button>
            </div>
            <h2 className="font-semibold text-sm line-clamp-2">
              {case_.title}
            </h2>
            <p className="text-xs text-muted-foreground font-mono">
              ID: {case_.id}
            </p>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex-1 p-2">
          <p className="text-xs font-medium text-muted-foreground px-3 py-2">
            TOOLBOX
          </p>
          <nav className="space-y-1">
            {TABS.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as TabType)}
                  className={`
                    w-full flex items-center gap-3 px-3 py-2 text-sm rounded-md transition-colors
                    ${
                      activeTab === tab.id
                        ? "bg-legal-primary text-white"
                        : "text-muted-foreground hover:bg-legal-accent hover:text-foreground"
                    }
                  `}
                >
                  <Icon className="h-4 w-4" />
                  <span className="truncate">{tab.name}</span>
                </button>
              );
            })}
          </nav>
        </div>

        {/* Sidebar Content (for AI persona settings, etc.) */}
        {renderSidebarContent()}

        {/* Quick Actions */}
        <div className="px-2">
          <QuickActions onTabChange={setActiveTab} />
        </div>

        {/* Quick Stats */}
        <div className="p-4 border-t border-legal-border">
          <div className="grid grid-cols-2 gap-2 text-xs">
            <div className="text-center">
              <div className="font-semibold text-legal-primary">
                {case_.timeline.length}
              </div>
              <div className="text-muted-foreground">Facts</div>
            </div>
            <div className="text-center">
              <div className="font-semibold text-legal-primary">
                {case_.evidence.length}
              </div>
              <div className="text-muted-foreground">Files</div>
            </div>
            <div className="text-center">
              <div className="font-semibold text-legal-primary">
                {case_.persons.length}
              </div>
              <div className="text-muted-foreground">People</div>
            </div>
            <div className="text-center">
              <div className="font-semibold text-legal-primary">
                {case_.deadlines.filter((d) => !d.completed).length}
              </div>
              <div className="text-muted-foreground">Due</div>
            </div>
          </div>
        </div>
      </div>

      {/* Center Area - Main Content + AI */}
      <div className="flex-1 flex flex-col">
        {/* Top Bar */}
        <header className="bg-white border-b border-legal-border px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-xl font-semibold">Case: {case_.title}</h1>
              <p className="text-sm text-muted-foreground">
                {TABS.find((tab) => tab.id === activeTab)?.name}
              </p>
            </div>
            <div className="flex items-center gap-2">
              {wellnessMode && (
                <Badge
                  variant="secondary"
                  className="bg-pink-100 text-pink-800"
                >
                  <Heart className="h-3 w-3 mr-1" />
                  Wellness Mode
                </Badge>
              )}
              <Button variant="outline" size="sm">
                <Settings className="h-4 w-4 mr-2" />
                Settings
              </Button>
            </div>
          </div>
        </header>

        {/* Main Content Area */}
        <main className="flex-1 overflow-auto">
          {wellnessMode ? (
            <div className="p-6">
              <Card className="legal-card max-w-2xl mx-auto">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Heart className="h-5 w-5 text-pink-500" />
                    Focus & Wellness Mode
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="text-center py-6">
                    <p className="text-lg mb-4">
                      You've made great progress. Let's just focus on one small
                      task today.
                    </p>
                    <p className="text-muted-foreground mb-6">
                      Feeling overwhelmed is normal in a case like this.
                    </p>
                    <Button
                      onClick={() => setWellnessMode(false)}
                      className="mx-auto"
                    >
                      Continue Working
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          ) : (
            renderCenterContent()
          )}
        </main>
      </div>

      {/* Right Sidebar - Visualization */}
      <RightSidebar
        case={case_}
        activeView={rightPanelView}
        onViewChange={setRightPanelView}
        onCaseUpdate={setCase}
      />
    </div>
  );
}
