/**
 * Figma Example: generate_diagram
 *
 * Generate a flowchart, sequence diagram, or Gantt chart in FigJam from Mermaid syntax.
 *
 * Setup:
 *   npm install visionagent
 *
 * Run (with custom name/syntax via env):
 *   export FIGMA_DIAGRAM_NAME="My Flow"
 *   export FIGMA_MERMAID_SYNTAX="graph LR ..."
 *   npx tsx 12-generate-diagram.ts
 *
 * Run (demo with built-in examples):
 *   npx tsx 12-generate-diagram.ts
 */
import { executeTool, figmaGenerateDiagramTool } from 'visionagent';

async function main() {
  console.log('=== figma_generate_diagram ===\n');

  const name = process.env.FIGMA_DIAGRAM_NAME;
  const mermaidSyntax = process.env.FIGMA_MERMAID_SYNTAX;

  if (name && mermaidSyntax) {
    const result = await executeTool(figmaGenerateDiagramTool, {
      name,
      mermaidSyntax,
    });
    if (result.success) {
      const out = result.output as {
        name: string;
        diagram: string;
        message?: string;
      };
      console.log(`Name   : ${out.name}`);
      console.log(`Diagram:\n${out.diagram}`);
      if (out.message) console.log(`Note   : ${out.message}`);
    } else {
      console.error('Error:', result.error);
    }
    return;
  }

  // Demo with inline defaults when no env/params
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
    const out = flowchart.output as {
      name: string;
      diagram: string;
      message: string;
    };
    console.log(`  Name   : ${out.name}`);
    console.log(`  Diagram:\n${out.diagram}`);
    console.log(`  Note   : ${out.message}\n`);
  }

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
