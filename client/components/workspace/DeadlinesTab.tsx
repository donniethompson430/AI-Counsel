import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar } from "lucide-react";
import { Case } from "@shared/types";

interface DeadlinesTabProps {
  case: Case;
  onCaseUpdate: (updatedCase: Case) => void;
}

export default function DeadlinesTab({ case: case_ }: DeadlinesTabProps) {
  return (
    <div className="p-6">
      <Card className="legal-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Deadline Manager
          </CardTitle>
        </CardHeader>
        <CardContent className="py-12 text-center">
          <Calendar className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-semibold mb-2">Coming Soon</h3>
          <p className="text-muted-foreground">
            Track important deadlines and case milestones with intelligent
            reminders.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
