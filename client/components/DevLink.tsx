import { Button } from "@/components/ui/button";
import { ExternalLink, Users, Home, Zap } from "lucide-react";

export default function DevLink() {
  return (
    <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-1">
      <Button
        variant="outline"
        size="sm"
        onClick={() => (window.location.href = "/")}
        className="bg-white/90 backdrop-blur border shadow-lg text-xs px-2 py-1"
      >
        <Home className="h-3 w-3 mr-1" />
        Main App
      </Button>
      <Button
        variant="outline"
        size="sm"
        onClick={() => (window.location.href = "/agent-system")}
        className="bg-white/90 backdrop-blur border shadow-lg text-xs px-2 py-1"
      >
        <Users className="h-3 w-3 mr-1" />
        Agent Demo
      </Button>
      <Button
        variant="outline"
        size="sm"
        onClick={() => (window.location.href = "/simple-agent")}
        className="bg-white/90 backdrop-blur border shadow-lg text-xs px-2 py-1"
      >
        <Zap className="h-3 w-3 mr-1" />
        Old UI
      </Button>
      <Button
        variant="outline"
        size="sm"
        onClick={() => (window.location.href = "/dashboard")}
        className="bg-white/90 backdrop-blur border shadow-lg text-xs px-2 py-1"
      >
        <ExternalLink className="h-3 w-3 mr-1" />
        Complex UI
      </Button>
    </div>
  );
}
