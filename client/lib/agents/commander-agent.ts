/**
 * AGENT 1: THE COMMANDER - "The Strategist"
 *
 * Master coordinator behind the scenes
 * Never talks to user directly
 * Delegates to specialist agents and enforces workflow
 */

import { Agent } from "./base-agent";
import {
  AgentRole,
  AgentTask,
  TaskStatus,
  CaseId,
  LegalCitation,
} from "./types";

interface TaskChain {
  id: string;
  caseId: CaseId;
  type: string;
  steps: AgentTask[];
  currentStep: number;
  status: TaskStatus;
  result?: any;
}

export class CommanderAgent extends Agent {
  private taskChains: Map<string, TaskChain> = new Map();
  private agentRegistry: Map<AgentRole, Agent> = new Map();

  constructor() {
    super(
      AgentRole.COMMANDER,
      "Commander (The Strategist)",
      "Master coordinator. Routes tasks, enforces memory limits and timing. Never speaks to user.",
    );
  }

  /**
   * Register specialist agent with Commander
   */
  registerAgent(agent: Agent): void {
    this.agentRegistry.set(agent.id, agent);
    console.log(`📋 Commander registered agent: ${agent.name}`);
  }

  /**
   * Dispatch task to appropriate agent
   */
  async dispatch(
    to: AgentRole,
    caseId: CaseId,
    taskType: string,
    payload: any,
  ): Promise<string> {
    this.assertCaseAccess(caseId);

    const task: AgentTask = {
      id: crypto.randomUUID(),
      from: AgentRole.COMMANDER,
      to,
      caseId,
      type: taskType,
      payload,
      status: TaskStatus.PENDING,
      createdAt: new Date(),
    };

    const targetAgent = this.agentRegistry.get(to);
    if (!targetAgent) {
      throw new Error(`Agent not found: ${to}`);
    }

    // Ensure target agent is in correct case context
    targetAgent.switchToCase(caseId);

    // Add task to agent's queue
    targetAgent.addTask(task);

    console.log(`📤 Commander dispatched ${taskType} to ${targetAgent.name}`);
    return task.id;
  }

  /**
   * Create complex task chain for multi-agent workflows
   */
  async createTaskChain(
    caseId: CaseId,
    chainType: string,
    payload: any,
  ): Promise<string> {
    this.assertCaseAccess(caseId);

    const chainId = crypto.randomUUID();
    let steps: AgentTask[] = [];

    // Define task chains based on type
    switch (chainType) {
      case "research_legal_standard":
        steps = await this.buildResearchChain(caseId, payload);
        break;

      case "build_timeline":
        steps = await this.buildTimelineChain(caseId, payload);
        break;

      case "draft_complaint":
        steps = await this.buildDraftingChain(caseId, payload);
        break;

      case "evidence_analysis":
        steps = await this.buildEvidenceChain(caseId, payload);
        break;

      default:
        throw new Error(`Unknown task chain type: ${chainType}`);
    }

    const taskChain: TaskChain = {
      id: chainId,
      caseId,
      type: chainType,
      steps,
      currentStep: 0,
      status: TaskStatus.PENDING,
    };

    this.taskChains.set(chainId, taskChain);
    this.storeMemory("task_chain", taskChain);

    // Start executing the chain
    await this.executeNextChainStep(chainId);

    console.log(`🔗 Commander created task chain: ${chainType}`);
    return chainId;
  }

  /**
   * Build research task chain
   */
  private async buildResearchChain(
    caseId: CaseId,
    payload: any,
  ): Promise<AgentTask[]> {
    return [
      {
        id: crypto.randomUUID(),
        from: AgentRole.COMMANDER,
        to: AgentRole.RESEARCH,
        caseId,
        type: "legal_research",
        payload: {
          triggers: payload.triggers,
          jurisdiction: "federal_texas",
        },
        status: TaskStatus.PENDING,
        createdAt: new Date(),
      },
    ];
  }

  /**
   * Build timeline task chain
   */
  private async buildTimelineChain(
    caseId: CaseId,
    payload: any,
  ): Promise<AgentTask[]> {
    return [
      {
        id: crypto.randomUUID(),
        from: AgentRole.COMMANDER,
        to: AgentRole.TIMELINE,
        caseId,
        type: "extract_events",
        payload: { userInput: payload.userInput },
        status: TaskStatus.PENDING,
        createdAt: new Date(),
      },
      {
        id: crypto.randomUUID(),
        from: AgentRole.COMMANDER,
        to: AgentRole.ENTITY,
        caseId,
        type: "extract_entities",
        payload: { userInput: payload.userInput },
        status: TaskStatus.PENDING,
        createdAt: new Date(),
      },
    ];
  }

