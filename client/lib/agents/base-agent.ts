/**
 * LAYER 1: FOUNDATION - Base Agent System
 *
 * Base class for all agents in the multi-agent architecture
 * Enforces case isolation and command hierarchy
 */

import {
  BaseAgent,
  AgentRole,
  CaseId,
  AgentTask,
  TaskStatus,
  MemoryObject,
  MemoryScope,
} from "./types";
import { assertCaseBoundary, caseIsolation } from "../core/case-isolation";

export abstract class Agent implements BaseAgent {
  public readonly id: AgentRole;
  public readonly name: string;
  public readonly description: string;
  public currentCaseId: CaseId | null = null;
  public status: "idle" | "active" | "error" | "blocked" = "idle";
  public lastActivity: Date = new Date();

  private taskQueue: AgentTask[] = [];
  private memory: Map<string, MemoryObject> = new Map();

  constructor(id: AgentRole, name: string, description: string) {
    this.id = id;
    this.name = name;
    this.description = description;

    // Listen for context flush events
    if (typeof window !== "undefined") {
      window.addEventListener("case-context-flush", () => {
        this.flushContext();
      });
    }
  }

  /**
   * Switch agent to new case context
   */
  switchToCase(caseId: CaseId): void {
    if (this.currentCaseId !== caseId) {
      this.flushContext();
      this.currentCaseId = caseId;
      this.lastActivity = new Date();
      console.log(`🔄 ${this.name} switched to case: ${caseId}`);
    }
  }

  /**
   * Enforce case boundary before any operation
   */
  protected assertCaseAccess(caseId: CaseId): void {
    assertCaseBoundary(caseId, this.id);
    if (this.currentCaseId !== caseId) {
      throw new Error(
        `Agent ${this.id} not in correct case context: ${caseId}`,
      );
    }
  }

  /**
   * Add task to agent's queue
   */
  addTask(task: AgentTask): void {
    this.assertCaseAccess(task.caseId);
    this.taskQueue.push(task);
    console.log(`📋 Task added to ${this.name}: ${task.type}`);
  }

  /**
   * Process next task in queue
   */
  async processNextTask(): Promise<AgentTask | null> {
    if (this.taskQueue.length === 0) {
      return null;
    }

    const task = this.taskQueue.shift()!;
    this.status = "active";
    task.status = TaskStatus.IN_PROGRESS;

    try {
      this.assertCaseAccess(task.caseId);
      const result = await this.executeTask(task);

      task.result = result;
      task.status = TaskStatus.COMPLETED;
      task.completedAt = new Date();
      this.lastActivity = new Date();

      console.log(`✅ ${this.name} completed task: ${task.type}`);
      return task;
    } catch (error) {
      task.error = error instanceof Error ? error.message : "Unknown error";
      task.status = TaskStatus.FAILED;
      this.status = "error";

      console.error(`❌ ${this.name} failed task: ${task.type}`, error);
      return task;
    } finally {
      this.status = "idle";
    }
  }

  /**
   * Store memory object with case scoping
   */
  protected storeMemory(
    type: string,
    data: any,
    scope: MemoryScope = MemoryScope.CASE,
    tags?: string[],
  ): void {
    if (!this.currentCaseId) {
      throw new Error("Cannot store memory without active case");
    }

    const memoryObject: MemoryObject = {
      id: crypto.randomUUID(),
      caseId: this.currentCaseId,
      scope,
      type,
      data,
      source: this.id,
      createdAt: new Date(),
      tags,
    };

    this.memory.set(memoryObject.id, memoryObject);
  }

  /**
   * Retrieve memory objects by type and scope
   */
  protected getMemory(type?: string, scope?: MemoryScope): MemoryObject[] {
    return Array.from(this.memory.values()).filter((mem) => {
      if (mem.caseId !== this.currentCaseId) return false;
      if (type && mem.type !== type) return false;
      if (scope && mem.scope !== scope) return false;
      return true;
    });
  }

  /**
   * Flush agent context for case switch
   */
  private flushContext(): void {
    // Clear session and task-scoped memory
    const caseMemory = Array.from(this.memory.values()).filter(
      (mem) =>
        mem.scope === MemoryScope.SESSION || mem.scope === MemoryScope.TASK,
    );

    caseMemory.forEach((mem) => {
      this.memory.delete(mem.id);
    });

    // Clear task queue
    this.taskQueue = [];
    this.status = "idle";
    this.currentCaseId = null;

    console.log(`🧹 ${this.name} context flushed`);
  }

  /**
   * Get agent status for debugging
   */
  getStatus(): {
    id: AgentRole;
    name: string;
    status: string;
    currentCaseId: CaseId | null;
    taskQueueLength: number;
    memoryObjects: number;
    lastActivity: Date;
  } {
    return {
      id: this.id,
      name: this.name,
      status: this.status,
      currentCaseId: this.currentCaseId,
      taskQueueLength: this.taskQueue.length,
      memoryObjects: this.memory.size,
      lastActivity: this.lastActivity,
    };
  }

  /**
   * Abstract method - each agent implements its own task processing
   */
  protected abstract executeTask(task: AgentTask): Promise<any>;

  /**
   * Abstract method - each agent defines its capabilities
   */
  abstract getCapabilities(): string[];
}
