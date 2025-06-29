import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BookOpen } from "lucide-react";
import { Case } from "@shared/types";

interface SourcesTabProps {
  case: Case;
  onCaseUpdate: (updatedCase: Case) => void;
}

export default function SourcesTab({ case: case_ }: SourcesTabProps) {
  return (
    <div className="p-6">
      <Card className="legal-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BookOpen className="h-5 w-5" />
            Sources & Statutes Library
          </CardTitle>
        </CardHeader>
        <CardContent className="py-12 text-center">
          <BookOpen className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-semibold mb-2">Coming Soon</h3>
          <p className="text-muted-foreground">
            Automatically tracked legal sources, cases, and statutes referenced
            in your case.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
