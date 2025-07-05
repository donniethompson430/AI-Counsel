/**
 * DASHBOARD 2: HANDLER DASHBOARD (Private War Room)
 *
 * Who sees it? Authenticated, signed-in users only
 * Purpose: The user's personal command center - Handler introduction and case initiation
 */

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Bot,
  Upload,
  MessageSquare,
  FileText,
  User,
  ArrowRight,
  Sparkles,
  Shield,
  Scale,
  CheckCircle,
} from "lucide-react";
import { useLocation, useNavigate } from "react-router-dom";
import { agentSystem } from "../lib/agents/agent-system";
import { HandlerPersona } from "../lib/agents/types";

interface HandlerProfile {
  id: string;
  name: string;
  fullName: string;
  title: string;
  personality: string;
  specialization: string;
  greeting: string;
  icon: any;
  color: string;
  approach: string[];
}

const HANDLER_PROFILES: Record<string, HandlerProfile> = {
  strategist: {
    id: "strategist",
    name: "The Strategist",
    fullName: "Commander Sarah Mitchell",
    title: "Lead Constitutional Strategist",
    personality: "Professional & Supportive",
    specialization: "Complex civil rights cases and constitutional law",
    greeting:
      "Welcome, warrior. I'm here to help you navigate the legal battlefield with precision and strategy. We'll take this step by step, ensuring every move is calculated and every document is bulletproof.",
    icon: CheckCircle,
    color: "blue",
    approach: [
      "Methodical case analysis",
      "Strategic document preparation",
      "Constitutional precedent research",
      "Procedural compliance focus",
    ],
  },
  guide: {
    id: "guide",
    name: "The Guide",
    fullName: "Captain Marcus Rivera",
    title: "Direct Action Coordinator",
    personality: "Direct & Confident",
    specialization: "Rapid case assessment and tactical planning",
    greeting:
      "Ready to fight back? Good. I'm your direct line to justice. We're going to cut through the noise, identify the violations, and build an unstoppable case. No time to waste.",
    icon: Scale,
    color: "green",
    approach: [
      "Direct violation identification",
      "Aggressive evidence compilation",
      "Fast-track case building",
      "Confident legal positioning",
    ],
  },
  razor: {
    id: "razor",
    name: "The Razor",
    fullName: "Colonel Alexandra 'Razor' Cross",
    title: "No-Bullshit Legal Operator",
    personality: "No BS & Aggressive",
    specialization: "High-stakes litigation and constitutional warfare",
    greeting:
      "Well, well, well... looks like someone finally decided to stop taking it lying down. I'm Razor, and I don't do participation trophies. We're here to rip their arguments apart and make them pay. Let's see what you've got.",
    icon: Shield,
    color: "red",
    approach: [
      "Aggressive constitutional challenges",
      "Dark humor stress relief",
      "Uncompromising evidence standards",
      "Maximum legal pressure tactics",
    ],
  },
  ally: {
    id: "ally",
    name: "The Ally",
    fullName: "Dr. Jordan Thompson",
    title: "Constitutional Rights Advocate",
    personality: "Balanced Approach",
    specialization: "Holistic case development and emotional support",
    greeting:
      "Hello there. I'm Jordan, and I want you to know that you're not alone in this fight. We're going to work together to build a case that not only wins but also restores your faith in justice. Your voice matters.",
    icon: Bot,
    color: "purple",
    approach: [
      "Balanced legal strategy",
      "Emotional support integration",
      "Comprehensive case review",
      "Community-focused solutions",
    ],
  },
};

