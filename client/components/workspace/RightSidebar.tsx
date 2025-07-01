import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Network,
  BarChart3,
  Clock,
  Activity,
  Users,
  FileText,
  Shield,
  Zap,
} from "lucide-react";
import { Case } from "@shared/types";

interface RightSidebarProps {
  case: Case;
  activeView: "nodes" | "timeline" | "stats" | "activity";
  onViewChange: (view: "nodes" | "timeline" | "stats" | "activity") => void;
  onCaseUpdate: (updatedCase: Case) => void;
}

interface Node {
  id: string;
  type: "person" | "evidence" | "fact" | "violation" | "source";
  label: string;
  connections: string[];
  strength: number;
}

interface Connection {
  from: string;
  to: string;
  type: "related" | "evidence" | "witness" | "legal";
  strength: number;
}

const VIEW_TABS = [
  { id: "nodes", name: "Nodes", icon: Network },
  { id: "stats", name: "Stats", icon: BarChart3 },
  { id: "timeline", name: "Timeline", icon: Clock },
  { id: "activity", name: "Activity", icon: Activity },
] as const;

export default function RightSidebar({
  case: case_,
  activeView,
  onViewChange,
  onCaseUpdate,
}: RightSidebarProps) {
  const [nodes, setNodes] = useState<Node[]>([]);
  const [connections, setConnections] = useState<Connection[]>([]);
  const [isUpdating, setIsUpdating] = useState(false);

  useEffect(() => {
    // Generate nodes and connections from case data
    updateVisualization();
  }, [case_]);

  const updateVisualization = () => {
    setIsUpdating(true);

    // Generate nodes from case data
    const newNodes: Node[] = [];
    const newConnections: Connection[] = [];

    // Add person nodes
    case_.persons.forEach((person) => {
      newNodes.push({
        id: person.id,
        type: "person",
        label: person.name,
        connections: [],
        strength: Math.random() * 100,
      });
    });

    // Add evidence nodes
    case_.evidence.forEach((evidence) => {
      newNodes.push({
        id: evidence.id,
        type: "evidence",
        label: evidence.name,
        connections: [],
        strength: Math.random() * 100,
      });
    });

    // Add fact nodes
    case_.timeline.slice(-10).forEach((fact) => {
      newNodes.push({
        id: fact.id,
        type: "fact",
        label: `Fact ${fact.factNumber}`,
        connections: fact.linkedPersonIds.concat(fact.linkedEvidenceIds),
        strength: Math.random() * 100,
      });

      // Create connections for facts
      fact.linkedPersonIds.forEach((personId) => {
        newConnections.push({
          from: fact.id,
          to: personId,
          type: "witness",
          strength: Math.random() * 100,
        });
      });

      fact.linkedEvidenceIds.forEach((evidenceId) => {
        newConnections.push({
          from: fact.id,
          to: evidenceId,
          type: "evidence",
          strength: Math.random() * 100,
        });
      });
    });

    // Add some violation nodes (placeholder)
    const violationTypes = [
      "Excessive Force",
      "False Arrest",
      "Unlawful Search",
    ];
    violationTypes.forEach((violation, idx) => {
      newNodes.push({
        id: `violation-${idx}`,
        type: "violation",
        label: violation,
        connections: [],
        strength: Math.random() * 100,
      });
    });

    setNodes(newNodes);
    setConnections(newConnections);

    setTimeout(() => setIsUpdating(false), 1000);
  };

  const getNodeColor = (type: Node["type"]) => {
    switch (type) {
      case "person":
        return "bg-blue-100 text-blue-800 border-blue-200";
      case "evidence":
        return "bg-green-100 text-green-800 border-green-200";
      case "fact":
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case "violation":
        return "bg-red-100 text-red-800 border-red-200";
      case "source":
        return "bg-purple-100 text-purple-800 border-purple-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const getNodeIcon = (type: Node["type"]) => {
    switch (type) {
      case "person":
        return Users;
      case "evidence":
        return FileText;
      case "fact":
        return Clock;
      case "violation":
        return Shield;
      case "source":
        return BarChart3;
      default:
        return Network;
    }
  };

  const renderNodesView = () => (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h4 className="font-semibold text-sm">Network Visualization</h4>
        <Button
          size="sm"
          variant="outline"
          onClick={updateVisualization}
          disabled={isUpdating}
        >
          {isUpdating ? (
            <div className="w-4 h-4 border-2 border-legal-primary border-t-transparent rounded-full animate-spin" />
          ) : (
            <Zap className="h-4 w-4" />
          )}
        </Button>
      </div>

      {/* Simplified node visualization */}
      <div className="relative bg-gray-50 rounded-lg p-4 min-h-[300px] overflow-hidden">
        {nodes.length === 0 ? (
          <div className="text-center text-muted-foreground py-8">
            <Network className="h-8 w-8 mx-auto mb-2 opacity-50" />
            <p className="text-sm">No data to visualize yet</p>
          </div>
        ) : (
          <div className="space-y-2">
            {nodes.map((node, index) => {
              const Icon = getNodeIcon(node.type);
              const label = node.label || "Unlabeled";
              return (
                <div
                  key={node.id}
                  className={`
                      inline-block px-2 py-1 m-1 rounded-full text-xs border
                      ${getNodeColor(node.type)}
                      hover:shadow-sm transition-all cursor-pointer
                    `}
                  style={{
                    transform: `translate(${(index % 5) * 60}px, ${Math.floor(index / 5) * 40}px)`,
                    position: "absolute",
                  }}
                >
                  <Icon className="h-3 w-3 inline mr-1" />
                  {label.length > 10 ? `${label.substring(0, 10)}...` : label}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Node legend */}
      <div className="space-y-1">
        <p className="text-xs font-medium text-muted-foreground">LEGEND</p>
        {[
          { type: "person", label: "People", count: case_.persons.length },
          { type: "evidence", label: "Evidence", count: case_.evidence.length },
          { type: "fact", label: "Facts", count: case_.timeline.length },
          { type: "violation", label: "Violations", count: 3 },
        ].map(({ type, label, count }) => {
          const Icon = getNodeIcon(type as Node["type"]);
          return (
            <div
              key={type}
              className="flex items-center justify-between text-xs"
            >
              <div className="flex items-center gap-1">
                <div
                  className={`w-3 h-3 rounded-full border ${getNodeColor(type as Node["type"]).split(" ")[0]}`}
                />
                <Icon className="h-3 w-3" />
                <span>{label}</span>
              </div>
              <Badge variant="outline" className="text-xs">
                {count}
              </Badge>
            </div>
          );
        })}
      </div>
    </div>
  );

  const renderStatsView = () => (
    <div className="space-y-4">
      <h4 className="font-semibold text-sm">Case Statistics</h4>

      <div className="grid grid-cols-2 gap-3">
        <div className="bg-blue-50 p-3 rounded-lg text-center">
          <div className="text-lg font-bold text-blue-600">
            {case_.timeline.length}
          </div>
          <div className="text-xs text-blue-800">Facts</div>
        </div>
        <div className="bg-green-50 p-3 rounded-lg text-center">
          <div className="text-lg font-bold text-green-600">
            {case_.evidence.length}
          </div>
          <div className="text-xs text-green-800">Evidence</div>
        </div>
        <div className="bg-purple-50 p-3 rounded-lg text-center">
          <div className="text-lg font-bold text-purple-600">
            {case_.persons.length}
          </div>
          <div className="text-xs text-purple-800">People</div>
        </div>
        <div className="bg-orange-50 p-3 rounded-lg text-center">
          <div className="text-lg font-bold text-orange-600">
            {case_.deadlines.filter((d) => !d.completed).length}
          </div>
          <div className="text-xs text-orange-800">Deadlines</div>
        </div>
      </div>

      <div className="space-y-2">
        <div className="flex justify-between text-xs">
          <span>Case Completeness</span>
          <span className="font-medium">
            {Math.min(
              100,
              case_.timeline.length * 10 + case_.evidence.length * 5,
            )}
            %
          </span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div
            className="bg-legal-primary h-2 rounded-full transition-all"
            style={{
              width: `${Math.min(100, case_.timeline.length * 10 + case_.evidence.length * 5)}%`,
            }}
          />
        </div>
      </div>

      <div className="space-y-2">
        <p className="text-xs font-medium text-muted-foreground">PROGRESS</p>
        {[
          {
            label: "Timeline Built",
            progress: Math.min(100, case_.timeline.length * 20),
          },
          {
            label: "Evidence Collected",
            progress: Math.min(100, case_.evidence.length * 25),
          },
          {
            label: "People Identified",
            progress: Math.min(100, case_.persons.length * 33),
          },
        ].map(({ label, progress }) => (
          <div key={label} className="space-y-1">
            <div className="flex justify-between text-xs">
              <span className="text-muted-foreground">{label}</span>
              <span className="font-medium">{progress}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-1">
              <div
                className="bg-legal-primary h-1 rounded-full transition-all"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  const renderTimelineView = () => (
    <div className="space-y-4">
      <h4 className="font-semibold text-sm">Recent Activity</h4>

      <div className="space-y-3 max-h-[400px] overflow-auto">
        {case_.timeline
          .slice(-10)
          .reverse()
          .map((fact, index) => (
            <div key={fact.id} className="flex gap-2 text-xs">
              <div className="w-2 h-2 bg-legal-primary rounded-full mt-1.5 flex-shrink-0" />
              <div className="flex-1">
                <p className="text-muted-foreground">
                  Fact {fact.factNumber}: {fact.description.substring(0, 60)}...
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  {fact.date.toLocaleDateString()}
                </p>
              </div>
            </div>
          ))}

        {case_.timeline.length === 0 && (
          <div className="text-center text-muted-foreground py-8">
            <Clock className="h-8 w-8 mx-auto mb-2 opacity-50" />
            <p className="text-sm">No timeline facts yet</p>
          </div>
        )}
      </div>
    </div>
  );

  const renderActivityView = () => (
    <div className="space-y-4">
      <h4 className="font-semibold text-sm">Live Updates</h4>

      <div className="space-y-2 max-h-[400px] overflow-auto">
        {[
          {
            action: "Added evidence file",
            time: "2 min ago",
            type: "evidence",
          },
          { action: "Updated timeline fact", time: "5 min ago", type: "fact" },
          { action: "Added new person", time: "10 min ago", type: "person" },
          {
            action: "Violation analysis",
            time: "15 min ago",
            type: "violation",
          },
        ].map((activity, index) => (
          <div
            key={index}
            className="flex items-center gap-2 p-2 bg-gray-50 rounded text-xs"
          >
            <div
              className={`w-2 h-2 rounded-full ${
                activity.type === "evidence"
                  ? "bg-green-500"
                  : activity.type === "fact"
                    ? "bg-yellow-500"
                    : activity.type === "person"
                      ? "bg-blue-500"
                      : "bg-red-500"
              }`}
            />
            <div className="flex-1">
              <p>{activity.action}</p>
              <p className="text-muted-foreground">{activity.time}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="pt-4 border-t">
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
          <span>Real-time updates active</span>
        </div>
      </div>
    </div>
  );

  return (
    <div className="w-80 bg-white border-l border-legal-border shadow-sm flex flex-col">
      {/* Header */}
      <div className="p-4 border-b border-legal-border">
        <h3 className="font-semibold text-sm text-legal-primary">
          Case Visualization
        </h3>
      </div>

      {/* View Tabs */}
      <div className="border-b border-legal-border">
        <div className="flex">
          {VIEW_TABS.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => onViewChange(tab.id)}
                className={`
                  flex-1 flex items-center justify-center gap-1 px-2 py-3 text-xs
                  transition-colors border-b-2
                  ${
                    activeView === tab.id
                      ? "border-legal-primary text-legal-primary bg-legal-accent"
                      : "border-transparent text-muted-foreground hover:text-foreground"
                  }
                `}
              >
                <Icon className="h-3 w-3" />
                <span>{tab.name}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 p-4 overflow-auto">
        {activeView === "nodes" && renderNodesView()}
        {activeView === "stats" && renderStatsView()}
        {activeView === "timeline" && renderTimelineView()}
        {activeView === "activity" && renderActivityView()}
      </div>
    </div>
  );
}
