// Robust File Processing System
// Handles multiple file types without external worker dependencies

export interface ProcessedFile {
  fileName: string;
  fileType: string;
  fileSize: number;
  content?: string;
  metadata: {
    pageCount?: number;
    duration?: number;
    dimensions?: { width: number; height: number };
    extractedText?: string;
    keywords?: string[];
    dates?: Date[];
    persons?: string[];
  };
  error?: string;
}

export class FileProcessor {
  private static readonly MAX_FILE_SIZE = 50 * 1024 * 1024; // 50MB
  private static readonly SUPPORTED_TYPES = [
    "application/pdf",
    "image/jpeg",
    "image/png",
    "image/gif",
    "image/webp",
    "video/mp4",
    "video/quicktime",
    "video/webm",
    "audio/mpeg",
    "audio/wav",
    "audio/mp3",
    "text/plain",
    "application/msword", // .doc files
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document", // .docx files
    "application/rtf", // Rich Text Format
    "application/vnd.oasis.opendocument.text", // OpenDocument Text
    "application/zip", // .zip files
    "application/x-zip-compressed", // .zip files (alternative MIME type)
    "application/x-rar-compressed", // .rar files
    "application/x-7z-compressed", // .7z files
  ];

  static async processFile(file: File): Promise<ProcessedFile> {
    const result: ProcessedFile = {
      fileName: file.name,
      fileType: file.type,
      fileSize: file.size,
      metadata: {},
    };

    // Validate file
    const validation = this.validateFile(file);
    if (!validation.valid) {
      result.error = validation.error;
      return result;
    }

    try {
      // Process based on file type
      if (file.type === "application/pdf") {
        await this.processPDF(file, result);
      } else if (file.type.startsWith("image/")) {
        await this.processImage(file, result);
      } else if (file.type.startsWith("video/")) {
        await this.processVideo(file, result);
      } else if (file.type.startsWith("audio/")) {
        await this.processAudio(file, result);
      } else if (file.type.startsWith("text/")) {
        await this.processText(file, result);
      } else if (this.isWordDocument(file.type)) {
        await this.processWordDocument(file, result);
      } else {
        result.metadata = {
          extractedText: "Binary file - content not extractable",
        };
      }

      // Extract common metadata
      this.extractCommonMetadata(result);
    } catch (error) {
      result.error =
        error instanceof Error ? error.message : "Processing failed";
    }

    return result;
  }

  private static async processPDF(
    file: File,
    result: ProcessedFile,
  ): Promise<void> {
    try {
      // Simple PDF text extraction without worker dependencies
      const text = await this.extractPDFTextSimple(file);
      result.content = text;
      result.metadata.extractedText = text;
      result.metadata.pageCount = this.estimatePageCount(text);
    } catch (error) {
      // Fallback: treat as binary file
      result.content = `PDF Document: ${file.name} (${this.formatFileSize(file.size)})`;
      result.metadata.extractedText =
        "PDF processing not available - file stored as evidence";
    }
  }

  private static async extractPDFTextSimple(file: File): Promise<string> {
    const arrayBuffer = await file.arrayBuffer();
    const uint8Array = new Uint8Array(arrayBuffer);

    // Simple text extraction from PDF buffer
    // Look for readable text between PDF markers
    let text = "";
    let inTextObject = false;

    for (let i = 0; i < uint8Array.length - 4; i++) {
      // Look for text objects
      if (uint8Array[i] === 0x42 && uint8Array[i + 1] === 0x54) {
        // "BT" marker
        inTextObject = true;
        continue;
      }
      if (uint8Array[i] === 0x45 && uint8Array[i + 1] === 0x54) {
        // "ET" marker
        inTextObject = false;
        continue;
      }

      // Extract printable ASCII characters
      if (inTextObject && uint8Array[i] >= 32 && uint8Array[i] <= 126) {
        text += String.fromCharCode(uint8Array[i]);
      }
    }

    // Clean up extracted text
    return text
      .replace(/[^\w\s\.\,\!\?\-\(\)]/g, " ")
      .replace(/\s+/g, " ")
      .trim();
  }

  private static async processImage(
    file: File,
    result: ProcessedFile,
  ): Promise<void> {
    return new Promise((resolve) => {
      const img = new Image();
      img.onload = () => {
        result.metadata.dimensions = {
          width: img.width,
          height: img.height,
        };
        result.content = `Image: ${file.name} (${img.width}x${img.height})`;
        resolve();
      };
      img.onerror = () => {
        result.content = `Image: ${file.name}`;
        resolve();
      };
      img.src = URL.createObjectURL(file);
    });
  }

  private static async processVideo(
    file: File,
    result: ProcessedFile,
  ): Promise<void> {
    return new Promise((resolve) => {
      const video = document.createElement("video");
      video.onloadedmetadata = () => {
        result.metadata.duration = video.duration;
        result.metadata.dimensions = {
          width: video.videoWidth,
          height: video.videoHeight,
        };
        result.content = `Video: ${file.name} (${this.formatDuration(video.duration)})`;
        URL.revokeObjectURL(video.src);
        resolve();
      };
      video.onerror = () => {
        result.content = `Video: ${file.name}`;
        resolve();
      };
      video.src = URL.createObjectURL(file);
    });
  }

