/**
 * Init Command - Initialize a new PromptFlow project
 */

import { Command } from 'commander';
import chalk from 'chalk';
import ora from 'ora';
import fs from 'fs-extra';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

interface InitOptions {
  template?: string;
  yes?: boolean;
}

export async function runInit(projectName?: string, options: InitOptions = {}) {
  const name = projectName || 'my-promptflow';
  const template = options.template || 'basic';
  const targetDir = path.resolve(process.cwd(), name);

  const spinner = ora(`Creating PromptFlow project: ${name}`).start();

  try {
    // Check if directory exists
    if (fs.existsSync(targetDir)) {
      const files = fs.readdirSync(targetDir);
      if (files.length > 0) {
        spinner.fail();
        console.error(chalk.red(`Directory '${name}' already exists and is not empty.`));
        process.exit(1);
      }
    }

    // Create directory
    await fs.ensureDir(targetDir);

    // Create project structure based on template
    await createProjectStructure(targetDir, template);

    // Create package.json
    await createPackageJson(targetDir, name);

    // Create README
    await createReadme(targetDir, name);

    // Create .env.example
    await createEnvExample(targetDir);

    spinner.succeed(chalk.green(`Project '${name}' created successfully!`));
    
    console.log('\nNext steps:');
    console.log(chalk.cyan(`  cd ${name}`));
    console.log(chalk.cyan('  pnpm install'));
    console.log(chalk.cyan('  cp .env.example .env  # Then edit with your API keys'));
    console.log(chalk.cyan('  pf run workflows/example.yaml'));
    
  } catch (error) {
    spinner.fail();
    console.error(chalk.red('Failed to create project:'), error);
    process.exit(1);
  }
}

async function createProjectStructure(root: string, template: string) {
  const directories = [
    'workflows',
    'prompts',
    'src',
    'tests',
    'examples'
  ];

  for (const dir of directories) {
    await fs.ensureDir(path.join(root, dir));
  }

  // Create example workflow based on template
  const workflowContent = getTemplateWorkflow(template);
  await fs.writeFile(
    path.join(root, 'workflows', 'example.yaml'),
    workflowContent,
    'utf-8'
  );

  // Create .gitignore
  const gitignore = `# Dependencies
node_modules

# Build
dist
build

# Environment
.env
.env.local

# Logs
*.log

# OS
.DS_Store
Thumbs.db

# PromptFlow
.pf-cache/
`;
  await fs.writeFile(path.join(root, '.gitignore'), gitignore);
}

function getTemplateWorkflow(template: string): string {
  if (template === 'advanced') {
    return `id: advanced-workflow
name: Advanced Multi-Step Workflow
description: A complex workflow with multiple nodes and branching
version: "1.0.0"

variables:
  topic: "AI Safety"
  tone: "professional"

nodes:
  - id: research
    name: Research Topic
    description: Gather information about the topic
    model:
      provider: openai
      model: gpt-4-turbo-preview
      temperature: 0.7
    systemPrompt: |
      You are a research assistant. Provide accurate, well-researched information.
    userPrompt: |
      Research the following topic: {{topic}}
      
      Provide key points, current trends, and important considerations.
    variables:
      - topic
    cacheConfig:
      enabled: true
      ttl: 3600

  - id: outline
    name: Create Outline
    description: Create a structured outline
    model:
      provider: anthropic
      model: claude-3-sonnet-20240229
      temperature: 0.5
    systemPrompt: |
      You are an expert content strategist.
    userPrompt: |
      Based on this research:
      {{research}}
      
      Create a detailed outline for a {{tone}} article.
    retryConfig:
      maxAttempts: 3
      minTimeout: 1000
      maxTimeout: 5000
      factor: 2

  - id: draft
    name: Write Draft
    description: Write the full content
    model:
      provider: openai
      model: gpt-4-turbo-preview
      temperature: 0.8
    userPrompt: |
      Using this outline:
      {{outline}}
      
      Write a comprehensive article.

edges:
  - id: e1
    source: research
    target: outline
  - id: e2
    source: outline
    target: draft

metadata:
  author: PromptFlow
  tags:
    - research
    - content
    - multi-step
`;
  }

  if (template === 'agent') {
    return `id: agent-workflow
name: AI Agent Workflow
description: An autonomous agent with tool use capabilities
version: "1.0.0"

variables:
  task: "Analyze the sentiment of recent product reviews"

nodes:
  - id: planner
    name: Task Planner
    description: Break down the task into steps
    model:
      provider: anthropic
      model: claude-3-sonnet-20240229
      temperature: 0.3
    systemPrompt: |
      You are a task planner. Break down complex tasks into clear, actionable steps.
    userPrompt: |
      Task: {{task}}
      
      Break this down into 3-5 clear steps.
    variables:
      - task

  - id: executor
    name: Execute Steps
    description: Execute each step of the plan
    model:
      provider: openai
      model: gpt-4-turbo-preview
      temperature: 0.5
    userPrompt: |
      Plan:
      {{planner}}
      
      Execute step 1 and provide detailed results.

  - id: reviewer
    name: Review Results
    description: Review and validate the output
    model:
      provider: anthropic
      model: claude-3-sonnet-20240229
      temperature: 0.2
    userPrompt: |
      Original Task: {{task}}
      Results: {{executor}}
      
      Review the results for quality and completeness.
      Suggest any improvements or additional steps needed.

edges:
  - id: e1
    source: planner
    target: executor
  - id: e2
    source: executor
    target: reviewer

metadata:
  author: PromptFlow
  tags:
    - agent
    - autonomous
    - planning
`;
  }

  // Basic template (default)
  return `id: basic-workflow
name: Basic Prompt Workflow
description: A simple single-node workflow example
version: "1.0.0"

variables:
  topic: "artificial intelligence"

nodes:
  - id: generate
    name: Generate Content
    description: Generate content about a topic
    model:
      provider: openai
      model: gpt-4-turbo-preview
      temperature: 0.7
      maxTokens: 1000
    systemPrompt: |
      You are a helpful assistant that creates clear, informative content.
    userPrompt: |
      Write a brief explanation about {{topic}}.
      
      Include:
      - What it is
      - How it works
      - Why it matters
    variables:
      - topic
    cacheConfig:
      enabled: true
      ttl: 3600

edges: []

metadata:
  author: PromptFlow
  tags:
    - example
    - basic
`;
}

