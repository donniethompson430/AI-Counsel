// Global notification system for cross-component communication
type NotificationEvent =
  | "verification-requested"
  | "file-uploaded"
  | "case-updated";

interface NotificationData {
  caseId: string;
  type: NotificationEvent;
  payload?: any;
}

class NotificationManager {
  private static instance: NotificationManager;
  private listeners: Map<
    NotificationEvent,
    ((data: NotificationData) => void)[]
  > = new Map();

  static getInstance(): NotificationManager {
    if (!NotificationManager.instance) {
      NotificationManager.instance = new NotificationManager();
    }
    return NotificationManager.instance;
  }

  subscribe(
    event: NotificationEvent,
    callback: (data: NotificationData) => void,
  ): () => void {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, []);
    }

    this.listeners.get(event)!.push(callback);

    // Return unsubscribe function
    return () => {
      const callbacks = this.listeners.get(event);
      if (callbacks) {
        const index = callbacks.indexOf(callback);
        if (index > -1) {
          callbacks.splice(index, 1);
        }
      }
    };
  }

  emit(event: NotificationEvent, data: NotificationData): void {
    const callbacks = this.listeners.get(event);
    if (callbacks) {
      callbacks.forEach((callback) => callback(data));
    }
  }

  // Convenience methods
  requestVerification(caseId: string): void {
    this.emit("verification-requested", {
      caseId,
      type: "verification-requested",
    });
  }

  notifyFileUploaded(caseId: string, fileName: string): void {
    this.emit("file-uploaded", {
      caseId,
      type: "file-uploaded",
      payload: { fileName },
    });
  }

  notifyCaseUpdated(caseId: string): void {
    this.emit("case-updated", { caseId, type: "case-updated" });
  }
}

export const notifications = NotificationManager.getInstance();
