/**
 * Agent System Demo Component
 *
 * Demonstrates the multi-agent architecture in action
 * Shows the Handler-only interaction with background agent coordination
 */

import React, { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { agentSystem } from "../lib/agents/agent-system";
import { HandlerPersona, CaseId, HandlerResponse } from "../lib/agents/types";

interface ConversationMessage {
  user: string;
  handler: string;
  timestamp: Date;
}

export default function AgentSystemDemo() {
  const [currentCaseId, setCurrentCaseId] = useState<CaseId | null>(null);
  const [message, setMessage] = useState("");
  const [conversation, setConversation] = useState<ConversationMessage[]>([]);
  const [persona, setPersona] = useState<HandlerPersona>(
    HandlerPersona.STRATEGIST,
  );
  const [systemStatus, setSystemStatus] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Initialize agent system on mount
  useEffect(() => {
    const initializeSystem = async () => {
      await agentSystem.initialize();

      // Create demo case
      const caseId = await agentSystem.createCase(
        "Demo Constitutional Rights Case",
      );
      setCurrentCaseId(caseId);

      updateSystemStatus();
    };

    initializeSystem();
  }, []);

  const updateSystemStatus = () => {
    const status = agentSystem.getSystemStatus();
    setSystemStatus(status);
  };

  const handleSendMessage = async () => {
    if (!message.trim() || !currentCaseId || isLoading) return;

    setIsLoading(true);
    try {
      const response: HandlerResponse = await agentSystem.sendMessage(
        message,
        currentCaseId,
      );

      const newMessage: ConversationMessage = {
        user: message,
        handler: response.message,
        timestamp: new Date(),
      };

      setConversation((prev) => [...prev, newMessage]);
      setMessage("");
      updateSystemStatus();
    } catch (error) {
      console.error("Error sending message:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handlePersonaChange = (newPersona: HandlerPersona) => {
    setPersona(newPersona);
    agentSystem.setHandlerPersona(newPersona);
  };

  const createNewCase = async () => {
    const title = `New Case ${new Date().toLocaleTimeString()}`;
    const caseId = await agentSystem.createCase(title);
    setCurrentCaseId(caseId);
    setConversation([]);
    updateSystemStatus();
  };

  const getPersonaDescription = (persona: HandlerPersona): string => {
    const descriptions = {
      [HandlerPersona.STRATEGIST]: "Professional & Supportive",
      [HandlerPersona.GUIDE]: "Direct & Confident",
      [HandlerPersona.RAZOR]: "No BS & Aggressive",
      [HandlerPersona.ALLY]: "Balanced Approach",
    };
    return descriptions[persona];
  };

  const getStatusColor = (status: string): string => {
    switch (status) {
      case "active":
        return "bg-green-500";
      case "idle":
        return "bg-blue-500";
      case "error":
        return "bg-red-500";
      case "blocked":
        return "bg-yellow-500";
      default:
        return "bg-gray-500";
    }
  };

  return (
    <div className="w-full min-h-screen p-2 sm:p-4 space-y-3">
      <div className="text-center mb-4">
        <h1 className="text-xl sm:text-2xl font-bold mb-1">
          Constitutional Weapon System
        </h1>
        <p className="text-sm text-muted-foreground">
          Multi-Agent Architecture for Pro Se Warriors
        </p>
      </div>

      <div className="flex flex-col space-y-3">
        {/* Main Chat Interface */}
        <div className="w-full">
          <Card className="h-[70vh] flex flex-col">
            <CardHeader className="pb-3">
              <div className="flex flex-col space-y-2">
                <div className="flex justify-between items-start">
                  <div className="min-w-0 flex-1">
                    <CardTitle className="text-lg">Handler Agent</CardTitle>
                    <CardDescription className="text-sm">
                      Educational firewall enforced
                    </CardDescription>
                  </div>
                  <Badge variant="outline" className="ml-2 text-xs">
                    {currentCaseId?.slice(-8)}
                  </Badge>
                </div>

                <div className="flex flex-col sm:flex-row gap-2 items-stretch sm:items-center">
                  <Select value={persona} onValueChange={handlePersonaChange}>
                    <SelectTrigger className="w-full sm:w-48">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {Object.values(HandlerPersona).map((p) => (
                        <SelectItem key={p} value={p}>
                          {p.charAt(0).toUpperCase() + p.slice(1)}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>

                  <Button
                    variant="outline"
                    size="sm"
                    onClick={createNewCase}
                    className="sm:w-auto"
                  >
                    New Case
                  </Button>
                </div>
              </div>
            </CardHeader>

            <CardContent className="flex-1 flex flex-col p-3">
              <ScrollArea className="flex-1 mb-3 p-2 border rounded-md">
                {conversation.length === 0 ? (
                  <div className="text-center text-muted-foreground text-sm p-4">
                    Start a conversation to see the Handler in action...
                  </div>
                ) : (
                  <div className="space-y-3">
                    {conversation.map((msg, idx) => (
                      <div key={idx} className="space-y-2">
                        <div className="bg-blue-50 p-2 rounded-lg">
                          <div className="font-semibold text-xs text-blue-700 mb-1">
                            You:
                          </div>
                          <div className="text-sm">{msg.user}</div>
                        </div>

                        <div className="bg-green-50 p-2 rounded-lg">
                          <div className="font-semibold text-xs text-green-700 mb-1">
                            Handler ({persona}):
                          </div>
                          <div className="whitespace-pre-line text-sm">
                            {msg.handler}
                          </div>
                        </div>

                        <div className="text-xs text-muted-foreground text-right">
                          {msg.timestamp.toLocaleTimeString()}
                        </div>

                        {idx < conversation.length - 1 && (
                          <Separator className="my-2" />
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </ScrollArea>

              <div className="flex gap-2">
                <Input
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Ask about your constitutional rights..."
                  onKeyPress={(e) => e.key === "Enter" && handleSendMessage()}
                  disabled={isLoading}
                  className="text-sm"
                />
                <Button
                  onClick={handleSendMessage}
                  disabled={isLoading || !message.trim()}
                  size="sm"
                >
                  Send
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* System Status Panel - Mobile Optimized */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base">Agent Status</CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              {systemStatus && (
                <div className="space-y-2">
                  {Object.entries(systemStatus.agents).map(
                    ([role, agent]: [string, any]) => (
                      <div
                        key={role}
                        className="flex justify-between items-center text-sm"
                      >
                        <div className="min-w-0 flex-1">
                          <div className="font-medium truncate">
                            {agent.name.split(" ")[0]}
                          </div>
                          <div className="text-xs text-muted-foreground">
                            T:{agent.taskQueueLength} M:{agent.memoryObjects}
                          </div>
                        </div>
                        <div className="flex items-center gap-1 ml-2">
                          <div
                            className={`w-2 h-2 rounded-full ${getStatusColor(agent.status)}`}
                          />
                          <span className="text-xs capitalize">
                            {agent.status}
                          </span>
                        </div>
                      </div>
                    ),
                  )}
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base">System Status</CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              {systemStatus && (
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span>Case:</span>
                    <code className="text-xs">
                      {systemStatus.currentCaseId?.slice(-8)}
                    </code>
                  </div>
                  <div className="flex justify-between">
                    <span>Breaches:</span>
                    <Badge
                      variant={
                        systemStatus.breachEvents.length === 0
                          ? "default"
                          : "destructive"
                      }
                      className="h-5 text-xs"
                    >
                      {systemStatus.breachEvents.length}
                    </Badge>
                  </div>
                  <div className="flex justify-between">
                    <span>Status:</span>
                    <Badge
                      variant={
                        systemStatus.initialized ? "default" : "secondary"
                      }
                      className="h-5 text-xs"
                    >
                      {systemStatus.initialized ? "Active" : "Init"}
                    </Badge>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          <Card className="sm:col-span-2">
            <CardHeader className="pb-2">
              <CardTitle className="text-base">UPL Firewall</CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="text-xs space-y-1">
                <div className="font-medium text-green-600">
                  ✅ Handler educates
                </div>
                <div className="font-medium text-red-600">
                  ❌ Handler never advises
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="sm:col-span-2">
            <CardHeader className="pb-2">
              <CardTitle className="text-base">Try These Examples</CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="space-y-2">
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full text-left justify-start h-auto p-2 text-xs"
                  onClick={() =>
                    setMessage(
                      "The officer used excessive force during my arrest",
                    )
                  }
                >
                  "The officer used excessive force..."
                </Button>

                <Button
                  variant="outline"
                  size="sm"
                  className="w-full text-left justify-start h-auto p-2 text-xs"
                  onClick={() =>
                    setMessage("They searched my car without a warrant")
                  }
                >
                  "They searched my car without a warrant"
                </Button>

                <Button
                  variant="outline"
                  size="sm"
                  className="w-full text-left justify-start h-auto p-2 text-xs"
                  onClick={() =>
                    setMessage("Show me the legal standard for excessive force")
                  }
                >
                  "Show me the legal standard..."
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
