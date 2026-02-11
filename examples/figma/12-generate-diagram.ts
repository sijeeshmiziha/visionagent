/**
 * Figma Example: generate_diagram
 *
 * Generates a diagram from Mermaid.js syntax. This is a local-only tool
 * that produces the Mermaid source. To create an interactive FigJam diagram,
 * use the Figma MCP server's generate_diagram tool with this syntax.
 *
 * Supported types: flowchart, sequenceDiagram, stateDiagram, gantt.
 *
 * Run:  npm run example -- examples/figma/12-generate-diagram.ts
 *
 * Does NOT require FIGMA_API_KEY (local-only operation).
 */

import { executeTool } from '../../src/index';
import { figmaGenerateDiagramTool } from '../../src/modules/figma';

async function main() {
  console.log('=== figma_generate_diagram ===\n');

  // --- Example 1: Flowchart ---
  console.log('1) Flowchart\n');

  const flowchart = await executeTool(figmaGenerateDiagramTool, {
    name: 'User Authentication Flow',
    mermaidSyntax: `graph LR
  A["Start"] --> B["Enter Credentials"]
  B --> C{"Valid?"}
  C -->|"Yes"| D["Dashboard"]
  C -->|"No"| E["Show Error"]
  E --> B`,
  });

  if (flowchart.success) {
    const out = flowchart.output as { name: string; diagram: string; message: string };
    console.log(`  Name   : ${out.name}`);
    console.log(`  Diagram:\n${out.diagram}`);
    console.log(`  Note   : ${out.message}\n`);
  }

  // --- Example 2: Sequence diagram ---
  console.log('2) Sequence Diagram\n');

  const sequence = await executeTool(figmaGenerateDiagramTool, {
    name: 'API Request Sequence',
    mermaidSyntax: `sequenceDiagram
  participant Client
  participant API
  participant DB
  Client->>API: POST /login
  API->>DB: Query user
  DB-->>API: User record
  API-->>Client: JWT token`,
  });

  if (sequence.success) {
    const out = sequence.output as { name: string; diagram: string };
    console.log(`  Name   : ${out.name}`);
    console.log(`  Diagram:\n${out.diagram}\n`);
  }

  // --- Example 3: Gantt chart ---
  console.log('3) Gantt Chart\n');

  const gantt = await executeTool(figmaGenerateDiagramTool, {
    name: 'Sprint Timeline',
    mermaidSyntax: `gantt
  title Sprint 1 Timeline
  dateFormat YYYY-MM-DD
  section Design
  Wireframes       :a1, 2026-02-10, 3d
  Mockups          :a2, after a1, 2d
  section Development
  Frontend         :b1, after a2, 5d
  Backend          :b2, after a2, 4d
  section QA
  Testing          :c1, after b1, 3d`,
  });

  if (gantt.success) {
    const out = gantt.output as { name: string; diagram: string };
    console.log(`  Name   : ${out.name}`);
    console.log(`  Diagram:\n${out.diagram}`);
  }
}

main().catch(console.error);
