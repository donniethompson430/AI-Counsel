import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Scale,
  Send,
  Download,
  User,
  Bot,
  Sparkles,
  Shield,
  FileText,
  CheckCircle,
  Upload,
  File,
  Image,
  Video,
  Music,
  X,
  Paperclip,
} from "lucide-react";
import DevLink from "@/components/DevLink";
import { FileProcessor, ProcessedFile } from "@/lib/file-processor";

interface Message {
  id: string;
  role: "user" | "agent";
  content: string;
  timestamp: Date;
  type?: "intro" | "question" | "analysis" | "summary";
}

interface CaseData {
  title: string;
  violations: string[];
  facts: string[];
  strength: "strong" | "moderate" | "weak";
  recommendations: string[];
}

export default function SimpleAgent() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [currentInput, setCurrentInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [caseData, setCaseData] = useState<CaseData | null>(null);
  const [isStarted, setIsStarted] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const addMessage = (
    role: "user" | "agent",
    content: string,
    type?: Message["type"],
  ) => {
    const newMessage: Message = {
      id: `${role}-${Date.now()}`,
      role,
      content,
      timestamp: new Date(),
      type,
    };
    setMessages((prev) => [...prev, newMessage]);
  };

  const startConversation = () => {
    setIsStarted(true);
    addMessage(
      "agent",
      "Hello! I'm your AI Legal Assistant. I'm here to help you build a strong legal case by identifying potential violations and gathering the facts you need.\n\nTo get started, can you tell me briefly what happened? Don't worry about being perfect - I'll guide you through everything step by step.",
      "intro",
    );
  };

  const handleSendMessage = () => {
    if (!currentInput.trim()) return;

    addMessage("user", currentInput);
    const userMessage = currentInput;
    setCurrentInput("");
    setIsTyping(true);

    // Simulate AI response based on conversation flow
    setTimeout(() => {
      generateResponse(userMessage);
      setIsTyping(false);
    }, 1500);
  };

  const generateResponse = (userMessage: string) => {
    const lowerMessage = userMessage.toLowerCase();

    // Simple keyword-based responses (in real app, this would be actual AI)
    if (
      lowerMessage.includes("police") ||
      lowerMessage.includes("officer") ||
      lowerMessage.includes("traffic")
    ) {
      addMessage(
        "agent",
        "I understand you had an encounter with law enforcement. This could potentially involve several legal issues. Let me ask you some specific questions:\n\n1. **Excessive Force**: Did the officer use any physical force against you?\n2. **Unlawful Search**: Did they search you, your vehicle, or belongings?\n3. **False Arrest**: Were you detained or arrested?\n\nWhich of these situations occurred, if any?",
        "question",
      );
    } else if (
      lowerMessage.includes("force") ||
      lowerMessage.includes("hit") ||
      lowerMessage.includes("rough")
    ) {
      addMessage(
        "agent",
        "Thank you for sharing that. Excessive force is a serious violation of your civil rights. Under **Graham v. Connor**, force must be 'objectively reasonable' given the circumstances.\n\nLet me gather some specific details:\n\n• What type of force did they use? (grabbing, hitting, tasing, etc.)\n• How severe was the suspected crime?\n• Were you posing any immediate threat?\n• Were you resisting or trying to flee?\n\nCan you walk me through exactly what happened with the force?",
        "analysis",
      );
    } else if (
      lowerMessage.includes("search") ||
      lowerMessage.includes("looked through") ||
      lowerMessage.includes("went through")
    ) {
      addMessage(
        "agent",
        "Got it - an unlawful search is another important civil rights violation. The **Fourth Amendment** protects against unreasonable searches.\n\nKey questions:\n\n• Did they have a search warrant?\n• Did you give permission for the search?\n• What exactly did they search?\n• What reason did they give for searching?\n\nTell me more about how the search happened.",
        "analysis",
      );
    } else if (messages.length > 6) {
      // After several exchanges, provide case summary
      const mockCase: CaseData = {
        title: "Civil Rights Violation Case",
        violations: ["Excessive Force", "Unlawful Search"],
        facts: [
          "Traffic stop occurred on [date]",
          "Officer used physical force without justification",
          "Search conducted without warrant or consent",
          "No immediate threat was present",
        ],
        strength: "moderate",
        recommendations: [
          "File complaint with police department",
          "Document all injuries with medical records",
          "Gather witness statements",
          "Consider federal civil rights lawsuit under 42 USC 1983",
        ],
      };
      setCaseData(mockCase);

      addMessage(
        "agent",
        "Based on our conversation, I've identified potential civil rights violations in your case. I'm building a case summary for you that includes:\n\n✅ **Legal violations identified**\n✅ **Key facts organized**\n✅ **Strength assessment**\n✅ **Recommended next steps**\n\nYou can download this summary when we're done. Is there anything else about the incident you'd like to add?",
        "summary",
      );
    } else {
      // General follow-up responses
      const responses = [
        "I see. Can you tell me more details about that specific part?",
        "That's helpful information. What happened next?",
        "I understand. Can you be more specific about the timeline of events?",
        "Thank you for sharing that. Were there any witnesses present?",
        "Got it. Did you sustain any injuries during this incident?",
      ];
      addMessage(
        "agent",
        responses[Math.floor(Math.random() * responses.length)],
        "question",
      );
    }
  };

  const downloadCaseSummary = () => {
    if (!caseData) return;

    const summary = `
LEGAL CASE SUMMARY
Generated by AI Counsel Assistant
Date: ${new Date().toLocaleDateString()}

CASE TITLE: ${caseData.title}

POTENTIAL VIOLATIONS:
${caseData.violations.map((v) => `• ${v}`).join("\n")}

KEY FACTS:
${caseData.facts.map((f) => `• ${f}`).join("\n")}

CASE STRENGTH: ${caseData.strength.toUpperCase()}

RECOMMENDED ACTIONS:
${caseData.recommendations.map((r) => `• ${r}`).join("\n")}

---
This summary was generated through an AI-assisted interview process.
Please consult with a qualified attorney for legal advice.
    `;

    const blob = new Blob([summary], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "case-summary.txt";
    a.click();
    URL.revokeObjectURL(url);
  };

  if (!isStarted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-slate-100">
        {/* Hero Section */}
        <div className="container mx-auto px-6 py-12">
          <div className="text-center mb-12">
            <div className="flex items-center justify-center gap-3 mb-6">
              <Scale className="h-12 w-12 text-legal-primary" />
              <h1 className="text-4xl font-bold text-legal-primary">
                AI Counsel
              </h1>
            </div>
            <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
              Your AI Legal Assistant for Civil Rights Cases
            </p>
            <div className="flex items-center justify-center gap-6 text-sm text-gray-500 mb-12">
              <div className="flex items-center gap-2">
                <Shield className="h-4 w-4" />
                <span>Identify Violations</span>
              </div>
              <div className="flex items-center gap-2">
                <FileText className="h-4 w-4" />
                <span>Build Your Case</span>
              </div>
              <div className="flex items-center gap-2">
                <Download className="h-4 w-4" />
                <span>Get Case Summary</span>
              </div>
            </div>
          </div>

          {/* Main Call to Action */}
          <div className="max-w-2xl mx-auto">
            <Card className="shadow-lg border-0 bg-white/80 backdrop-blur">
              <CardContent className="p-8 text-center">
                <Sparkles className="h-16 w-16 text-legal-primary mx-auto mb-6" />
                <h2 className="text-2xl font-semibold mb-4">
                  Let's Build Your Legal Case Together
                </h2>
                <p className="text-gray-600 mb-8">
                  I'll interview you about your situation, identify potential
                  legal violations, and help you organize the facts into a
                  strong case. This usually takes 10-15 minutes.
                </p>
                <Button
                  onClick={startConversation}
                  size="lg"
                  className="bg-legal-primary hover:bg-legal-primary/90 px-8 py-3"
                >
                  <Bot className="h-5 w-5 mr-2" />
                  Start AI Interview
                </Button>
                <p className="text-xs text-gray-500 mt-4">
                  Free • No signup required • Privacy protected
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Features */}
          <div className="grid md:grid-cols-3 gap-6 mt-16 max-w-4xl mx-auto">
            <Card className="text-center p-6 border-0 bg-white/60">
              <Shield className="h-8 w-8 text-blue-600 mx-auto mb-3" />
              <h3 className="font-semibold mb-2">Violation Analysis</h3>
              <p className="text-sm text-gray-600">
                Identify excessive force, unlawful search, false arrest, and
                other civil rights violations
              </p>
            </Card>
            <Card className="text-center p-6 border-0 bg-white/60">
              <FileText className="h-8 w-8 text-green-600 mx-auto mb-3" />
              <h3 className="font-semibold mb-2">Case Building</h3>
              <p className="text-sm text-gray-600">
                Organize facts, evidence, and legal elements into a coherent
                case structure
              </p>
            </Card>
            <Card className="text-center p-6 border-0 bg-white/60">
              <Download className="h-8 w-8 text-purple-600 mx-auto mb-3" />
              <h3 className="font-semibold mb-2">Expert Guidance</h3>
              <p className="text-sm text-gray-600">
                Get actionable recommendations and next steps for your legal
                situation
              </p>
            </Card>
          </div>
        </div>
        <DevLink />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Header */}
      <header className="bg-white border-b px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Scale className="h-6 w-6 text-legal-primary" />
          <h1 className="text-lg font-semibold text-legal-primary">
            AI Counsel
          </h1>
        </div>
        {caseData && (
          <Button onClick={downloadCaseSummary} variant="outline" size="sm">
            <Download className="h-4 w-4 mr-2" />
            Download Case Summary
          </Button>
        )}
      </header>

      {/* Chat Area */}
      <div className="flex-1 flex flex-col max-w-4xl mx-auto w-full">
        <div className="flex-1 overflow-auto p-6 space-y-4">
          {messages.map((message) => (
            <div
              key={message.id}
              className={`flex gap-3 ${message.role === "user" ? "justify-end" : "justify-start"}`}
            >
              {message.role === "agent" && (
                <div className="w-8 h-8 bg-legal-primary rounded-full flex items-center justify-center flex-shrink-0">
                  <Bot className="h-4 w-4 text-white" />
                </div>
              )}

              <div
                className={`max-w-[80%] rounded-lg p-4 ${
                  message.role === "user"
                    ? "bg-legal-primary text-white"
                    : "bg-white border shadow-sm"
                }`}
              >
                <div className="whitespace-pre-wrap">{message.content}</div>
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
              <div className="w-8 h-8 bg-legal-primary rounded-full flex items-center justify-center">
                <Bot className="h-4 w-4 text-white" />
              </div>
              <div className="bg-white border rounded-lg p-4 shadow-sm">
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

        {/* Case Summary Sidebar */}
        {caseData && (
          <div className="border-t bg-white p-4">
            <Card className="border-green-200 bg-green-50">
              <CardContent className="p-4">
                <div className="flex items-center gap-2 mb-3">
                  <CheckCircle className="h-5 w-5 text-green-600" />
                  <h3 className="font-semibold text-green-800">
                    Case Analysis Complete
                  </h3>
                </div>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="font-medium text-gray-700">
                      Violations Found:
                    </p>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {caseData.violations.map((violation) => (
                        <Badge
                          key={violation}
                          variant="outline"
                          className="text-xs"
                        >
                          {violation}
                        </Badge>
                      ))}
                    </div>
                  </div>
                  <div>
                    <p className="font-medium text-gray-700">Case Strength:</p>
                    <Badge
                      className={`mt-1 ${
                        caseData.strength === "strong"
                          ? "bg-green-100 text-green-800"
                          : caseData.strength === "moderate"
                            ? "bg-yellow-100 text-yellow-800"
                            : "bg-red-100 text-red-800"
                      }`}
                    >
                      {caseData.strength}
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Input Area */}
        <div className="border-t bg-white p-4">
          <div className="flex gap-2">
            <Textarea
              value={currentInput}
              onChange={(e) => setCurrentInput(e.target.value)}
              placeholder="Tell me what happened..."
              className="flex-1 resize-none"
              rows={2}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  handleSendMessage();
                }
              }}
            />
            <Button
              onClick={handleSendMessage}
              disabled={!currentInput.trim() || isTyping}
              className="self-end"
            >
              <Send className="h-4 w-4" />
            </Button>
          </div>
          <p className="text-xs text-gray-500 mt-2">
            Press Enter to send • Shift+Enter for new line
          </p>
        </div>
        <DevLink />
      </div>
    </div>
  );
}
