import { useState, useEffect, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Scale,
  CheckCircle,
  AlertCircle,
  ArrowRight,
  Shield,
  Users,
  Gavel,
  BarChart3,
  FileText,
  Clock,
  Zap,
  Bot,
  Send,
} from "lucide-react";
import { Case, TimelineFact } from "@shared/types";
import { CaseManager } from "@/lib/case-management";
import ViolationSelector from "./ViolationSelector";

interface CenterAreaProps {
  case: Case;
  activeTab: string;
  onCaseUpdate: (updatedCase: Case) => void;
  onTabChange: (tab: string) => void;
}

interface Message {
  id: string;
  role: "user" | "ai";
  content: string;
  timestamp: Date;
  type?: "violation_analysis" | "general" | "summary";
}

export default function CenterArea({
  case: case_,
  activeTab,
  onCaseUpdate,
  onTabChange,
}: CenterAreaProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [currentInput, setCurrentInput] = useState("");
  const [selectedViolations, setSelectedViolations] = useState<string[]>([]);
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const caseManager = CaseManager.getInstance();

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  useEffect(() => {
    // Initialize with case summary when component loads
    if (activeTab === "summary" && messages.length === 0) {
      addAIMessage(
        `Welcome to your case workspace for "${case_.title}". I can see you have ${case_.timeline.length} facts, ${case_.evidence.length} evidence files, and ${case_.persons.length} people in your case. What would you like to work on today?`,
        "summary",
      );
    }
  }, [activeTab, case_, messages.length]);

  const addAIMessage = (content: string, type?: Message["type"]) => {
    const newMessage: Message = {
      id: `ai-${Date.now()}`,
      role: "ai",
      content,
      timestamp: new Date(),
      type,
    };
    setMessages((prev) => [...prev, newMessage]);
  };

  const addUserMessage = (content: string) => {
    const newMessage: Message = {
      id: `user-${Date.now()}`,
      role: "user",
      content,
      timestamp: new Date(),
    };
    setMessages((prev) => [...prev, newMessage]);
  };

  const handleSendMessage = () => {
    if (!currentInput.trim()) return;

    addUserMessage(currentInput);
    setCurrentInput("");
    setIsTyping(true);

    // Simulate AI response
    setTimeout(() => {
      const responses = [
        "I understand. Let me help you analyze that aspect of your case.",
        "That's an important detail. Can you provide more context about the circumstances?",
        "Based on what you've told me, this could strengthen your case. Let me ask a few follow-up questions.",
        "I see. This information will be valuable for building your timeline. What happened next?",
      ];
      addAIMessage(responses[Math.floor(Math.random() * responses.length)]);
      setIsTyping(false);
    }, 1500);
  };

  const handleViolationSelection = (violationIds: string[]) => {
    setSelectedViolations(violationIds);
    if (violationIds.length > 0) {
      addAIMessage(
        `Great! You've selected ${violationIds.length} potential violation(s). Let me start interviewing you about the legal elements needed to prove each violation. This will help build a strong foundation for your case.`,
        "violation_analysis",
      );
    }
  };

  const getCaseStrength = () => {
    const factCount = case_.timeline.length;
    const evidenceCount = case_.evidence.length;
    const score = Math.min(100, factCount * 10 + evidenceCount * 5);

    if (score >= 80)
      return { level: "Strong", color: "text-green-600", bg: "bg-green-100" };
    if (score >= 60)
      return {
        level: "Moderate",
        color: "text-yellow-600",
        bg: "bg-yellow-100",
      };
    if (score >= 40)
      return { level: "Developing", color: "text-blue-600", bg: "bg-blue-100" };
    return { level: "Weak", color: "text-red-600", bg: "bg-red-100" };
  };

  const renderSummaryView = () => {
    return (
      <Card className="legal-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5 text-legal-primary" />
            Case Summary
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <h3 className="font-semibold text-lg">{case_.title}</h3>
              <p className="text-sm text-muted-foreground">ID: {case_.id}</p>
              <p className="text-sm text-muted-foreground mt-2">
                Status: <Badge variant="outline">{case_.status}</Badge>
              </p>
            </div>

            <div className="grid grid-cols-3 gap-4 text-center">
              <div>
                <div className="text-xl font-bold text-blue-600">
                  {case_.timeline?.length || 0}
                </div>
                <div className="text-xs text-muted-foreground">Facts</div>
              </div>
              <div>
                <div className="text-xl font-bold text-green-600">
                  {case_.evidence?.length || 0}
                </div>
                <div className="text-xs text-muted-foreground">Evidence</div>
              </div>
              <div>
                <div className="text-xl font-bold text-purple-600">
                  {case_.persons?.length || 0}
                </div>
                <div className="text-xs text-muted-foreground">People</div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  };

  const renderViolationsView = () => {
    return (
      <ViolationSelector
        case={case_}
        onViolationSelect={handleViolationSelection}
        onCaseUpdate={onCaseUpdate}
      />
    );
  };

  const renderChatInterface = () => {
    return (
      <Card className="legal-card h-full flex flex-col">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bot className="h-5 w-5 text-legal-primary" />
            AI Conversation
          </CardTitle>
        </CardHeader>
        <CardContent className="flex-1 flex flex-col">
          {/* Messages */}
          <div className="flex-1 overflow-auto space-y-4 mb-4 max-h-96">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}
              >
                <div
                  className={`max-w-[80%] rounded-lg p-3 ${
                    message.role === "user"
                      ? "bg-legal-primary text-white"
                      : "bg-gray-100 text-gray-900"
                  }`}
                >
                  <p className="text-sm">{message.content}</p>
                  <p className="text-xs mt-1 opacity-70">
                    {message.timestamp.toLocaleTimeString()}
                  </p>
                </div>
              </div>
            ))}
            {isTyping && (
              <div className="flex justify-start">
                <div className="bg-gray-100 rounded-lg p-3">
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

          {/* Input */}
          <div className="flex gap-2">
            <Textarea
              value={currentInput}
              onChange={(e) => setCurrentInput(e.target.value)}
              placeholder="Ask me anything about your case..."
              className="flex-1"
              rows={2}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  handleSendMessage();
                }
              }}
            />
            <Button onClick={handleSendMessage} disabled={!currentInput.trim()}>
              <Send className="h-4 w-4" />
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  };

  return (
    <div className="p-6 h-full">
      {activeTab === "summary" && (
        <div className="space-y-6">
          {renderSummaryView()}
          {renderChatInterface()}
        </div>
      )}

      {activeTab === "violations" && (
        <div className="space-y-6">
          {renderViolationsView()}
          {renderChatInterface()}
        </div>
      )}

      {activeTab === "ai" && (
        <div className="space-y-6">
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              AI persona settings are available in the left sidebar when this
              tab is active.
            </AlertDescription>
          </Alert>
          {renderChatInterface()}
        </div>
      )}
    </div>
  );
}