  private static async processAudio(
    file: File,
    result: ProcessedFile,
  ): Promise<void> {
    return new Promise((resolve) => {
      const audio = document.createElement("audio");
      audio.onloadedmetadata = () => {
        result.metadata.duration = audio.duration;
        result.content = `Audio: ${file.name} (${this.formatDuration(audio.duration)})`;
        URL.revokeObjectURL(audio.src);
        resolve();
      };
      audio.onerror = () => {
        result.content = `Audio: ${file.name}`;
        resolve();
      };
      audio.src = URL.createObjectURL(file);
    });
  }

  private static async processText(
    file: File,
    result: ProcessedFile,
  ): Promise<void> {
    const text = await file.text();
    result.content = text;
    result.metadata.extractedText = text;
  }

  private static isWordDocument(fileType: string): boolean {
    return [
      "application/msword",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      "application/rtf",
      "application/vnd.oasis.opendocument.text",
    ].includes(fileType);
  }

  private static async processWordDocument(
    file: File,
    result: ProcessedFile,
  ): Promise<void> {
    try {
      // For DOC/DOCX files, we'll attempt basic text extraction
      // Note: Full DOC/DOCX parsing would require additional libraries
      // For now, we'll provide a placeholder that encourages TXT format

      if (
        file.type === "application/msword" ||
        file.type ===
          "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
      ) {
        result.content = `Word Document: ${file.name}`;
        result.metadata.extractedText = `📄 Word Document Uploaded: ${file.name}

⚠️ **Note:** For better text extraction, please save your document as a .TXT file and re-upload.

To convert:
1. Open your document in Microsoft Word
2. Go to File → Save As
3. Choose "Plain Text (*.txt)" as the file type
4. Save and upload the .TXT version

This will allow the AI to properly analyze your content and extract meaningful facts for your case.`;

        result.metadata.pageCount = 1; // Placeholder
      } else {
        // For other document types, attempt basic text extraction
        const text = await file.text();
        result.content = text;
        result.metadata.extractedText = text;
      }
    } catch (error) {
      result.content = `Document: ${file.name} (processing error)`;
      result.metadata.extractedText = `Unable to extract text from ${file.name}. Please convert to .TXT format for better processing.`;
    }
  }

  private static extractCommonMetadata(result: ProcessedFile): void {
    if (result.content || result.metadata.extractedText) {
      const text = result.content || result.metadata.extractedText || "";

      // Extract dates
      result.metadata.dates = this.extractDates(text);

      // Extract potential person names
      result.metadata.persons = this.extractPersonNames(text);

      // Extract keywords
      result.metadata.keywords = this.extractKeywords(text);
    }
  }

  private static extractDates(text: string): Date[] {
    const dateRegexes = [
      /\b\d{1,2}\/\d{1,2}\/\d{4}\b/g,
      /\b\d{1,2}-\d{1,2}-\d{4}\b/g,
      /\b\w+\s+\d{1,2},\s+\d{4}\b/g,
    ];

    const dates: Date[] = [];
    dateRegexes.forEach((regex) => {
      const matches = text.match(regex);
      if (matches) {
        matches.forEach((match) => {
          const date = new Date(match);
          if (!isNaN(date.getTime())) {
            dates.push(date);
          }
        });
      }
    });

    return dates.sort((a, b) => a.getTime() - b.getTime());
  }

  private static extractPersonNames(text: string): string[] {
    const nameRegex = /\b[A-Z][a-z]+\s+[A-Z][a-z]+\b/g;
    const matches = text.match(nameRegex) || [];

    const commonWords = [
      "United States",
      "Police Department",
      "District Court",
      "Supreme Court",
    ];

    return matches
      .filter((match) => !commonWords.some((word) => match.includes(word)))
      .slice(0, 10); // Limit to first 10 potential names
  }

  private static extractKeywords(text: string): string[] {
    const legalKeywords = [
      "contract",
      "agreement",
      "violation",
      "breach",
      "damages",
      "plaintiff",
      "defendant",
      "court",
      "judge",
      "jury",
      "evidence",
      "testimony",
      "witness",
      "liability",
      "negligence",
      "fraud",
      "misconduct",
      "settlement",
      "judgment",
      "appeal",
    ];

    const found: string[] = [];
    legalKeywords.forEach((keyword) => {
      if (text.toLowerCase().includes(keyword)) {
        found.push(keyword);
      }
    });

    return found;
  }

  private static estimatePageCount(text: string): number {
    // Rough estimate: 500 characters per page
    return Math.max(1, Math.ceil(text.length / 500));
  }

  private static formatDuration(seconds: number): string {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  }

  private static formatFileSize(bytes: number): string {
    if (bytes === 0) return "0 B";
    const k = 1024;
    const sizes = ["B", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + " " + sizes[i];
  }

  static validateFile(file: File): { valid: boolean; error?: string } {
    if (file.size > this.MAX_FILE_SIZE) {
      return {
        valid: false,
        error: `File size exceeds ${this.MAX_FILE_SIZE / 1024 / 1024}MB limit`,
      };
    }

    if (!this.SUPPORTED_TYPES.includes(file.type)) {
      return {
        valid: false,
        error: `File type ${file.type} not supported. Supported: PDF, TXT, DOC, DOCX, Images, Videos, Audio`,
      };
    }

    return { valid: true };
  }

  static getFileIcon(fileType: string): string {
    if (fileType.includes("pdf")) return "📄";
    if (
      fileType.includes("msword") ||
      fileType.includes("wordprocessingml") ||
      fileType.includes("rtf")
    )
      return "📝";
    if (fileType.includes("text")) return "📄";
    if (fileType.includes("image")) return "🖼️";
    if (fileType.includes("video")) return "🎥";
    if (fileType.includes("audio")) return "🎵";
    return "📎";
  }
}
