/**
 * DASHBOARD 3: CASE WORKSPACE (Battle Mode)
 *
 * Who sees it? Authenticated user, only after selecting a specific Case ID
 * Purpose: Engage the full legal assistant system — in a sealed environment
 */

import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import {
  Bot,
  User,
  Send,
  Download,
  FileText,
  Clock,
  Users,
  Scale,
  Upload,
  Settings,
  AlertTriangle,
  CheckCircle,
  Shield,
} from "lucide-react";
import { useLocation, useNavigate } from "react-router-dom";
import { agentSystem } from "../lib/agents/agent-system";
import { CaseId, HandlerResponse } from "../lib/agents/types";

interface Message {
  id: string;
  role: "user" | "handler";
  content: string;
  timestamp: Date;
  type?: "intro" | "analysis" | "question";
}

interface SidebarModule {
  id: string;
  name: string;
  icon: any;
  active: boolean;
  count?: number;
}

const SIDEBAR_MODULES: SidebarModule[] = [
  { id: "dashboard", name: "Dashboard", icon: Scale, active: true },
  { id: "timeline", name: "Timeline", icon: Clock, active: false, count: 0 },
  { id: "evidence", name: "Evidence", icon: FileText, active: false, count: 0 },
  {
    id: "persons",
    name: "Persons & Entities",
    icon: Users,
    active: false,
    count: 0,
  },
  {
    id: "drafts",
    name: "Legal Drafts",
    icon: FileText,
    active: false,
    count: 0,
  },
  { id: "calendar", name: "Calendar & Deadlines", icon: Clock, active: false },
  {
    id: "sources",
    name: "Sources Library",
    icon: Scale,
    active: false,
    count: 0,
  },
];

