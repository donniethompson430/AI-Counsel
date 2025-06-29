import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { StickyNote } from "lucide-react";
import { Case } from "@shared/types";

interface NotesTabProps {
  case: Case;
  onCaseUpdate: (updatedCase: Case) => void;
}

export default function NotesTab({ case: case_ }: NotesTabProps) {
  return (
    <div className="p-6">
      <Card className="legal-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <StickyNote className="h-5 w-5" />
            Case Notes
          </CardTitle>
        </CardHeader>
        <CardContent className="py-12 text-center">
          <StickyNote className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-semibold mb-2">Coming Soon</h3>
          <p className="text-muted-foreground">
            Keep organized notes, research, and thoughts about your case.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
