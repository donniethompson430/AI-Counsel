# Constitutional Weapon System - Agent Architecture

## Overview

This is the **Layer 1: Foundation** of our multi-agent constitutional weapon system for pro se warriors. The system enforces military-grade security protocols while maintaining educational boundaries that prevent unauthorized practice of law (UPL).

## Architecture Principles

### 1. Agent Hierarchy

- **Handler (Agent 0)**: The only user-facing agent. Educational firewall enforced.
- **Commander (Agent 1)**: Master coordinator. Routes tasks, never speaks to user.
- **Specialists (Agents 2-9)**: Evidence, Research, Drafting, Timeline, etc. (Coming in Phase II)

### 2. Case Isolation Protocol

- **Absolute Rule**: NO CASE BLEEDING. EVER.
- Each case gets unique immutable ID: `AIC-YYYYMMDD-HHMM-XXXX`
- Complete memory flush on case switch
- Breach detection with immediate system halt

### 3. UPL Firewall

- Handler **educates** but **never advises**
- Prohibited phrases automatically detected and corrected
- Educational templates based on personality
- Constitutional firewall between education and legal advice

## Key Components

### Case Isolation System (`case-isolation.ts`)

```typescript
// Generate case ID
const caseId = caseIsolation.generateCaseId(); // AIC-20250101-1430-X4B2

// Enforce boundaries
assertCaseBoundary(caseId, agentId); // Throws error if violated
```

### UPL Firewall (`upl-firewall.ts`)

```typescript
// Check for violations
const check = uplFirewall.checkUPLViolation(message);
if (check.violatesUPL) {
  // Auto-correct to educational language
}
```

### Agent System (`agent-system.ts`)

```typescript
// Main user interaction
const response = await agentSystem.sendMessage(message, caseId);

// Only Handler responds to user
// Commander coordinates background tasks
```

## Handler Personalities

1. **Strategist**: Professional & Supportive
2. **Guide**: Direct & Confident
3. **Razor**: No BS & Aggressive
4. **Ally**: Balanced Approach

All personalities maintain strict educational boundaries.

## Memory Scopes

- **Session**: Wiped when user exits case
- **Case**: Persistent within case ID
- **Task**: Wiped after task handoff

## Breach Detection

The system immediately halts and reports:

- Cross-case data access attempts
- UPL firewall violations
- Agent hierarchy violations
- Memory scope violations

## Usage Example

```typescript
// Initialize system
await agentSystem.initialize();

// Create case
const caseId = await agentSystem.createCase("Constitutional Rights Case");

// Set personality
agentSystem.setHandlerPersona(HandlerPersona.RAZOR);

// Send message (only goes to Handler)
const response = await agentSystem.sendMessage(
  "The officer used excessive force during my arrest",
  caseId,
);

// Handler provides educational response
// Background agents coordinate automatically
```

## Testing the System

Visit `/agent-system` to see the live demo with:

- Real-time agent status
- Case isolation monitoring
- UPL firewall enforcement
- Educational response examples

## Next Phase: Specialist Agents

Phase II will add:

- **Research Agent**: Legal citation verification
- **Evidence Agent**: Document processing
- **Drafting Agent**: Court document generation
- **Timeline Agent**: Event sequencing
- **Entity Agent**: People & organization tracking

Each agent will integrate with this foundation while maintaining strict boundaries and case isolation.

## Development Rules

1. **Never bypass case isolation**: Always use `assertCaseBoundary()`
2. **Handler-only user interaction**: No direct agent-to-user communication
3. **Educational firewall**: All responses through UPL filter
4. **Memory scoping**: Always specify scope when storing data
5. **Task delegation**: All coordination through Commander

This foundation ensures that no matter how complex the system becomes, it remains constitutionally sound and legally protected.
