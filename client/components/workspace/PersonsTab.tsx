import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users } from "lucide-react";
import { Case } from "@shared/types";

interface PersonsTabProps {
  case: Case;
  onCaseUpdate: (updatedCase: Case) => void;
}

export default function PersonsTab({ case: case_ }: PersonsTabProps) {
  return (
    <div className="p-6">
      <Card className="legal-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Persons & Entities Management
          </CardTitle>
        </CardHeader>
        <CardContent className="py-12 text-center">
          <Users className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-semibold mb-2">Coming Soon</h3>
          <p className="text-muted-foreground">
            Manage officers, witnesses, and other people involved in your case.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
