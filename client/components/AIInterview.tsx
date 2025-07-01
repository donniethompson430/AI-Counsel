import { useState, useRef, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import {
  Bot,
  User,
  Send,
  Sparkles,
  Brain,
  Zap,
  Heart,
  MessageSquare,
} from "lucide-react";
import { Case, AIPersona } from "@shared/types";
import { CaseManager } from "@/lib/case-management";

interface AIInterviewProps {
  case: Case;
  onCaseUpdate: (updatedCase: Case) => void;
}

interface Message {
  id: string;
  type: "ai" | "user";
  content: string;
  timestamp: Date;
  persona?: AIPersona;
}

const PERSONA_ICONS = {
  strategist: Brain,
  guide: MessageSquare,
  razor: Zap,
  ally: Heart,
};

const PERSONA_COLORS = {
  strategist: "bg-blue-100 text-blue-800",
  guide: "bg-green-100 text-green-800",
  razor: "bg-orange-100 text-orange-800",
  ally: "bg-pink-100 text-pink-800",
};

export default function AIInterview({
  case: case_,
  onCaseUpdate,
}: AIInterviewProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [selectedPersona, setSelectedPersona] = useState<AIPersona>("guide");
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const caseManager = CaseManager.getInstance();
  const [lastEvidenceCount, setLastEvidenceCount] = useState(
    case_.evidence.length,
  );
  const [lastTimelineCount, setLastTimelineCount] = useState(
    case_.timeline.length,
  );

  // Debug logging
  useEffect(() => {
    console.log(
      "AI Interview: Case evidence count:",
      case_.evidence.length,
      "Timeline count:",
      case_.timeline.length,
    );
  }, [case_.evidence.length, case_.timeline.length]);

  useEffect(() => {
    // Initialize with welcome message
    const welcomeMessage: Message = {
      id: `msg-${Date.now()}`,
      type: "ai",
      content: `👋 **Hello! I'm your AI Counsel ${caseManager.getPersonaName()}.**

I'm here to help you build a strong legal case. I can:

🔍 **Analyze your documents** - Upload files and I'll extract key information
📅 **Build your timeline** - Organize events chronologically
📝 **Translate your story** - Convert emotional language to legal terms
🎯 **Guide your strategy** - Suggest next steps based on your case type

**To get started, try:**
- Telling me what happened in your own words
- Uploading a key document
- Asking me to explain a legal concept

What would you like to work on first?`,
      timestamp: new Date(),
      persona: selectedPersona,
    };
    setMessages([welcomeMessage]);
    setSelectedPersona(caseManager.getActivePersona());
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Monitor case changes for real-time AI responses
  useEffect(() => {
    const currentEvidenceCount = case_.evidence.length;
    const currentTimelineCount = case_.timeline.length;

    // Check for new evidence files
    if (currentEvidenceCount > lastEvidenceCount) {
      const newFiles = case_.evidence.slice(lastEvidenceCount);

      // Add a small delay to ensure UI has updated
      setTimeout(() => {
        newFiles.forEach((file) => {
          const aiResponse = caseManager.generateAIResponse(
            `I see you just uploaded "${file.fileName}"! ${file.extractedText ? "I extracted the text content and" : "I captured the metadata and"} ${file.tags.length > 0 ? `found ${file.tags.length} relevant legal keywords: ${file.tags.join(", ")}.` : "analyzed the file structure."} This strengthens your evidence collection.`,
            "file-upload",
          );

          const aiMessage: Message = {
            id: `msg-${Date.now()}-${file.id}`,
            type: "ai",
            content: aiResponse,
            timestamp: new Date(),
            persona: selectedPersona,
          };

          setMessages((prev) => [...prev, aiMessage]);
        });
      }, 500);

      setLastEvidenceCount(currentEvidenceCount);
    }

    // Check for new timeline facts
    if (currentTimelineCount > lastTimelineCount) {
      const newFacts = case_.timeline.slice(lastTimelineCount);
      const autoExtracted = newFacts.filter((fact) =>
        fact.tags.includes("auto-extracted"),
      );

      if (autoExtracted.length > 0) {
        setTimeout(() => {
          const aiResponse = caseManager.generateAIResponse(
            `Great! I automatically extracted ${autoExtracted.length} timeline ${autoExtracted.length === 1 ? "fact" : "facts"} from your uploaded documents. Your case timeline is becoming more complete and organized.`,
            "timeline",
          );

          const aiMessage: Message = {
            id: `msg-${Date.now()}-timeline`,
            type: "ai",
            content: aiResponse,
            timestamp: new Date(),
            persona: selectedPersona,
          };

          setMessages((prev) => [...prev, aiMessage]);
        }, 800);
      }
      setLastTimelineCount(currentTimelineCount);
    }
  }, [
    case_,
    lastEvidenceCount,
    lastTimelineCount,
    selectedPersona,
    caseManager,
  ]);

  const handlePersonaChange = (persona: AIPersona) => {
    setSelectedPersona(persona);
    caseManager.setActivePersona(persona);

    const personaChangeMessage: Message = {
      id: `msg-${Date.now()}`,
      type: "ai",
      content: `🔄 **I've switched to ${caseManager.getPersonaName()} mode.**

${caseManager.getPersonaDescription()}

How can I help you with this new perspective?`,
      timestamp: new Date(),
      persona,
    };

    setMessages((prev) => [...prev, personaChangeMessage]);
  };

  const handleSendMessage = async () => {
    if (!input.trim() || isProcessing) return;

    const userMessage: Message = {
      id: `msg-${Date.now()}`,
      type: "user",
      content: input.trim(),
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsProcessing(true);

    // Simulate AI processing
    setTimeout(
      () => {
        const aiResponse = generateAIResponse(userMessage.content);
        const aiMessage: Message = {
          id: `msg-${Date.now()}`,
          type: "ai",
          content: aiResponse,
          timestamp: new Date(),
          persona: selectedPersona,
        };

        setMessages((prev) => [...prev, aiMessage]);
        setIsProcessing(false);
      },
      1000 + Math.random() * 2000,
    );
  };

  const generateAIResponse = (userInput: string): string => {
    const lowerInput = userInput.toLowerCase();

    // Detect user intent
    if (lowerInput.includes("what happened") || lowerInput.includes("story")) {
      return generateStoryResponse(userInput);
    }

    if (lowerInput.includes("upload") || lowerInput.includes("document")) {
      return generateDocumentResponse();
    }

    if (lowerInput.includes("timeline") || lowerInput.includes("when")) {
      return generateTimelineResponse();
    }

    if (lowerInput.includes("legal") || lowerInput.includes("law")) {
      return generateLegalResponse(userInput);
    }

    // Detect legal concepts
    const concepts = caseManager.detectLegalConcepts(userInput);
    if (concepts.length > 0) {
      return generateConceptResponse(concepts);
    }

    // Translate emotional language
    const translated = caseManager.translateToLegalLanguage(userInput);
    if (translated !== userInput) {
      return generateTranslationResponse(userInput, translated);
    }

    // Default response based on persona
    return generateDefaultResponse(userInput);
  };

  const generateStoryResponse = (input: string): string => {
    const responses = {
      strategist: `📊 **Excellent. Let me analyze your situation strategically.**

I hear what you're saying. Now let's organize this into legally actionable facts:

🔍 **What I need to identify:**
- Key parties involved
- Specific actions and dates
- Damages or harm caused
- Evidence that supports your claims

**Strategic Questions:**
1. When exactly did this happen? (I'll add to your timeline)
2. Who are the main parties involved?
3. What specific damages did you suffer?
4. What evidence do you have to prove this?

Let's start with the timeline - when did the first incident occur?`,

      guide: `📚 **Thank you for sharing your story with me.**

I understand this is difficult. Let me help you organize your experience into legal terms that courts can understand.

**Here's what we'll do together:**
1. **Break down the events** - I'll help you identify the key facts
2. **Build a timeline** - Organize everything chronologically
3. **Identify legal claims** - What laws were broken or rights violated
4. **Gather evidence** - What proof supports your story

**Let's start simple:**
Can you tell me the first thing that happened? Just give me the date and what occurred - I'll help you turn it into a legal fact.`,

      razor: `⚡ **Got it. Let's cut to the core issues.**

Here's what matters legally:
- **WHO** did what to you
- **WHEN** it happened (dates are crucial)
- **WHAT** damages you suffered
- **PROOF** you can provide

**Action items:**
1. Give me specific dates for your timeline
2. Name the responsible parties
3. Quantify your damages
4. Upload any evidence you have

Start with the most important incident. Date and facts only.`,

      ally: `💪 **I'm here to support you through this.**

Thank you for trusting me with your story. What you've experienced matters, and together we're going to build a strong case that shows exactly what happened.

**You're not alone in this:**
- I'll help translate your experience into legal language
- We'll organize everything step by step
- You don't need to be perfect - just honest

**Let's take this one step at a time:**
What was the first thing that happened? Don't worry about legal terms - just tell me in your own words, and I'll help you organize it.

You're being incredibly brave by taking action. 💫`,
    };

    return responses[selectedPersona];
  };

  const generateDocumentResponse = (): string => {
    return `📄 **Document Upload Guidance**

Great idea! Documents are the backbone of strong legal cases. Here's how to get the most from your uploads:

**Best Documents to Start With:**
- 📋 Contracts or agreements
- 📧 Email communications
- 📸 Photos of damage/evidence
- 🏛 Official letters or notices
- 📑 Medical records (if applicable)

**What I'll Do Automatically:**
- Extract all text for searching
- Find and add dates to your timeline
- Tag with relevant legal keywords
- Link to timeline facts

**Upload Tip:** Go to the **Dashboard tab** and either drag files or click the upload area. I'll process everything and give you detailed feedback!

Ready to upload your first document?`;
  };

  const generateTimelineResponse = (): string => {
    return `📅 **Timeline Building is Critical**

Your timeline is your case roadmap. Here's why it matters:

**Why Timelines Win Cases:**
- Shows cause and effect clearly
- Proves when deadlines were missed
- Demonstrates patterns of behavior
- Makes complex cases understandable

**Timeline Strategy:**
1. **Start with key events** - Major incidents first
2. **Add supporting details** - Fill in context later
3. **Link evidence** - Connect documents to specific facts
4. **Verify dates** - Accuracy is crucial

**Go to your Timeline tab** and start adding facts. I'll help you organize them chronologically and identify any gaps that need more evidence.

What was the very first thing that happened in your case?`;
  };

  const generateLegalResponse = (input: string): string => {
    const concepts = caseManager.detectLegalConcepts(input);
    if (concepts.length > 0) {
      const firstConcept = concepts[0];
      const education = caseManager.educateUser(firstConcept);

      return `⚖️ **Legal Education: ${firstConcept.toUpperCase()}**

${education}

**How This Applies to Your Case:**
Understanding ${firstConcept} helps you build stronger arguments and gather the right evidence.

**Want to learn more?** Ask me about other legal concepts, or let's apply this knowledge to your specific situation.`;
    }

    return `⚖️ **Legal Guidance**

I can help explain legal concepts in plain English. Try asking me about:
- Burden of proof
- Damages
- Discovery process
- Settlement options
- Jurisdiction issues

Or describe your specific legal question and I'll break it down for you.`;
  };

  const generateConceptResponse = (concepts: string[]): string => {
    const concept = concepts[0];
    const education = caseManager.educateUser(concept);

    return `🎯 **I detected a legal concept: "${concept.toUpperCase()}"**

${education}

**For Your Case:**
This concept is relevant to your situation. Make sure you understand it as we build your legal strategy.

**Related Actions:**
- Gather evidence that supports this concept
- Document any instances where this applies
- Consider how this strengthens your position`;
  };

  const generateTranslationResponse = (
    original: string,
    translated: string,
  ): string => {
    return `🔄 **Legal Language Translation**

I understand your frustration. Let me help translate that into legal language:

**What you said:** "${original}"

**Legal translation:** "${translated}"

**Why this matters:** Courts prefer precise, factual language over emotional descriptions. This translation helps present your case more professionally while maintaining the same meaning.

**Next step:** Let's add this as a timeline fact with proper legal language. Would you like me to help you organize this chronologically?`;
  };

  const generateDefaultResponse = (input: string): string => {
    const responses = {
      strategist: `🎯 **Strategic Analysis Needed**

Let me help you think through this strategically. To give you the best guidance, I need more context.

**Strategic Questions:**
- What specific outcome are you seeking?
- What evidence do you have available?
- What are the strongest points of your case?
- Where do you see potential weaknesses?

Can you elaborate on any of these areas?`,

      guide: `📖 **I'm here to help you understand**

I want to make sure I give you the most helpful guidance. Can you tell me more about:

**Context I need:**
- What specific aspect of your case you're working on
- Whether you need help with documents, timeline, or legal concepts
- What feels most confusing or overwhelming right now

**Remember:** There are no stupid questions. I'm here to guide you through every step.`,

      razor: `⚡ **Need more specifics**

Be direct - what exactly do you need help with?

**Options:**
- Upload documents ➜ Go to Dashboard tab
- Build timeline ➜ Go to Timeline tab
- Legal questions ➜ Ask me directly
- Case strategy ➜ Tell me your goal

Pick one and let's get to work.`,

      ally: `💫 **I'm here for whatever you need**

You're doing great just by asking questions and taking action.

**I can help with:**
- Understanding legal concepts
- Organizing your documents and timeline
- Translating your experience into legal language
- Planning your next steps

What feels most important to work on right now? Trust your instincts - you know your case better than anyone.`,
    };

    return responses[selectedPersona];
  };

  const PersonaIcon = PERSONA_ICONS[selectedPersona];

  return (
    <div className="space-y-4">
      {/* Persona Selector */}
      <Card className="legal-card">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm flex items-center gap-2">
            <Sparkles className="h-4 w-4" />
            AI Persona
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
            {(["strategist", "guide", "razor", "ally"] as AIPersona[]).map(
              (persona) => {
                const Icon = PERSONA_ICONS[persona];
                const isActive = selectedPersona === persona;

                return (
                  <Button
                    key={persona}
                    variant={isActive ? "default" : "outline"}
                    size="sm"
                    onClick={() => handlePersonaChange(persona)}
                    className={`justify-start ${isActive ? "" : "text-muted-foreground"}`}
                  >
                    <Icon className="h-3 w-3 mr-2" />
                    {persona.charAt(0).toUpperCase() + persona.slice(1)}
                  </Button>
                );
              },
            )}
          </div>
          <p className="text-xs text-muted-foreground mt-2">
            {caseManager.getPersonaDescription()}
          </p>
        </CardContent>
      </Card>

      {/* Chat Interface */}
      <Card className="legal-card">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm flex items-center gap-2">
            <Bot className="h-4 w-4" />
            AI Counsel Chat
          </CardTitle>
        </CardHeader>
        <CardContent>
          {/* Messages */}
          <div className="h-96 overflow-y-auto space-y-4 mb-4 pr-2">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex gap-3 ${message.type === "user" ? "flex-row-reverse" : "flex-row"}`}
              >
                <div
                  className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${
                    message.type === "ai"
                      ? "bg-legal-primary text-white"
                      : "bg-muted"
                  }`}
                >
                  {message.type === "ai" ? (
                    <PersonaIcon className="h-4 w-4" />
                  ) : (
                    <User className="h-4 w-4" />
                  )}
                </div>
                <div
                  className={`flex-1 ${message.type === "user" ? "text-right" : ""}`}
                >
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xs font-medium">
                      {message.type === "ai"
                        ? caseManager.getPersonaName()
                        : "You"}
                    </span>
                    {message.persona && (
                      <Badge
                        className={`text-xs ${PERSONA_COLORS[message.persona]}`}
                      >
                        {message.persona}
                      </Badge>
                    )}
                    <span className="text-xs text-muted-foreground">
                      {message.timestamp.toLocaleTimeString()}
                    </span>
                  </div>
                  <div
                    className={`prose prose-sm max-w-none ${
                      message.type === "user"
                        ? "bg-muted p-3 rounded-lg inline-block max-w-[80%]"
                        : ""
                    }`}
                  >
                    {message.content.split("\n").map((line, i) => (
                      <p key={i} className={i === 0 ? "mt-0" : ""}>
                        {line}
                      </p>
                    ))}
                  </div>
                </div>
              </div>
            ))}

            {isProcessing && (
              <div className="flex gap-3">
                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-legal-primary text-white flex items-center justify-center">
                  <PersonaIcon className="h-4 w-4 animate-pulse" />
                </div>
                <div className="flex-1">
                  <div className="text-xs font-medium mb-1">
                    {caseManager.getPersonaName()}
                  </div>
                  <div className="bg-muted p-3 rounded-lg animate-pulse">
                    <div className="flex space-x-1">
                      <div className="w-2 h-2 bg-current rounded-full animate-bounce" />
                      <div
                        className="w-2 h-2 bg-current rounded-full animate-bounce"
                        style={{ animationDelay: "0.1s" }}
                      />
                      <div
                        className="w-2 h-2 bg-current rounded-full animate-bounce"
                        style={{ animationDelay: "0.2s" }}
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <div className="flex gap-2">
            <Textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder={`Ask ${caseManager.getPersonaName()} anything about your case...`}
              className="flex-1 min-h-[60px] resize-none"
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  handleSendMessage();
                }
              }}
            />
            <Button
              onClick={handleSendMessage}
              disabled={!input.trim() || isProcessing}
              className="self-end"
            >
              <Send className="h-4 w-4" />
            </Button>
          </div>

          <p className="text-xs text-muted-foreground mt-2">
            💡 **Tip:** Try "Upload a document", "Build my timeline", or
            "Explain [legal concept]"
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
