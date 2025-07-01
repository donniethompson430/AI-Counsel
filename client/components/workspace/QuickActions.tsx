import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Shield,
  Clock,
  FolderOpen,
  FileText,
  Users,
  Calendar,
  Zap,
} from "lucide-react";

interface QuickActionsProps {
  onTabChange: (tab: string) => void;
}

export default function QuickActions({ onTabChange }: QuickActionsProps) {
  const quickActions = [
    {
      id: "violations",
      icon: Shield,
      title: "Analyze Violations",
      description: "Identify legal violations",
    },
    {
      id: "timeline",
      icon: Clock,
      title: "Build Timeline",
      description: "Add more facts",
    },
    {
      id: "evidence",
      icon: FolderOpen,
      title: "Upload Evidence",
      description: "Add supporting files",
    },
    {
      id: "persons",
      icon: Users,
      title: "Add People",
      description: "Identify persons involved",
    },
    {
      id: "documents",
      icon: FileText,
      title: "Draft Documents",
      description: "Generate legal docs",
    },
    {
      id: "deadlines",
      icon: Calendar,
      title: "Set Deadlines",
      description: "Track important dates",
    },
  ];

  return (
    <Card className="legal-card">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-sm">
          <Zap className="h-4 w-4 text-legal-primary" />
          Quick Actions
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          {quickActions.map((action) => {
            const Icon = action.icon;
            return (
              <Button
                key={action.id}
                onClick={() => onTabChange(action.id)}
                variant="outline"
                className="w-full justify-start h-auto p-3"
              >
                <Icon className="h-4 w-4 mr-2 text-legal-primary" />
                <div className="text-left">
                  <div className="font-medium text-xs">{action.title}</div>
                  <div className="text-xs text-muted-foreground">
                    {action.description}
                  </div>
                </div>
              </Button>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