  /**
   * Build drafting task chain
   */
  private async buildDraftingChain(
    caseId: CaseId,
    payload: any,
  ): Promise<AgentTask[]> {
    return [
      {
        id: crypto.randomUUID(),
        from: AgentRole.COMMANDER,
        to: AgentRole.RESEARCH,
        caseId,
        type: "verify_legal_elements",
        payload,
        status: TaskStatus.PENDING,
        createdAt: new Date(),
      },
      {
        id: crypto.randomUUID(),
        from: AgentRole.COMMANDER,
        to: AgentRole.DRAFTING,
        caseId,
        type: "generate_complaint",
        payload,
        status: TaskStatus.PENDING,
        createdAt: new Date(),
      },
    ];
  }

  /**
   * Build evidence analysis chain
   */
  private async buildEvidenceChain(
    caseId: CaseId,
    payload: any,
  ): Promise<AgentTask[]> {
    return [
      {
        id: crypto.randomUUID(),
        from: AgentRole.COMMANDER,
        to: AgentRole.EVIDENCE,
        caseId,
        type: "process_upload",
        payload,
        status: TaskStatus.PENDING,
        createdAt: new Date(),
      },
      {
        id: crypto.randomUUID(),
        from: AgentRole.COMMANDER,
        to: AgentRole.TIMELINE,
        caseId,
        type: "link_to_timeline",
        payload,
        status: TaskStatus.PENDING,
        createdAt: new Date(),
      },
    ];
  }

  /**
   * Execute next step in task chain
   */
  private async executeNextChainStep(chainId: string): Promise<void> {
    const chain = this.taskChains.get(chainId);
    if (!chain || chain.currentStep >= chain.steps.length) {
      return;
    }

    const currentTask = chain.steps[chain.currentStep];
    const targetAgent = this.agentRegistry.get(currentTask.to);

    if (!targetAgent) {
      chain.status = TaskStatus.FAILED;
      return;
    }

    try {
      // Ensure agent is in correct case context
      targetAgent.switchToCase(chain.caseId);

      // Add task and wait for completion
      targetAgent.addTask(currentTask);
      const result = await targetAgent.processNextTask();

      if (result?.status === TaskStatus.COMPLETED) {
        chain.currentStep++;

        // Continue to next step if available
        if (chain.currentStep < chain.steps.length) {
          await this.executeNextChainStep(chainId);
        } else {
          chain.status = TaskStatus.COMPLETED;
          console.log(`✅ Commander completed task chain: ${chain.type}`);
        }
      } else {
        chain.status = TaskStatus.FAILED;
        console.error(`❌ Task chain failed at step ${chain.currentStep}`);
      }
    } catch (error) {
      chain.status = TaskStatus.FAILED;
      console.error(`❌ Task chain execution error:`, error);
    }
  }

  /**
   * Approve citation for use in drafting
   */
  async approveCitation(
    caseId: CaseId,
    citationId: string,
    approved: boolean,
  ): Promise<void> {
    this.assertCaseAccess(caseId);

    this.storeMemory("citation_approval", {
      citationId,
      approved,
      approvedBy: AgentRole.COMMANDER,
      approvedAt: new Date(),
    });

    console.log(
      `${approved ? "✅" : "❌"} Commander ${approved ? "approved" : "rejected"} citation: ${citationId}`,
    );
  }

  /**
   * Get task chain status
   */
  getTaskChainStatus(chainId: string): TaskChain | null {
    return this.taskChains.get(chainId) || null;
  }

  /**
   * List all active task chains for current case
   */
  getActiveTaskChains(): TaskChain[] {
    return Array.from(this.taskChains.values()).filter(
      (chain) =>
        chain.caseId === this.currentCaseId &&
        chain.status === TaskStatus.IN_PROGRESS,
    );
  }

  /**
   * Get all registered agents status
   */
  getAgentStatuses(): Record<string, any> {
    const statuses: Record<string, any> = {};

    for (const [role, agent] of this.agentRegistry) {
      statuses[role] = agent.getStatus();
    }

    return statuses;
  }

  /**
   * Task execution - Commander processes coordination tasks
   */
  protected async executeTask(task: AgentTask): Promise<any> {
    switch (task.type) {
      case "research_legal_standard":
        return await this.createTaskChain(
          task.caseId,
          "research_legal_standard",
          task.payload,
        );

      case "build_timeline":
        return await this.createTaskChain(
          task.caseId,
          "build_timeline",
          task.payload,
        );

      case "draft_complaint":
        return await this.createTaskChain(
          task.caseId,
          "draft_complaint",
          task.payload,
        );

      default:
        throw new Error(`Unknown Commander task type: ${task.type}`);
    }
  }

  /**
   * Commander capabilities
   */
  getCapabilities(): string[] {
    return [
      "Task coordination",
      "Agent management",
      "Workflow orchestration",
      "Citation approval",
      "Memory scope enforcement",
      "Task chain management",
    ];
  }
}
