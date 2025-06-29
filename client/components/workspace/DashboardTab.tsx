import { useState, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Upload,
  FileText,
  AlertCircle,
  CheckCircle,
  Clock,
  Users,
  Scale,
  Loader2,
} from "lucide-react";
import { Case, EvidenceFile } from "@shared/types";
import { CaseManager } from "@/lib/case-management";
import { FileProcessor } from "@/lib/file-processor";
import { toast } from "@/hooks/use-toast";

interface DashboardTabProps {
  case: Case;
  onCaseUpdate: (updatedCase: Case) => void;
}

export default function DashboardTab({
  case: case_,
  onCaseUpdate,
}: DashboardTabProps) {
  const [isProcessing, setIsProcessing] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const caseManager = CaseManager.getInstance();

  const handleFileUpload = async (files: FileList) => {
    setIsProcessing(true);
    setUploadProgress(0);

    try {
      const fileArray = Array.from(files);
      let processed = 0;

      for (const file of fileArray) {
        try {
          // Process file with robust processor
          const processed = await FileProcessor.processFile(file);

          if (processed.error) {
            toast({
              title: "File Processing Failed",
              description: `${file.name}: ${processed.error}`,
              variant: "destructive",
            });
            continue;
          }

          const evidence: Omit<EvidenceFile, "id" | "uploadedAt"> = {
            fileName: processed.fileName,
            fileType: processed.fileType,
            fileSize: processed.fileSize,
            extractedText:
              processed.metadata.extractedText || processed.content,
            factIds: [],
            tags: processed.metadata.keywords || [],
            redacted: false,
          };

          caseManager.addEvidence(case_.id, evidence);

          // Auto-add timeline facts from extracted dates
          if (processed.metadata.dates && processed.metadata.dates.length > 0) {
            processed.metadata.dates.forEach((date, index) => {
              const fact = {
                description: `Date referenced in ${file.name}`,
                date,
                source: file.name,
                verified: false,
                linkedEvidenceIds: [],
                linkedPersonIds: [],
                tags: ["auto-extracted"],
              };
              caseManager.addTimelineFact(case_.id, fact);
            });
          }

          toast({
            title: "File Processed Successfully",
            description: `${file.name} - ${processed.metadata.extractedText ? "Text extracted" : "Metadata captured"}`,
          });
        } catch (error) {
          toast({
            title: "Processing Error",
            description: `Failed to process ${file.name}: ${error instanceof Error ? error.message : "Unknown error"}`,
            variant: "destructive",
          });
        }

        processed++;
        setUploadProgress((processed / fileArray.length) * 100);
      }

      // Update case
      const updatedCase = caseManager.getCase(case_.id);
      if (updatedCase) {
        onCaseUpdate(updatedCase);
      }
    } catch (error) {
      toast({
        title: "Upload Error",
        description: "Failed to process files. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
      setUploadProgress(0);
    }
  };

  const handleFileSelect = () => {
    fileInputRef.current?.click();
  };

  const getFileIcon = (fileType: string) => {
    if (fileType.includes("pdf")) return "📄";
    if (fileType.includes("image")) return "🖼️";
    if (fileType.includes("video")) return "🎥";
    if (fileType.includes("audio")) return "🎵";
    return "📎";
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  const getCaseProgress = () => {
    const totalSteps = 5; // Basic steps for case development
    let completed = 0;

    if (case_.evidence.length > 0) completed++;
    if (case_.timeline.length > 0) completed++;
    if (case_.persons.length > 0) completed++;
    if (case_.documents.length > 0) completed++;
    if (case_.jurisdiction) completed++;

    return (completed / totalSteps) * 100;
  };

  return (
    <div className="p-6 space-y-6">
      {/* Case Genesis Header */}
      <div className="space-y-2">
        <h2 className="text-2xl font-semibold flex items-center gap-2">
          <Scale className="h-6 w-6 text-legal-primary" />
          Module A: Case Genesis
        </h2>
        <p className="text-muted-foreground">
          Begin by uploading your case files (e.g., Police Reports, Citations,
          Body Camera Footage). PDF format is supported with automatic text
          extraction.
        </p>
      </div>

      {/* Case Progress */}
      <Card className="legal-card">
        <CardHeader>
          <CardTitle className="text-lg">Case Development Progress</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Overall Progress</span>
              <span>{Math.round(getCaseProgress())}%</span>
            </div>
            <Progress value={getCaseProgress()} className="h-2" />
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-legal-primary">
                {case_.evidence.length}
              </div>
              <div className="text-sm text-muted-foreground">
                Evidence Files
              </div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-legal-primary">
                {case_.timeline.length}
              </div>
              <div className="text-sm text-muted-foreground">
                Timeline Facts
              </div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-legal-primary">
                {case_.persons.length}
              </div>
              <div className="text-sm text-muted-foreground">People</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-legal-primary">
                {case_.documents.length}
              </div>
              <div className="text-sm text-muted-foreground">Documents</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* File Upload Section */}
      <Card className="legal-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Upload className="h-5 w-5" />
            Upload Evidence Files
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              Supported formats: PDF, Images (JPG, PNG, GIF), Videos (MP4, MOV),
              Audio (MP3, WAV). Maximum file size: 50MB per file.
            </AlertDescription>
          </Alert>

          <div className="border-2 border-dashed border-legal-accent rounded-lg p-8 text-center hover:border-legal-primary transition-colors">
            <Upload className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">
              Drag and drop files here
            </h3>
            <p className="text-muted-foreground mb-4">
              or click to select files from your device
            </p>
            <Button
              onClick={handleFileSelect}
              disabled={isProcessing}
              className="bg-legal-primary hover:bg-legal-primary/90"
            >
              {isProcessing ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Processing...
                </>
              ) : (
                <>
                  <Upload className="h-4 w-4 mr-2" />
                  Select Files
                </>
              )}
            </Button>
          </div>

          {isProcessing && (
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Processing files...</span>
                <span>{Math.round(uploadProgress)}%</span>
              </div>
              <Progress value={uploadProgress} className="h-2" />
            </div>
          )}

          <input
            ref={fileInputRef}
            type="file"
            multiple
            accept=".pdf,.jpg,.jpeg,.png,.gif,.mp4,.mov,.mp3,.wav"
            onChange={(e) => {
              if (e.target.files && e.target.files.length > 0) {
                handleFileUpload(e.target.files);
              }
            }}
            className="hidden"
          />
        </CardContent>
      </Card>

      {/* Recent Evidence */}
      {case_.evidence.length > 0 && (
        <Card className="legal-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Recent Evidence Files
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {case_.evidence.slice(0, 5).map((evidence) => (
                <div
                  key={evidence.id}
                  className="flex items-center justify-between p-3 border border-legal-accent rounded-lg"
                >
                  <div className="flex items-center gap-3">
                    <span className="text-xl">
                      {getFileIcon(evidence.fileType)}
                    </span>
                    <div>
                      <p className="font-medium">{evidence.fileName}</p>
                      <p className="text-sm text-muted-foreground">
                        {formatFileSize(evidence.fileSize)} •{" "}
                        {new Date(evidence.uploadedAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {evidence.extractedText && (
                      <Badge variant="secondary">Text Extracted</Badge>
                    )}
                    <Button variant="outline" size="sm">
                      View
                    </Button>
                  </div>
                </div>
              ))}
              {case_.evidence.length > 5 && (
                <div className="text-center py-2">
                  <Button variant="outline" size="sm">
                    View All {case_.evidence.length} Files
                  </Button>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Quick Actions */}
      <Card className="legal-card">
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Button
              variant="outline"
              className="h-auto p-4 flex flex-col items-center gap-2"
            >
              <Clock className="h-6 w-6" />
              <div className="text-center">
                <div className="font-medium">Build Timeline</div>
                <div className="text-xs text-muted-foreground">
                  Add facts chronologically
                </div>
              </div>
            </Button>

            <Button
              variant="outline"
              className="h-auto p-4 flex flex-col items-center gap-2"
            >
              <Users className="h-6 w-6" />
              <div className="text-center">
                <div className="font-medium">Add People</div>
                <div className="text-xs text-muted-foreground">
                  Officers, witnesses, etc.
                </div>
              </div>
            </Button>

            <Button
              variant="outline"
              className="h-auto p-4 flex flex-col items-center gap-2"
            >
              <FileText className="h-6 w-6" />
              <div className="text-center">
                <div className="font-medium">Generate Docs</div>
                <div className="text-xs text-muted-foreground">
                  Legal documents
                </div>
              </div>
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Educational Content */}
      <Card className="legal-card bg-legal-secondary border-legal-primary">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CheckCircle className="h-5 w-5 text-legal-primary" />
            Getting Started Tips
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-start gap-3">
            <div className="w-6 h-6 rounded-full bg-legal-primary text-white text-xs flex items-center justify-center mt-0.5">
              1
            </div>
            <div>
              <p className="font-medium">Upload Key Documents First</p>
              <p className="text-sm text-muted-foreground">
                Start with police reports, citations, or incident reports. The
                AI will extract text and suggest timeline facts.
              </p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <div className="w-6 h-6 rounded-full bg-legal-primary text-white text-xs flex items-center justify-center mt-0.5">
              2
            </div>
            <div>
              <p className="font-medium">Review AI Suggestions</p>
              <p className="text-sm text-muted-foreground">
                The AI will analyze your documents and suggest facts, people,
                and legal concepts. Review and approve each suggestion.
              </p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <div className="w-6 h-6 rounded-full bg-legal-primary text-white text-xs flex items-center justify-center mt-0.5">
              3
            </div>
            <div>
              <p className="font-medium">Build Your Timeline</p>
              <p className="text-sm text-muted-foreground">
                Organize facts chronologically to tell your story clearly and
                identify legal issues.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
