import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FileText } from "lucide-react";
import { Case } from "@shared/types";

interface DocumentsTabProps {
  case: Case;
  onCaseUpdate: (updatedCase: Case) => void;
}

export default function DocumentsTab({ case: case_ }: DocumentsTabProps) {
  return (
    <div className="p-6">
      <Card className="legal-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Documents & Drafts
          </CardTitle>
        </CardHeader>
        <CardContent className="py-12 text-center">
          <FileText className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-semibold mb-2">Coming Soon</h3>
          <p className="text-muted-foreground">
            Generate legal documents, motions, and correspondence with AI
            assistance.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
