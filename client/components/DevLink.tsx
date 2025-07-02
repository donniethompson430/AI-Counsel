import { Button } from "@/components/ui/button";
import { ExternalLink } from "lucide-react";

export default function DevLink() {
  return (
    <div className="fixed bottom-4 right-4 z-50">
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