export default function HandlerDashboard() {
  const location = useLocation();
  const navigate = useNavigate();
  const [selectedPersonality, setSelectedPersonality] = useState("strategist");
  const [hasFiles, setHasFiles] = useState(false);
  const [userName, setUserName] = useState("Warrior");
  const [isInitializing, setIsInitializing] = useState(true);

  useEffect(() => {
    // Get personality from navigation state
    if (location.state?.personality) {
      setSelectedPersonality(location.state.personality);
    }

    // Initialize agent system
    const initializeSystem = async () => {
      await agentSystem.initialize();
      setIsInitializing(false);
    };

    initializeSystem();
  }, [location]);

  const handler = HANDLER_PROFILES[selectedPersonality];

  const handleStartBuilding = async () => {
    try {
      // Create new case
      const caseId = await agentSystem.createCase(
        `${userName}'s Constitutional Rights Case`,
      );

      // Set handler persona
      agentSystem.setHandlerPersona(selectedPersonality as HandlerPersona);

      // Navigate to Dashboard 3 (Case Workspace)
      navigate("/case-workspace", {
        state: {
          caseId,
          handlerProfile: handler,
          isNewCase: true,
        },
      });
    } catch (error) {
      console.error("Failed to create case:", error);
      alert("Failed to create case. Please try again.");
    }
  };

  const handleUploadFiles = () => {
    // TODO: Implement file upload functionality
    setHasFiles(true);
    alert("File upload functionality will be implemented here");
  };

  const getColorClasses = (color: string) => {
    const colorMap = {
      blue: "border-blue-200 bg-blue-50 text-blue-900",
      green: "border-green-200 bg-green-50 text-green-900",
      red: "border-red-200 bg-red-50 text-red-900",
      purple: "border-purple-200 bg-purple-50 text-purple-900",
    };
    return colorMap[color as keyof typeof colorMap] || colorMap.blue;
  };

  if (isInitializing) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-white flex items-center justify-center">
        <div className="text-center">
          <Bot className="h-12 w-12 animate-spin text-blue-600 mx-auto mb-4" />
          <p className="text-gray-600">
            Initializing Constitutional Weapon System...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-white">
      <div className="container mx-auto px-6 py-8 max-w-4xl">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Constitutional Weapon System
          </h1>
          <p className="text-gray-600">Handler Assignment & Case Initiation</p>
        </div>

        {/* Handler Selection */}
        <Card className="shadow-lg border-0 bg-white/95 backdrop-blur mb-8">
          <CardHeader>
            <CardTitle className="flex items-center justify-center gap-2 text-xl">
              <User className="h-6 w-6 text-blue-700" />
              Choose Your AI Handler
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <p className="text-center text-gray-600 mb-6">
                Select the personality that best matches your communication
                style and case needs:
              </p>
              <div className="grid grid-cols-1 gap-3">
                {Object.values(HANDLER_PROFILES).map((profile) => {
                  const Icon = profile.icon;
                  return (
                    <div
                      key={profile.id}
                      className={`cursor-pointer border rounded-lg p-4 transition-all ${
                        selectedPersonality === profile.id
                          ? "border-blue-500 bg-blue-50 ring-2 ring-blue-200"
                          : "border-gray-200 hover:border-gray-300"
                      }`}
                      onClick={() => setSelectedPersonality(profile.id)}
                    >
                      <div className="flex items-start gap-3">
                        <Icon
                          className={`h-5 w-5 mt-0.5 ${
                            selectedPersonality === profile.id
                              ? "text-blue-600"
                              : "text-gray-500"
                          }`}
                        />
                        <div className="flex-1">
                          <h4 className="font-medium text-sm">
                            {profile.name} - {profile.fullName}
                          </h4>
                          <p className="text-xs text-gray-600 mb-2">
                            {profile.personality}
                          </p>
                          <p className="text-xs italic text-gray-500">
                            "{profile.greeting.slice(0, 80)}..."
                          </p>
                        </div>
                        {selectedPersonality === profile.id && (
                          <CheckCircle className="h-5 w-5 text-blue-600" />
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Handler Introduction Card */}
        <Card
          className={`shadow-xl border-2 mb-8 ${getColorClasses(handler.color)}`}
        >
          <CardHeader>
            <div className="flex items-center gap-4">
              <div
                className={`w-16 h-16 rounded-full bg-white flex items-center justify-center shadow-md`}
              >
                <handler.icon className={`h-8 w-8 text-${handler.color}-600`} />
              </div>
              <div className="flex-1">
                <CardTitle className="text-xl">{handler.fullName}</CardTitle>
                <p className="text-sm font-medium">{handler.title}</p>
                <Badge variant="outline" className="mt-1">
                  {handler.personality}
                </Badge>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="bg-white/50 p-4 rounded-lg border">
                <p className="text-gray-800 leading-relaxed">
                  "{handler.greeting}"
                </p>
              </div>

              <div>
                <h4 className="font-semibold mb-2">My Approach:</h4>
                <ul className="space-y-1">
                  {handler.approach.map((item, idx) => (
                    <li key={idx} className="flex items-center gap-2 text-sm">
                      <CheckCircle className="h-4 w-4 text-green-600" />
                      {item}
                    </li>
                  ))}
                </ul>
              </div>

              <div className="bg-white/50 p-3 rounded border">
                <p className="text-sm">
                  <strong>Specialization:</strong> {handler.specialization}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Case Initiation Options */}
        <div className="grid md:grid-cols-2 gap-6 mb-8">
          {/* Upload Files Option */}
          <Card className="border-2 border-blue-200 hover:border-blue-300 transition-colors">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-blue-900">
                <Upload className="h-5 w-5" />
                Start with Evidence
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600 mb-4">
                Upload documents, photos, videos, or audio recordings related to
                your case. I'll analyze them and help build your story.
              </p>
              <ul className="text-sm text-gray-500 mb-4 space-y-1">
                <li>• Police reports & incident documentation</li>
                <li>• Photos/videos of injuries or property damage</li>
                <li>• Medical records & treatment documentation</li>
                <li>• Communication records & correspondence</li>
              </ul>
              <Button
                onClick={handleUploadFiles}
                variant="outline"
                className="w-full"
              >
                <Upload className="h-4 w-4 mr-2" />
                Upload Files
              </Button>
              {hasFiles && (
                <Badge className="w-full mt-2 bg-green-100 text-green-800">
                  Files uploaded - Ready to proceed
                </Badge>
              )}
            </CardContent>
          </Card>

          {/* Tell Your Story Option */}
          <Card className="border-2 border-green-200 hover:border-green-300 transition-colors">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-green-900">
                <MessageSquare className="h-5 w-5" />
                Tell Your Story
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600 mb-4">
                Start by describing what happened in your own words. I'll guide
                you through the details and help identify legal violations.
              </p>
              <ul className="text-sm text-gray-500 mb-4 space-y-1">
                <li>• Describe the incident chronologically</li>
                <li>• Identify key people and locations</li>
                <li>• Explain the harm or violations</li>
                <li>• Discuss your desired outcome</li>
              </ul>
              <Button variant="outline" className="w-full">
                <MessageSquare className="h-4 w-4 mr-2" />
                Start Interview
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* System Status */}
        <Card className="bg-gray-50 border-gray-200 mb-8">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-yellow-600" />
              System Status
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
              <div>
                <div className="font-semibold text-green-600">✅ Active</div>
                <div className="text-sm text-gray-600">UPL Firewall</div>
              </div>
              <div>
                <div className="font-semibold text-green-600">✅ Ready</div>
                <div className="text-sm text-gray-600">Case Isolation</div>
              </div>
              <div>
                <div className="font-semibold text-green-600">✅ Online</div>
                <div className="text-sm text-gray-600">Agent System</div>
              </div>
              <div>
                <div className="font-semibold text-blue-600">
                  {handler.name}
                </div>
                <div className="text-sm text-gray-600">Handler Ready</div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Instructions */}
        <Card className="bg-yellow-50 border-yellow-200">
          <CardContent className="pt-6">
            <div className="flex items-start gap-3">
              <Bot className="h-6 w-6 text-yellow-600 mt-1" />
              <div>
                <h4 className="font-semibold text-yellow-900 mb-2">
                  Ready to Begin?
                </h4>
                <p className="text-yellow-800 text-sm mb-4">
                  {hasFiles
                    ? "Great! You've uploaded files. Now I can analyze your evidence and help build your case. Click below to enter the secure case workspace."
                    : "To get started, either upload evidence files or choose to tell your story first. I recommend starting with any documentation you have, as it helps me provide more accurate guidance."}
                </p>
                <Button
                  onClick={handleStartBuilding}
                  className="bg-yellow-600 hover:bg-yellow-700 text-white"
                  disabled={!hasFiles && selectedPersonality === "razor"} // Razor demands evidence first
                >
                  <ArrowRight className="h-4 w-4 mr-2" />
                  {hasFiles
                    ? "Start Building My Case"
                    : "Continue to Case Workspace"}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