export default function CaseWorkspaceNew() {
  const location = useLocation();
  const navigate = useNavigate();
  const [messages, setMessages] = useState<Message[]>([]);
  const [currentInput, setCurrentInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [caseId, setCaseId] = useState<CaseId | null>(null);
  const [handlerProfile, setHandlerProfile] = useState<any>(null);
  const [activeModule, setActiveModule] = useState("dashboard");
  const [systemStatus, setSystemStatus] = useState<any>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Get case data from navigation state
    if (location.state?.caseId) {
      setCaseId(location.state.caseId);
      setHandlerProfile(location.state.handlerProfile);

      // Switch agent system to this case
      agentSystem.switchToCase(location.state.caseId);

      // Add initial handler greeting
      if (location.state.isNewCase && location.state.handlerProfile) {
        const profile = location.state.handlerProfile;
        addMessage(
          "handler",
          `Welcome to your secure case workspace. I'm ${profile.fullName}, your ${profile.title}.\n\n${profile.greeting}\n\nThis workspace is completely isolated - everything we discuss and build here is scoped only to this case. Your privacy and case integrity are protected by military-grade security protocols.\n\nHow would you like to begin? You can upload evidence, describe what happened, or ask me about the legal process.`,
          "intro",
        );
      }

      updateSystemStatus();
    } else {
      // No case data, redirect back
      navigate("/handler-dashboard");
    }

    // Auto-scroll to bottom of messages
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [location, messages]);

  const addMessage = (
    role: "user" | "handler",
    content: string,
    type?: Message["type"],
  ) => {
    const newMessage: Message = {
      id: crypto.randomUUID(),
      role,
      content,
      timestamp: new Date(),
      type,
    };
    setMessages((prev) => [...prev, newMessage]);
  };

  const updateSystemStatus = () => {
    const status = agentSystem.getSystemStatus();
    setSystemStatus(status);
  };

  const handleSendMessage = async () => {
    if (!currentInput.trim() || !caseId || isTyping) return;

    const userMessage = currentInput.trim();
    setCurrentInput("");
    addMessage("user", userMessage);
    setIsTyping(true);

    try {
      // Send message through agent system
      const response: HandlerResponse = await agentSystem.sendMessage(
        userMessage,
        caseId,
      );

      // Add handler response
      setTimeout(() => {
        addMessage("handler", response.message);
        setIsTyping(false);
        updateSystemStatus();
      }, 1000); // Simulate typing delay
    } catch (error) {
      console.error("Error sending message:", error);
      addMessage(
        "handler",
        "I apologize, but I encountered an error processing your request. Please try again.",
      );
      setIsTyping(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleExportCase = async () => {
    if (!caseId) return;

    try {
      const caseData = await agentSystem.exportCase(caseId);
      // TODO: Implement actual file download
      console.log("Case exported:", caseData);
      alert("Case export functionality will be implemented here");
    } catch (error) {
      console.error("Export failed:", error);
      alert("Export failed. Please try again.");
    }
  };

  const getModuleContent = () => {
    switch (activeModule) {
      case "dashboard":
        return (
          <div className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Case Overview</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <div className="text-sm text-gray-600">Case ID</div>
                    <div className="font-mono text-sm">{caseId?.slice(-8)}</div>
                  </div>
                  <div>
                    <div className="text-sm text-gray-600">Handler</div>
                    <div className="text-sm">{handlerProfile?.name}</div>
                  </div>
                  <div>
                    <div className="text-sm text-gray-600">Created</div>
                    <div className="text-sm">
                      {new Date().toLocaleDateString()}
                    </div>
                  </div>
                  <div>
                    <div className="text-sm text-gray-600">Status</div>
                    <Badge className="text-xs">Active</Badge>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Quick Actions</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-2">
                  <Button variant="outline" size="sm">
                    <Upload className="h-4 w-4 mr-2" />
                    Upload Evidence
                  </Button>
                  <Button variant="outline" size="sm">
                    <FileText className="h-4 w-4 mr-2" />
                    Generate Draft
                  </Button>
                  <Button variant="outline" size="sm">
                    <Clock className="h-4 w-4 mr-2" />
                    Add Timeline
                  </Button>
                  <Button variant="outline" size="sm">
                    <Users className="h-4 w-4 mr-2" />
                    Add Person
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        );

      default:
        return (
          <div className="text-center text-gray-500 py-8">
            <p>{activeModule} module coming soon...</p>
          </div>
        );
    }
  };

  if (!caseId) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <AlertTriangle className="h-12 w-12 text-yellow-500 mx-auto mb-4" />
          <p className="text-gray-600">No active case. Redirecting...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen bg-gray-50 flex">
      {/* Left Sidebar */}
      <div className="w-64 bg-white border-r border-gray-200 flex flex-col">
        {/* Sidebar Header */}
        <div className="p-4 border-b border-gray-200">
          <div className="flex items-center gap-2">
            <Shield className="h-6 w-6 text-blue-600" />
            <div>
              <div className="font-semibold text-sm">Case Workspace</div>
              <div className="text-xs text-gray-500">{caseId?.slice(-8)}</div>
            </div>
          </div>
        </div>

        {/* Sidebar Navigation */}
        <div className="flex-1 p-2">
          <div className="space-y-1">
            {SIDEBAR_MODULES.map((module) => {
              const Icon = module.icon;
              return (
                <button
                  key={module.id}
                  onClick={() => setActiveModule(module.id)}
                  className={`w-full flex items-center gap-2 px-3 py-2 rounded text-sm transition-colors ${
                    activeModule === module.id
                      ? "bg-blue-50 text-blue-700 border border-blue-200"
                      : "text-gray-600 hover:bg-gray-50"
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  <span className="flex-1 text-left">{module.name}</span>
                  {module.count !== undefined && (
                    <Badge variant="secondary" className="text-xs">
                      {module.count}
                    </Badge>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Export Button */}
        <div className="p-4 border-t border-gray-200">
          <Button
            onClick={handleExportCase}
            variant="outline"
            size="sm"
            className="w-full"
          >
            <Download className="h-4 w-4 mr-2" />
            Export Case File
          </Button>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col">
        {/* Top Bar */}
        <div className="bg-white border-b border-gray-200 p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                <Bot className="h-4 w-4 text-blue-600" />
              </div>
              <div>
                <div className="font-medium">
                  {handlerProfile?.fullName || "Constitutional AI Handler"}
                </div>
                <div className="text-sm text-gray-500">
                  {handlerProfile?.personality || "Educational Assistant"} •
                  Case-Isolated Session
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Badge className="bg-green-100 text-green-800 text-xs">
                <CheckCircle className="h-3 w-3 mr-1" />
                UPL Protected
              </Badge>
              <Button variant="outline" size="sm">
                <Settings className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>

        {/* Content Area - Split between Chat and Module */}
        <div className="flex-1 flex">
          {/* Chat Interface */}
          <div className="flex-1 flex flex-col">
            {/* Messages */}
            <ScrollArea className="flex-1 p-4">
              <div className="space-y-4 max-w-4xl mx-auto">
                {messages.map((message) => (
                  <div
                    key={message.id}
                    className={`flex gap-3 ${message.role === "user" ? "justify-end" : "justify-start"}`}
                  >
                    {message.role === "handler" && (
                      <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center flex-shrink-0">
                        <Bot className="h-4 w-4 text-white" />
                      </div>
                    )}

                    <div
                      className={`max-w-[80%] rounded-lg p-4 ${
                        message.role === "user"
                          ? "bg-blue-600 text-white"
                          : "bg-white border border-gray-200 text-gray-900"
                      }`}
                    >
                      <div className="whitespace-pre-wrap">
                        {message.content}
                      </div>
                      <div className="text-xs mt-2 opacity-70">
                        {message.timestamp.toLocaleTimeString()}
                      </div>
                    </div>

                    {message.role === "user" && (
                      <div className="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center flex-shrink-0">
                        <User className="h-4 w-4 text-gray-600" />
                      </div>
                    )}
                  </div>
                ))}

                {isTyping && (
                  <div className="flex gap-3 justify-start">
                    <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
                      <Bot className="h-4 w-4 text-white" />
                    </div>
                    <div className="bg-white border border-gray-200 rounded-lg p-4">
                      <div className="flex space-x-1">
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                        <div
                          className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                          style={{ animationDelay: "0.1s" }}
                        ></div>
                        <div
                          className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                          style={{ animationDelay: "0.2s" }}
                        ></div>
                      </div>
                    </div>
                  </div>
                )}

                <div ref={messagesEndRef} />
              </div>
            </ScrollArea>

            {/* Input Area */}
            <div className="p-4 border-t border-gray-200 bg-white">
              <div className="max-w-4xl mx-auto flex gap-2">
                <Input
                  value={currentInput}
                  onChange={(e) => setCurrentInput(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="Describe your situation, ask about legal standards, or request help..."
                  disabled={isTyping}
                  className="flex-1"
                />
                <Button
                  onClick={handleSendMessage}
                  disabled={!currentInput.trim() || isTyping}
                >
                  <Send className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>

          {/* Right Sidebar - Module Content */}
          <div className="w-80 bg-white border-l border-gray-200 p-4">
            <div className="mb-4">
              <h3 className="font-semibold text-gray-900 capitalize">
                {activeModule}
              </h3>
              <p className="text-sm text-gray-500">
                Case-specific {activeModule} data
              </p>
            </div>
            <Separator className="mb-4" />
            {getModuleContent()}
          </div>
        </div>
      </div>
    </div>
  );
}
