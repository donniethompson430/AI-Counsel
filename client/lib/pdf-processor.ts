// PDF Processing Utilities using PDF.js
import * as pdfjsLib from "pdfjs-dist";

// Set worker to use a data URL to avoid network issues
pdfjsLib.GlobalWorkerOptions.workerSrc =
  "data:application/javascript;base64," +
  btoa(`
  importScripts('https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js');
`);

// Fallback: disable worker entirely if above fails
if (!pdfjsLib.GlobalWorkerOptions.workerSrc) {
  pdfjsLib.GlobalWorkerOptions.workerSrc = false;
}

export interface ProcessedDocument {
  fileName: string;
  pageCount: number;
  text: string;
  metadata?: any;
}

export class PDFProcessor {
  static async extractTextFromFile(file: File): Promise<ProcessedDocument> {
    try {
      const arrayBuffer = await file.arrayBuffer();
      const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;

      let fullText = "";
      const pageCount = pdf.numPages;

      // Extract text from each page
      for (let pageNum = 1; pageNum <= pageCount; pageNum++) {
        const page = await pdf.getPage(pageNum);
        const textContent = await page.getTextContent();

        const pageText = textContent.items
          .map((item: any) => item.str)
          .join(" ");

        fullText += `\n--- Page ${pageNum} ---\n${pageText}\n`;
      }

      return {
        fileName: file.name,
        pageCount,
        text: fullText.trim(),
        metadata: await pdf.getMetadata(),
      };
    } catch (error) {
      console.error("PDF processing error:", error);
      throw new Error(
        `Failed to process PDF: ${error instanceof Error ? error.message : "Unknown error"}`,
      );
    }
  }

  static async extractTextFromUrl(url: string): Promise<ProcessedDocument> {
    try {
      const pdf = await pdfjsLib.getDocument(url).promise;

      let fullText = "";
      const pageCount = pdf.numPages;

      for (let pageNum = 1; pageNum <= pageCount; pageNum++) {
        const page = await pdf.getPage(pageNum);
        const textContent = await page.getTextContent();

        const pageText = textContent.items
          .map((item: any) => item.str)
          .join(" ");

        fullText += `\n--- Page ${pageNum} ---\n${pageText}\n`;
      }

      return {
        fileName: "document.pdf",
        pageCount,
        text: fullText.trim(),
        metadata: await pdf.getMetadata(),
      };
    } catch (error) {
      console.error("PDF processing error:", error);
      throw new Error(
        `Failed to process PDF from URL: ${error instanceof Error ? error.message : "Unknown error"}`,
      );
    }
  }

  static searchTextForKeywords(
    text: string,
    keywords: string[],
  ): Array<{ keyword: string; matches: string[]; count: number }> {
    const results: Array<{
      keyword: string;
      matches: string[];
      count: number;
    }> = [];

    keywords.forEach((keyword) => {
      const regex = new RegExp(`\\b${keyword}\\b`, "gi");
      const matches = text.match(regex) || [];

      if (matches.length > 0) {
        results.push({
          keyword,
          matches,
          count: matches.length,
        });
      }
    });

    return results;
  }

  static extractDatesFromText(text: string): Date[] {
    const dateRegexes = [
      /\b\d{1,2}\/\d{1,2}\/\d{4}\b/g, // MM/DD/YYYY
      /\b\d{1,2}-\d{1,2}-\d{4}\b/g, // MM-DD-YYYY
      /\b\w+\s+\d{1,2},\s+\d{4}\b/g, // Month DD, YYYY
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

  static extractPersonNames(text: string): string[] {
    // Simple name extraction - look for capitalized words that might be names
    const nameRegex = /\b[A-Z][a-z]+\s+[A-Z][a-z]+\b/g;
    const matches = text.match(nameRegex) || [];

    // Filter out common non-name patterns
    const commonWords = [
      "United States",
      "Police Department",
      "District Court",
      "Supreme Court",
    ];

    return matches.filter(
      (match) => !commonWords.some((word) => match.includes(word)),
    );
  }

  static extractOfficerInfo(
    text: string,
  ): Array<{ name?: string; badge?: string; department?: string }> {
    const officers: Array<{
      name?: string;
      badge?: string;
      department?: string;
    }> = [];

    // Look for officer names and badge numbers
    const officerRegex = /Officer\s+([A-Z][a-z]+(?:\s+[A-Z][a-z]+)?)/gi;
    const badgeRegex = /(?:Badge|ID)(?:\s*#|\s*Number)?\s*:?\s*(\d+)/gi;

    let match;
    while ((match = officerRegex.exec(text)) !== null) {
      officers.push({ name: match[1] });
    }

    while ((match = badgeRegex.exec(text)) !== null) {
      // Try to associate badge numbers with officers if possible
      if (officers.length > 0) {
        officers[officers.length - 1].badge = match[1];
      } else {
        officers.push({ badge: match[1] });
      }
    }

    return officers;
  }
}

// File validation utilities
export class FileValidator {
  static readonly MAX_FILE_SIZE = 50 * 1024 * 1024; // 50MB
  static readonly ALLOWED_TYPES = [
    "application/pdf",
    "image/jpeg",
    "image/png",
    "image/gif",
    "video/mp4",
    "video/quicktime",
    "audio/mpeg",
    "audio/wav",
  ];

  static validateFile(file: File): { valid: boolean; error?: string } {
    if (file.size > this.MAX_FILE_SIZE) {
      return {
        valid: false,
        error: `File size exceeds ${this.MAX_FILE_SIZE / 1024 / 1024}MB limit`,
      };
    }

    if (!this.ALLOWED_TYPES.includes(file.type)) {
      return {
        valid: false,
        error: `File type ${file.type} not supported`,
      };
    }

    return { valid: true };
  }

  static getFileIcon(fileType: string): string {
    if (fileType.includes("pdf")) return "📄";
    if (fileType.includes("image")) return "🖼️";
    if (fileType.includes("video")) return "🎥";
    if (fileType.includes("audio")) return "🎵";
    return "📎";
  }
}
