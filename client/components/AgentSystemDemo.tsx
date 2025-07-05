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
    <div className="container mx-auto p-6 space-y-6">
      <div className="text-center">
        <h1 className="text-3xl font-bold mb-2">
          Constitutional Weapon System
        </h1>
        <p className="text-muted-foreground">
          Multi-Agent Architecture for Pro Se Warriors
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Chat Interface */}
        <div className="lg:col-span-2">
          <Card className="h-[600px] flex flex-col">
            <CardHeader>
              <div className="flex justify-between items-center">
                <div>
                  <CardTitle>Handler Agent (The Frontliner)</CardTitle>
                  <CardDescription>
                    The only agent that talks to you - educational firewall
                    enforced
                  </CardDescription>
                </div>
                <Badge variant="outline">
                  Case: {currentCaseId?.slice(-8)}
                </Badge>
              </div>

              <div className="flex gap-4 items-center">
                <Select value={persona} onValueChange={handlePersonaChange}>
                  <SelectTrigger className="w-48">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.values(HandlerPersona).map((p) => (
                      <SelectItem key={p} value={p}>
                        {p.charAt(0).toUpperCase() + p.slice(1)} -{" "}
                        {getPersonaDescription(p)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <Button variant="outline" size="sm" onClick={createNewCase}>
                  New Case
                </Button>
              </div>
            </CardHeader>

            <CardContent className="flex-1 flex flex-col">
              <ScrollArea className="flex-1 mb-4 p-4 border rounded">
                {conversation.length === 0 ? (
                  <div className="text-center text-muted-foreground">
                    Start a conversation to see the Handler in action...
                  </div>
                ) : (
                  <div className="space-y-4">
                    {conversation.map((msg, idx) => (
                      <div key={idx} className="space-y-2">
                        <div className="bg-blue-50 p-3 rounded-lg">
                          <div className="font-semibold text-sm text-blue-700">
                            You:
                          </div>
                          <div>{msg.user}</div>
                        </div>

                        <div className="bg-green-50 p-3 rounded-lg">
                          <div className="font-semibold text-sm text-green-700">
                            Handler ({persona}):
                          </div>
                          <div className="whitespace-pre-line">
                            {msg.handler}
                          </div>
                        </div>

                        <div className="text-xs text-muted-foreground">
                          {msg.timestamp.toLocaleTimeString()}
                        </div>

                        {idx < conversation.length - 1 && <Separator />}
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
                />
                <Button
                  onClick={handleSendMessage}
                  disabled={isLoading || !message.trim()}
                >
                  Send
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* System Status Panel */}
        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Agent Status</CardTitle>
              <CardDescription>
                Real-time multi-agent coordination
              </CardDescription>
            </CardHeader>
            <CardContent>
              {systemStatus && (
                <div className="space-y-3">
                  {Object.entries(systemStatus.agents).map(
                    ([role, agent]: [string, any]) => (
                      <div
                        key={role}
                        className="flex justify-between items-center"
                      >
                        <div>
                          <div className="font-medium">{agent.name}</div>
                          <div className="text-sm text-muted-foreground">
                            Tasks: {agent.taskQueueLength} | Memory:{" "}
                            {agent.memoryObjects}
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <div
                            className={`w-2 h-2 rounded-full ${getStatusColor(agent.status)}`}
                          />
                          <span className="text-sm capitalize">
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
            <CardHeader>
              <CardTitle className="text-lg">Case Isolation</CardTitle>
              <CardDescription>Constitutional firewall active</CardDescription>
            </CardHeader>
            <CardContent>
              {systemStatus && (
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span>Current Case:</span>
                    <code className="text-sm">
                      {systemStatus.currentCaseId?.slice(-8)}
                    </code>
                  </div>
                  <div className="flex justify-between">
                    <span>Breach Events:</span>
                    <Badge
                      variant={
                        systemStatus.breachEvents.length === 0
                          ? "default"
                          : "destructive"
                      }
                    >
                      {systemStatus.breachEvents.length}
                    </Badge>
                  </div>
                  <div className="flex justify-between">
                    <span>System Status:</span>
                    <Badge
                      variant={
                        systemStatus.initialized ? "default" : "secondary"
                      }
                    >
                      {systemStatus.initialized ? "Active" : "Initializing"}
                    </Badge>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">UPL Firewall</CardTitle>
              <CardDescription>
                Educational boundary enforcement
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-sm space-y-2">
                <div className="font-medium text-green-600">
                  ✅ Handler educates
                </div>
                <div className="font-medium text-red-600">
                  ❌ Handler never advises
                </div>
                <div className="text-muted-foreground">
                  All responses filtered for unauthorized practice of law
                  violations
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Try These Examples</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 text-sm">
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full text-left justify-start h-auto p-3"
                  onClick={() =>
                    setMessage(
                      "The officer used excessive force during my arrest",
                    )
                  }
                >
                  "The officer used excessive force during my arrest"
                </Button>

                <Button
                  variant="outline"
                  size="sm"
                  className="w-full text-left justify-start h-auto p-3"
                  onClick={() =>
                    setMessage("They searched my car without a warrant")
                  }
                >
                  "They searched my car without a warrant"
                </Button>

                <Button
                  variant="outline"
                  size="sm"
                  className="w-full text-left justify-start h-auto p-3"
                  onClick={() =>
                    setMessage("Show me the legal standard for excessive force")
                  }
                >
                  "Show me the legal standard for excessive force"
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
