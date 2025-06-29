import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  FolderOpen,
  FileText,
  Image,
  Video,
  Music,
  Download,
  Eye,
  Search,
  Tag,
  Filter,
  Share,
} from "lucide-react";
import { Case, EvidenceFile } from "@shared/types";
import { FileValidator } from "@/lib/pdf-processor";

interface EvidenceTabProps {
  case: Case;
  onCaseUpdate: (updatedCase: Case) => void;
}

type FileType = "all" | "documents" | "images" | "videos" | "audio";

export default function EvidenceTab({
  case: case_,
  onCaseUpdate,
}: EvidenceTabProps) {
  const [selectedFile, setSelectedFile] = useState<EvidenceFile | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [fileTypeFilter, setFileTypeFilter] = useState<FileType>("all");
  const [showFileDetails, setShowFileDetails] = useState(false);

  const getFileIcon = (fileType: string) => {
    if (fileType.includes("pdf") || fileType.includes("document"))
      return FileText;
    if (fileType.includes("image")) return Image;
    if (fileType.includes("video")) return Video;
    if (fileType.includes("audio")) return Music;
    return FileText;
  };

  const getFileIconEmoji = (fileType: string) => {
    return FileValidator.getFileIcon(fileType);
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "numeric",
      minute: "2-digit",
    }).format(new Date(date));
  };

  const filterFiles = (files: EvidenceFile[]) => {
    let filtered = files;

    // Filter by type
    if (fileTypeFilter !== "all") {
      filtered = filtered.filter((file) => {
        switch (fileTypeFilter) {
          case "documents":
            return (
              file.fileType.includes("pdf") ||
              file.fileType.includes("document")
            );
          case "images":
            return file.fileType.includes("image");
          case "videos":
            return file.fileType.includes("video");
          case "audio":
            return file.fileType.includes("audio");
          default:
            return true;
        }
      });
    }

    // Filter by search query
    if (searchQuery) {
      filtered = filtered.filter(
        (file) =>
          file.fileName.toLowerCase().includes(searchQuery.toLowerCase()) ||
          file.extractedText
            ?.toLowerCase()
            .includes(searchQuery.toLowerCase()) ||
          file.tags.some((tag) =>
            tag.toLowerCase().includes(searchQuery.toLowerCase()),
          ),
      );
    }

    return filtered;
  };

  const getFileCounts = () => {
    const files = case_.evidence;
    return {
      all: files.length,
      documents: files.filter(
        (f) => f.fileType.includes("pdf") || f.fileType.includes("document"),
      ).length,
      images: files.filter((f) => f.fileType.includes("image")).length,
      videos: files.filter((f) => f.fileType.includes("video")).length,
      audio: files.filter((f) => f.fileType.includes("audio")).length,
    };
  };

  const filteredFiles = filterFiles(case_.evidence);
  const fileCounts = getFileCounts();

  const renderFileGrid = () => {
    if (filteredFiles.length === 0) {
      return (
        <Card className="legal-card">
          <CardContent className="py-12 text-center">
            <FolderOpen className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">
              {case_.evidence.length === 0
                ? "No Evidence Files"
                : "No Files Match Filter"}
            </h3>
            <p className="text-muted-foreground">
              {case_.evidence.length === 0
                ? "Upload files in the Dashboard tab to get started."
                : "Try adjusting your search or filter criteria."}
            </p>
          </CardContent>
        </Card>
      );
    }

    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredFiles.map((file) => {
          const IconComponent = getFileIcon(file.fileType);
          return (
            <Card
              key={file.id}
              className="legal-card cursor-pointer hover:shadow-md transition-shadow"
              onClick={() => {
                setSelectedFile(file);
                setShowFileDetails(true);
              }}
            >
              <CardContent className="p-4">
                <div className="flex items-start gap-3">
                  <div className="flex-shrink-0">
                    <div className="w-12 h-12 bg-legal-secondary rounded-lg flex items-center justify-center">
                      <span className="text-xl">
                        {getFileIconEmoji(file.fileType)}
                      </span>
                    </div>
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-medium truncate">{file.fileName}</h3>
                    <p className="text-sm text-muted-foreground">
                      {formatFileSize(file.fileSize)}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {formatDate(file.uploadedAt)}
                    </p>
                  </div>
                </div>

                <div className="mt-3 space-y-2">
                  {file.extractedText && (
                    <Badge variant="secondary" className="text-xs">
                      Text Extracted
                    </Badge>
                  )}
                  {file.redacted && (
                    <Badge variant="outline" className="text-xs">
                      Redacted Version
                    </Badge>
                  )}
                  {file.factIds.length > 0 && (
                    <Badge variant="outline" className="text-xs">
                      {file.factIds.length} linked fact
                      {file.factIds.length !== 1 ? "s" : ""}
                    </Badge>
                  )}
                </div>

                {file.tags.length > 0 && (
                  <div className="mt-2 flex flex-wrap gap-1">
                    {file.tags.slice(0, 2).map((tag, i) => (
                      <Badge key={i} variant="secondary" className="text-xs">
                        {tag}
                      </Badge>
                    ))}
                    {file.tags.length > 2 && (
                      <Badge variant="secondary" className="text-xs">
                        +{file.tags.length - 2}
                      </Badge>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>
    );
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-semibold flex items-center gap-2">
            <FolderOpen className="h-6 w-6 text-legal-primary" />
            Evidence Locker
          </h2>
          <p className="text-muted-foreground">
            Organize and manage all your case evidence files with search and
            analysis tools.
          </p>
        </div>
      </div>

      {/* Search and Filters */}
      <Card className="legal-card">
        <CardContent className="p-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search files by name, content, or tags..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" size="sm">
                <Filter className="h-4 w-4 mr-2" />
                Advanced Filter
              </Button>
              <Button variant="outline" size="sm">
                <Tag className="h-4 w-4 mr-2" />
                Manage Tags
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* File Type Tabs */}
      <Tabs
        value={fileTypeFilter}
        onValueChange={(v) => setFileTypeFilter(v as FileType)}
      >
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="all">All ({fileCounts.all})</TabsTrigger>
          <TabsTrigger value="documents">
            Documents ({fileCounts.documents})
          </TabsTrigger>
          <TabsTrigger value="images">Images ({fileCounts.images})</TabsTrigger>
          <TabsTrigger value="videos">Videos ({fileCounts.videos})</TabsTrigger>
          <TabsTrigger value="audio">Audio ({fileCounts.audio})</TabsTrigger>
        </TabsList>

        <TabsContent value={fileTypeFilter} className="space-y-4">
          {renderFileGrid()}
        </TabsContent>
      </Tabs>

      {/* File Details Modal */}
      <Dialog open={showFileDetails} onOpenChange={setShowFileDetails}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          {selectedFile && (
            <>
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  <span className="text-xl">
                    {getFileIconEmoji(selectedFile.fileType)}
                  </span>
                  {selectedFile.fileName}
                </DialogTitle>
              </DialogHeader>
              <div className="space-y-6">
                {/* File Info */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-4 bg-muted rounded-lg">
                  <div>
                    <div className="text-sm text-muted-foreground">
                      File Size
                    </div>
                    <div className="font-medium">
                      {formatFileSize(selectedFile.fileSize)}
                    </div>
                  </div>
                  <div>
                    <div className="text-sm text-muted-foreground">
                      File Type
                    </div>
                    <div className="font-medium">{selectedFile.fileType}</div>
                  </div>
                  <div>
                    <div className="text-sm text-muted-foreground">
                      Uploaded
                    </div>
                    <div className="font-medium">
                      {formatDate(selectedFile.uploadedAt)}
                    </div>
                  </div>
                  <div>
                    <div className="text-sm text-muted-foreground">
                      Linked Facts
                    </div>
                    <div className="font-medium">
                      {selectedFile.factIds.length}
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex gap-2">
                  <Button variant="outline" size="sm">
                    <Eye className="h-4 w-4 mr-2" />
                    View File
                  </Button>
                  <Button variant="outline" size="sm">
                    <Download className="h-4 w-4 mr-2" />
                    Download
                  </Button>
                  <Button variant="outline" size="sm">
                    <Share className="h-4 w-4 mr-2" />
                    Redact & Share
                  </Button>
                </div>

                {/* Extracted Text */}
                {selectedFile.extractedText && (
                  <div>
                    <h3 className="font-semibold mb-2">Extracted Text</h3>
                    <div className="p-4 bg-muted rounded-lg max-h-60 overflow-y-auto">
                      <pre className="text-sm whitespace-pre-wrap">
                        {selectedFile.extractedText}
                      </pre>
                    </div>
                  </div>
                )}

                {/* Tags */}
                <div>
                  <h3 className="font-semibold mb-2">Tags</h3>
                  <div className="flex flex-wrap gap-2">
                    {selectedFile.tags.length > 0 ? (
                      selectedFile.tags.map((tag, i) => (
                        <Badge key={i} variant="secondary">
                          {tag}
                        </Badge>
                      ))
                    ) : (
                      <p className="text-muted-foreground">No tags added</p>
                    )}
                  </div>
                </div>

                {/* Linked Timeline Facts */}
                {selectedFile.factIds.length > 0 && (
                  <div>
                    <h3 className="font-semibold mb-2">
                      Linked Timeline Facts
                    </h3>
                    <div className="space-y-2">
                      {selectedFile.factIds.map((factId) => {
                        const fact = case_.timeline.find(
                          (f) => f.id === factId,
                        );
                        return fact ? (
                          <div
                            key={factId}
                            className="p-3 border border-legal-accent rounded-lg"
                          >
                            <div className="flex items-center gap-2 mb-1">
                              <Badge variant="outline" className="text-xs">
                                Fact #{fact.factNumber}
                              </Badge>
                              <span className="text-sm text-muted-foreground">
                                {formatDate(fact.timestamp)}
                              </span>
                            </div>
                            <p className="text-sm">{fact.description}</p>
                          </div>
                        ) : null;
                      })}
                    </div>
                  </div>
                )}
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>

      {/* Evidence Statistics */}
      {case_.evidence.length > 0 && (
        <Card className="legal-card">
          <CardHeader>
            <CardTitle className="text-lg">Evidence Statistics</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-legal-primary">
                  {case_.evidence.length}
                </div>
                <div className="text-sm text-muted-foreground">Total Files</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">
                  {case_.evidence.filter((f) => f.extractedText).length}
                </div>
                <div className="text-sm text-muted-foreground">
                  Text Extracted
                </div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">
                  {case_.evidence.filter((f) => f.factIds.length > 0).length}
                </div>
                <div className="text-sm text-muted-foreground">
                  Linked to Facts
                </div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-orange-600">
                  {case_.evidence.filter((f) => f.redacted).length}
                </div>
                <div className="text-sm text-muted-foreground">
                  Redacted Copies
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