async function createPackageJson(root: string, name: string) {
  const packageJson = {
    name,
    version: '1.0.0',
    description: 'A PromptFlow project',
    type: 'module',
    scripts: {
      'workflow:run': 'pf run workflows/example.yaml',
      'workflow:validate': 'pf validate workflows/example.yaml'
    },
    dependencies: {
      '@promptflow/core': 'latest'
    },
    devDependencies: {
      '@promptflow/cli': 'latest'
    }
  };

  await fs.writeFile(
    path.join(root, 'package.json'),
    JSON.stringify(packageJson, null, 2),
    'utf-8'
  );
}

async function createReadme(root: string, name: string) {
  const readme = `# ${name}

A PromptFlow project for building LLM-powered workflows.

## Getting Started

### Prerequisites

- Node.js >= 20.0.0
- pnpm >= 9.0.0
- API keys for your chosen LLM providers

### Installation

\`\`\`bash
pnpm install
\`\`\`

### Configuration

Copy \`.env.example\` to \`.env\` and add your API keys:

\`\`\`bash
cp .env.example .env
\`\`\`

### Running Workflows

\`\`\`bash
# Run the example workflow
pnpm workflow:run

# Or use the CLI directly
pf run workflows/example.yaml

# Validate a workflow
pf validate workflows/example.yaml
\`\`\`

## Project Structure

\`\`\`
${name}/
├── workflows/      # Workflow definitions (YAML/JSON)
├── prompts/        # Reusable prompt templates
├── src/            # Custom code and utilities
├── tests/          # Workflow tests
└── examples/       # Example workflows
\`\`\`

## Learn More

- [PromptFlow Documentation](https://github.com/promptflow/promptflow)
- [Workflow Syntax](https://github.com/promptflow/promptflow/docs/workflow-syntax)
- [Examples](https://github.com/promptflow/promptflow/tree/main/examples)
`;

  await fs.writeFile(path.join(root, 'README.md'), readme, 'utf-8');
}

async function createEnvExample(root: string) {
  const envExample = `# PromptFlow Environment Variables

# OpenAI API Key (https://platform.openai.com/api-keys)
OPENAI_API_KEY=sk-...

# Anthropic API Key (https://console.anthropic.com/settings/keys)
ANTHROPIC_API_KEY=sk-ant-...

# Optional: Custom base URLs for self-hosted models
# OPENAI_BASE_URL=http://localhost:11434/v1
# ANTHROPIC_BASE_URL=http://localhost:8080
`;

  await fs.writeFile(path.join(root, '.env.example'), envExample);
}
