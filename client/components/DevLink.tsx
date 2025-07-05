import { Button } from "@/components/ui/button";
import { ExternalLink, Users } from "lucide-react";

export default function DevLink() {
  return (
    <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2">
      <Button
        variant="outline"
        size="sm"
        onClick={() => (window.location.href = "/agent-system")}
        className="bg-white/90 backdrop-blur border shadow-lg"
      >
        <Users className="h-3 w-3 mr-1" />
        Agent System
      </Button>
      <Button
        variant="outline"
        size="sm"
        onClick={() => (window.location.href = "/dashboard")}
        className="bg-white/90 backdrop-blur border shadow-lg"
      >
        <ExternalLink className="h-3 w-3 mr-1" />
        Complex UI
      </Button>
    </div>
  );
}
