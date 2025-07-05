import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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

type PersonalityType = "supportive" | "balanced" | "aggressive";

interface PersonalityProfile {
  id: PersonalityType;
  name: string;
  description: string;
  icon: any;
  example: string;
}

const PERSONALITIES: PersonalityProfile[] = [
  {
    id: "supportive",
    name: "Professional & Supportive",
    description: "Gentle, encouraging, and patient approach",
    icon: CheckCircle,
    example: "I'm here to help guide you through this process step by step.",
  },
  {
    id: "balanced",
    name: "Direct & Confident",
    description: "Professional but assertive analysis",
    icon: Scale,
    example: "Let's analyze what happened and build a strong case.",
  },
  {
    id: "aggressive",
    name: "No BS & Aggressive",
    description: "Dark humor, tell it like it is, backed by attitude",
    icon: Shield,
    example:
      "Well, well, well... looks like someone's about to have a bad day.",
  },
];

export default function SimpleAgentFixed() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [currentInput, setCurrentInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [caseData, setCaseData] = useState<CaseData | null>(null);
  const [isStarted, setIsStarted] = useState(false);
  const [uploadedFiles, setUploadedFiles] = useState<ProcessedFile[]>([]);
  const [isProcessingFiles, setIsProcessingFiles] = useState(false);
  const [selectedPersonality, setSelectedPersonality] =
    useState<PersonalityType>("balanced");
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

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
    const introMessage = getPersonalityIntro();
    addMessage("agent", introMessage, "intro");
  };

  const getPersonalityIntro = () => {
    const baseMessage =
      "I can process PDFs, Word docs, images, videos, and more to help build your case.\n\nHow would you like to start?";

    switch (selectedPersonality) {
      case "supportive":
        return `Hello! I'm your AI Legal Assistant, and I want you to know that I'm here to support you through this challenging time. 💙\n\nI understand that dealing with legal issues can be overwhelming, but you don't have to face this alone. I'll help you build a strong case by carefully identifying potential violations and gathering the facts you need - all at your own pace.\n\n${baseMessage}`;

      case "balanced":
        return `Hello! I'm your AI Legal Assistant. I'm here to help you build a strong legal case by systematically identifying potential violations and organizing the facts you need.\n\nI'll provide professional analysis and guide you through the legal process efficiently.\n\n${baseMessage}`;

      case "aggressive":
        return `Well hello there! 😈 I'm your AI Legal Assistant, and I've got some news for you - if someone violated your rights, they picked the WRONG person to mess with.\n\nI'm here to help you build an absolutely devastating case that'll make them regret the day they decided to screw with you. Time to turn the tables and make them pay.\n\n${baseMessage}`;

      default:
        return `Hello! I'm your AI Legal Assistant. I'm here to help you build a strong legal case by identifying potential violations and gathering the facts you need.\n\n${baseMessage}`;
    }
  };

  const handleSendMessage = () => {
    if (!currentInput.trim()) return;

    addMessage("user", currentInput);
    const userMessage = currentInput;
    setCurrentInput("");
    setIsTyping(true);

    // Simulate AI response
    setTimeout(() => {
      generateResponse(userMessage);
      setIsTyping(false);
    }, 1500);
  };

  const generateResponse = (userMessage: string) => {
    const lowerMessage = userMessage.toLowerCase();

    // Check if this is a response to file upload
    if (lowerMessage.includes("uploaded files:")) {
      performComprehensiveAnalysis();
      return;
    }

    // Regular conversation flow
    if (
      lowerMessage.includes("police") ||
      lowerMessage.includes("officer") ||
      lowerMessage.includes("traffic")
    ) {
      addMessage(
        "agent",
        `I understand you had an encounter with law enforcement. This could potentially involve several legal issues. Let me ask you some specific questions:\n\n1. **Excessive Force**: Did the officer use any physical force against you?\n2. **Unlawful Search**: Did they search you, your vehicle, or belongings?\n3. **False Arrest**: Were you detained or arrested?\n\nWhich of these situations occurred, if any?`,
        "question",
      );
    } else if (messages.length > 8) {
      // Generate case summary after several exchanges
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
      const responses = [
        "I understand. Can you tell me more details about that specific part?",
        "That's helpful information. What happened next?",
        "Thank you for sharing that. Were there any witnesses present?",
      ];
      addMessage(
        "agent",
        responses[Math.floor(Math.random() * responses.length)],
        "question",
      );
    }
  };

  const performComprehensiveAnalysis = () => {
    // Simulate analyzing uploaded documents
    setTimeout(() => {
      addMessage(
        "agent",
        "🔍 **ANALYZING UPLOADED DOCUMENTS...**\n\n*Processing file content, extracting entities, identifying violations...*",
        "analysis",
      );
    }, 500);

    setTimeout(() => {
      const analysisMessage = getPersonalityAnalysis();
      addMessage("agent", analysisMessage, "analysis");
    }, 3000);

    setTimeout(() => {
      const questionMessage = getPersonalityQuestions();
      addMessage("agent", questionMessage, "question");
    }, 6000);
  };

  const getPersonalityAnalysis = () => {
    const baseAnalysis = `**HERE'S WHAT I SEE:**\n\n🎯 **IDENTIFIED VIOLATIONS:**\n• **Unlawful Search & Seizure** (4th Amendment)\n• **Excessive Force** (Graham v. Connor)\n• **False Arrest** (Lack of Probable Cause)\n\n👥 **EXTRACTED PERSONS:**\n• **Officer Gonzales** (DEFENDANT) - Primary violator\n• **Officer Martinez** (DEFENDANT) - Secondary participant  \n• **John Smith** (WITNESS) - Bystander who recorded incident\n• **Jane Doe** (VICTIM) - You, the complainant\n\n📊 **CASE STRENGTH:** High potential for §1983 civil rights claim\n\n⚖️ **TEXAS LEGAL FRAMEWORK:**\nUnder Texas Code of Criminal Procedure Art. 14.01 and the 4th Amendment, any search must be based on probable cause or valid consent. Your document indicates NEITHER existed.`;

    switch (selectedPersonality) {
      case "supportive":
        return `**I've completed my analysis of your case.** 💙\n\nI want you to know that what happened to you was serious, and I'm here to help you navigate this process with care and understanding.\n\n${baseAnalysis}\n\n**You're not alone in this** - together we'll build the strongest possible case to protect your rights.`;

      case "balanced":
        return `**Analysis Complete - Here's What We're Working With:** ⚖️\n\n${baseAnalysis}\n\n**Professional Assessment:** Based on the evidence, you have substantial grounds for a civil rights claim. Let's proceed methodically to strengthen your position.`;

      case "aggressive":
        return `**Well, well, well... what do we have here?** 😏\n\nSeems like Officer Gonzales is not having a very good day. And it's only going to get worse.\n\n${baseAnalysis}\n\n**Bottom Line:** These officers royally screwed up, and now they're about to find out what happens when you violate someone's constitutional rights. Time to make them pay.`;

      default:
        return baseAnalysis;
    }
  };

  const getPersonalityQuestions = () => {
    const baseQuestions = `**LEGAL EDUCATION - 4th Amendment (Texas Application):**\n\nAccording to **Texas Constitution Art. I, §9**, **Texas Code of Criminal Procedure Art. 14.01-14.06**, and **42 U.S.C. ��1983**, unreasonable search and seizure occurs when:\n\n1. **No Valid Warrant** was presented\n2. **No Probable Cause** existed for the search  \n3. **No Consent** was given by the subject\n4. **No Exigent Circumstances** justified immediate action\n\n**According to your statement**, you allegedly stated that:\n• Officer Gonzales searched your vehicle without consent\n• No warrant was presented\n• No contraband was in plain view\n• You were compliant and non-threatening\n\n❓ **When Officer Gonzales initiated the search of your vehicle, did he:**\n   A) Show you a valid search warrant?\n   B) Ask for your explicit consent?\n   C) Explain the legal basis for the search?\n   D) None of the above?\n\n❓ **What EXACTLY did Officer Gonzales say to justify the search?**\n\n❓ **Were there any items in plain view that could have provided probable cause?**`;

    switch (selectedPersonality) {
      case "supportive":
        return `**Let's explore what happened step by step.** 🤝\n\nI know these questions might bring up difficult memories, but each detail helps strengthen your case. Take your time, and remember - you're in control here.\n\n${baseQuestions}\n\n**Remember:** There are no wrong answers. I'm here to support you through this process.`;

      case "balanced":
        return `**Now let's examine Officer Gonzales' actions systematically.** 📋\n\n${baseQuestions}\n\n**These details are crucial** for establishing the legal violations and building your case strategy.`;

      case "aggressive":
        return `**Let's discuss Officer Gonzales and his questionable actions...** 🕵️‍♂️\n\nTime to tear apart this clown's so-called "police work" piece by piece.\n\n${baseQuestions}\n\n**Don't hold back** - every detail of this officer's incompetence matters. Let's expose exactly how badly they screwed up.`;

      default:
        return baseQuestions;
    }
  };

  const handleFileUpload = async (
    event: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const files = Array.from(event.target.files || []);
    if (files.length === 0) return;

    setIsProcessingFiles(true);
    const processedFiles: ProcessedFile[] = [];

    for (const file of files) {
      try {
        const processed = await FileProcessor.processFile(file);
        processedFiles.push(processed);
      } catch (error) {
        console.error("Error processing file:", error);
        processedFiles.push({
          fileName: file.name,
          fileType: file.type,
          fileSize: file.size,
          metadata: {},
          error: "Failed to process file",
        });
      }
    }

    setUploadedFiles((prev) => [...prev, ...processedFiles]);
    setIsProcessingFiles(false);

    const fileList = processedFiles.map((f) => f.fileName).join(", ");
    addMessage("user", `📎 Uploaded files: ${fileList}`);

    // Trigger comprehensive analysis instead of generic response
    setTimeout(() => {
      performComprehensiveAnalysis();
    }, 1000);

    if (event.target) {
      event.target.value = "";
    }
  };

  const removeFile = (index: number) => {
    setUploadedFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const getFileIcon = (fileType: string) => {
    if (fileType.startsWith("image/")) return Image;
    if (fileType.startsWith("video/")) return Video;
    if (fileType.startsWith("audio/")) return Music;
    return File;
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
        <div className="container mx-auto px-6 py-8">
          <div className="text-center mb-8">
            <div className="flex items-center justify-center gap-3 mb-4">
              <Scale className="h-10 w-10 text-legal-primary" />
              <h1 className="text-3xl font-bold text-legal-primary">
                AI Counsel
              </h1>
            </div>
            <p className="text-lg text-gray-600 mb-6 max-w-2xl mx-auto">
              Your AI Legal Assistant for Civil Rights Cases
            </p>
            <div className="flex items-center justify-center gap-6 text-sm text-gray-500 mb-8">
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

          <div className="max-w-2xl mx-auto">
            <Card className="shadow-lg border-0 bg-white/80 backdrop-blur">
              <CardContent className="p-6 text-center">
                <Sparkles className="h-16 w-16 text-legal-primary mx-auto mb-6" />
                <h2 className="text-2xl font-semibold mb-4">
                  Let's Build Your Legal Case Together
                </h2>
                <p className="text-gray-600 mb-6">
                  I'll interview you about your situation, identify potential
                  legal violations, and help you organize the facts into a
                  strong case. This usually takes 10-15 minutes.
                </p>

                {/* AI Personality Selector */}
                <div className="mb-6">
                  <h3 className="font-semibold text-gray-800 mb-3">
                    Choose Your AI's Personality:
                  </h3>
                  <div className="grid grid-cols-1 gap-3">
                    {PERSONALITIES.map((personality) => {
                      const Icon = personality.icon;
                      return (
                        <div
                          key={personality.id}
                          className={`cursor-pointer border rounded-lg p-3 transition-all ${
                            selectedPersonality === personality.id
                              ? "border-legal-primary bg-legal-accent"
                              : "border-gray-200 hover:border-gray-300"
                          }`}
                          onClick={() => setSelectedPersonality(personality.id)}
                        >
                          <div className="flex items-start gap-3">
                            <Icon
                              className={`h-5 w-5 mt-0.5 ${
                                selectedPersonality === personality.id
                                  ? "text-legal-primary"
                                  : "text-gray-500"
                              }`}
                            />
                            <div className="flex-1">
                              <h4 className="font-medium text-sm">
                                {personality.name}
                              </h4>
                              <p className="text-xs text-gray-600 mb-1">
                                {personality.description}
                              </p>
                              <p className="text-xs italic text-gray-500">
                                "{personality.example}"
                              </p>
                            </div>
                            {selectedPersonality === personality.id && (
                              <CheckCircle className="h-4 w-4 text-legal-primary" />
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                <div className="mb-6">
                  <p className="text-gray-600 text-sm mb-2">
                    <span className="font-bold text-red-600">Disclaimer:</span>{" "}
                    This AI assistant is provided for educational purposes only
                    and does not constitute legal advice. You are solely
                    responsible for any content, information, or actions taken
                    based on this tool's output. By proceeding, you understand
                    and agree that this is not a substitute for professional
                    legal counsel. Always consult with a qualified attorney for
                    legal advice specific to your situation.
                  </p>
                </div>

                <Button
                  onClick={startConversation}
                  size="lg"
                  className="bg-legal-primary hover:bg-legal-primary/90 px-8 py-3"
                >
                  <Bot className="h-5 w-5 mr-2" />I Understand & Agree - Start
                  Interview
                </Button>

                <p className="text-xs text-gray-500 mt-4">
                  Free • No signup required • Privacy protected
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Features */}
          <div className="grid md:grid-cols-3 gap-6 mt-12 max-w-4xl mx-auto">
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
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-slate-100">
      <div className="container mx-auto px-6 py-8 max-w-6xl">
        {/* Header */}
        <div className="text-center mb-6">
          <div className="flex items-center justify-center gap-3 mb-4">
            <Scale className="h-8 w-8 text-legal-primary" />
            <h1 className="text-2xl font-bold text-legal-primary">
              AI Counsel
            </h1>
            {caseData && (
              <Button
                onClick={downloadCaseSummary}
                variant="outline"
                size="sm"
                className="ml-4"
              >
                <Download className="h-4 w-4 mr-2" />
                Download Case Summary
              </Button>
            )}
          </div>
          <p className="text-gray-600">Legal Case Building Assistant</p>
        </div>

        {/* Chat Container */}
        <Card className="shadow-lg border-0 bg-white/90 backdrop-blur mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Bot className="h-5 w-5 text-legal-primary" />
              AI Legal Interview
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            {/* Messages Area */}
            <div className="h-[400px] overflow-auto p-6 space-y-4 border-b">
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
                        : "bg-gray-100 text-gray-900"
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
                  <div className="bg-gray-100 rounded-lg p-4">
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

            {/* Uploaded Files Display */}
            {uploadedFiles.length > 0 && (
              <div className="bg-gray-50 p-4 border-b">
                <div className="flex items-center gap-2 mb-3">
                  <Paperclip className="h-4 w-4 text-gray-500" />
                  <span className="text-sm font-medium text-gray-700">
                    Uploaded Files ({uploadedFiles.length})
                  </span>
                </div>
                <div className="flex flex-wrap gap-2">
                  {uploadedFiles.map((file, index) => {
                    const FileIcon = getFileIcon(file.fileType);
                    return (
                      <div
                        key={index}
                        className="flex items-center gap-2 bg-white border rounded-lg px-3 py-2 text-sm"
                      >
                        <FileIcon className="h-4 w-4 text-gray-500" />
                        <span className="truncate max-w-[120px]">
                          {file.fileName}
                        </span>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => removeFile(index)}
                          className="h-4 w-4 p-0 hover:bg-red-100"
                        >
                          <X className="h-3 w-3" />
                        </Button>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Input Area */}
            <div className="p-4">
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={isProcessingFiles}
                  className="self-end"
                >
                  {isProcessingFiles ? (
                    <div className="w-4 h-4 border-2 border-legal-primary border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <Upload className="h-4 w-4" />
                  )}
                </Button>
                <Textarea
                  value={currentInput}
                  onChange={(e) => setCurrentInput(e.target.value)}
                  placeholder="Tell me what happened, or upload files for analysis..."
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
              <div className="flex justify-between items-center mt-2">
                <p className="text-xs text-gray-500">
                  Press Enter to send • Shift+Enter for new line
                </p>
                <p className="text-xs text-gray-500">
                  Supports: PDF, DOC, images, videos, audio, ZIP files
                </p>
              </div>

              <input
                ref={fileInputRef}
                type="file"
                multiple
                accept=".pdf,.doc,.docx,.txt,.rtf,.jpg,.jpeg,.png,.gif,.webp,.mp4,.mov,.webm,.mp3,.wav,.mpeg,.zip,.rar,.7z"
                onChange={handleFileUpload}
                className="hidden"
              />
            </div>
          </CardContent>
        </Card>

        {/* Case Summary */}
        {caseData && (
          <Card className="border-green-200 bg-green-50 shadow-lg">
            <CardContent className="p-4">
              <div className="flex items-center gap-2 mb-3">
                <CheckCircle className="h-5 w-5 text-green-600" />
                <h3 className="font-semibold text-green-800">
                  Case Analysis Complete
                </h3>
              </div>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="font-medium text-gray-700">Violations Found:</p>
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
        )}
      </div>
      <DevLink />
    </div>
  );
}
