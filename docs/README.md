# 📘 PromptFlow Documentation

Welcome to the complete PromptFlow documentation! This guide will help you understand everything from basic concepts to advanced usage.

---

## 📖 Table of Contents

- [What is PromptFlow?](#what-is-promptflow)
- [Why Use PromptFlow?](#why-use-promptflow)
- [Core Concepts](#core-concepts)
- [How It Works](#how-it-works)
- [Installation Guide](#installation-guide)
- [Creating Your First Workflow](#creating-your-first-workflow)
- [Workflow Syntax Reference](#workflow-syntax-reference)
- [Advanced Features](#advanced-features)
- [Real-World Use Cases](#real-world-use-cases)
- [API Reference](#api-reference)
- [Troubleshooting](#troubleshooting)
- [FAQ](#faq)

---

## 🤔 What is PromptFlow?

**PromptFlow** is a visual tool for building and running complex AI workflows. Think of it as a "workflow builder" for ChatGPT and other AI models.

### The Problem It Solves

Imagine you want to:
1. Research a topic using AI
2. Create an outline from that research
3. Write a full article from the outline
4. Review and edit the article

Without PromptFlow, you'd need to:
- Copy-paste between multiple ChatGPT conversations
- Manually save and organize outputs
- Keep track of context yourself
- Handle errors and retries manually

**With PromptFlow**, you create a visual workflow that automates all of this!

### Simple Analogy

If AI models are like **individual workers** (each good at specific tasks), then PromptFlow is like a **factory assembly line** that coordinates multiple workers to build a complete product.

---

## 🎯 Why Use PromptFlow?

### Before PromptFlow

```
Developer: "I need to build a content generation pipeline..."

❌ Manual Process:
1. Open ChatGPT → Research topic → Copy result
2. Open new chat → Create outline → Paste research → Copy result
3. Open new chat → Write draft → Paste outline → Copy result
4. Open new chat → Review → Paste draft → Get feedback
5. Repeat for every piece of content... 😓
```

### After PromptFlow

```yaml
# One workflow file does it all!
research → outline → draft → review ✅

# Run with one command:
pf run my-workflow.yaml -v topic="AI Safety"
```

### Benefits

| Benefit | Description |
|---------|-------------|
| 💰 **Save Money** | Caching reduces API calls by up to 70% |
| ⚡ **Save Time** | Automate repetitive prompt chains |
| 🔄 **Consistency** | Same workflow = same quality every time |
| 📊 **Reliability** | Auto-retry on failures |
| 🎨 **Visual** | See your workflow as a diagram |
| 🔌 **Flexible** | Switch between AI providers easily |

---

## 🧠 Core Concepts

### 1. **Workflow**

A workflow is a series of AI tasks connected together.

```
┌─────────────┐     ┌─────────────┐     ┌─────────────┐
│   Node 1    │ ──→ │   Node 2    │ ──→ │   Node 3    │
│  (Research) │     │  (Outline)  │     │   (Draft)   │
└─────────────┘     └─────────────┘     └─────────────┘
```

### 2. **Node**

A node is a single AI task with:
- **Prompt**: What to ask the AI
- **Model**: Which AI to use (GPT-4, Claude, etc.)
- **Variables**: Dynamic inputs

```yaml
nodes:
  - id: research
    name: Research Topic
    model:
      provider: openai
      model: gpt-4
    userPrompt: "Research {{topic}}"
```

### 3. **Edge**

An edge connects two nodes, defining execution order.

```yaml
edges:
  - source: research
    target: outline  # outline runs after research completes
```

### 4. **Variable**

Variables are placeholders you fill when running the workflow.

```yaml
variables:
  topic: "Climate Change"  # ← You provide this
  
userPrompt: "Research {{topic}}"  # ← Used here
```

### 5. **Provider**

A provider is an AI service (like OpenAI or Anthropic).

```yaml
model:
  provider: openai      # ← Which company's AI
  model: gpt-4-turbo    # ← Which specific model
```

---

## ⚙️ How It Works

### Architecture Overview

```
┌─────────────────────────────────────────────────────────┐
│                    User Interface                        │
├─────────────────────────────────────────────────────────┤
│  CLI (Command Line)  │  Visual Editor (React UI)       │
└──────────┬───────────────────────────┬──────────────────┘
           │                           │
           └───────────┬───────────────┘
                       │
           ┌───────────▼───────────┐
           │    Core Engine        │
           │  - Workflow Executor  │
           │  - Validator          │
           │  - Cache Manager      │
           │  - Retry Handler      │
           └───────────┬───────────┘
                       │
           ┌───────────▼───────────┐
           │   Provider Layer      │
           │  - OpenAI             │
           │  - Anthropic          │
           │  - Azure OpenAI       │
           │  - Ollama             │
           └───────────┬───────────┘
                       │
           ┌───────────▼───────────┐
           │   External APIs       │
           │  api.openai.com       │
           │  api.anthropic.com    │
           └───────────────────────┘
```

### Execution Flow

```
1. Load Workflow File (YAML)
         │
         ▼
2. Validate Structure (Check for errors)
         │
         ▼
3. Build Execution Graph (Determine order)
         │
         ▼
4. For Each Node:
   ├─ Check Cache (Skip if cached)
   ├─ Substitute Variables ({{topic}} → "AI")
   ├─ Call AI Provider (OpenAI/Anthropic)
   ├─ Store Result in Cache
   └─ Pass Output to Next Node
         │
         ▼
5. Return Final Results
```

---

## 📦 Installation Guide

### Prerequisites

- **Node.js** version 20 or higher
- **pnpm** package manager
- API keys for AI providers (OpenAI, Anthropic, etc.)

### Step-by-Step Installation

#### 1. Install Node.js

Download from [nodejs.org](https://nodejs.org/)

Verify installation:
```bash
node --version  # Should show v20.x.x or higher
```

#### 2. Install pnpm

```bash
npm install -g pnpm
```

Verify:
```bash
pnpm --version
```

#### 3. Create PromptFlow Project

```bash
# Initialize new project
pnpm create @promptflow/cli my-ai-project

# Navigate to project
cd my-ai-project

# Install dependencies
pnpm install
```

#### 4. Configure API Keys

```bash
# Copy example environment file
cp .env.example .env

# Edit .env file with your keys
# Get keys from:
# - OpenAI: https://platform.openai.com/api-keys
# - Anthropic: https://console.anthropic.com/settings/keys
```

Your `.env` file:
```bash
OPENAI_API_KEY=sk-your-openai-key-here
ANTHROPIC_API_KEY=sk-ant-your-anthropic-key-here
```

#### 5. Verify Installation

```bash
# Run the example workflow
pnpm workflow:run
```

---

## 🚀 Creating Your First Workflow

### Example: Simple Content Generator

Let's create a workflow that generates content about any topic.

#### Step 1: Create Workflow File

Create `workflows/content-generator.yaml`:

```yaml
id: content-generator
name: Content Generator
description: Generates content about any topic
version: "1.0.0"

# Variables users must provide
variables:
  topic: "Artificial Intelligence"
  tone: "informative"
  length: "brief"

# Define AI tasks (nodes)
nodes:
  - id: generate
    name: Generate Content
    description: Creates content about the topic
    
    # Which AI model to use
    model:
      provider: openai
      model: gpt-4-turbo-preview
      temperature: 0.7        # Creativity level (0-2)
      maxTokens: 1000         # Max response length
    
    # Instructions for the AI
    systemPrompt: |
      You are a helpful content creator.
      Write clear, accurate, and engaging content.
    
    # The actual prompt
    userPrompt: |
      Write a {{length}} explanation about {{topic}}.
      
      Guidelines:
      - Use a {{tone}} tone
      - Include key concepts and examples
      - Keep it accessible to general audience
    
    # Enable caching to save money
    cacheConfig:
      enabled: true
      ttl: 3600  # Cache for 1 hour

# No edges needed for single node
edges: []
```

#### Step 2: Run the Workflow

```bash
# Run with default variables
pf run workflows/content-generator.yaml

# Run with custom variables
pf run workflows/content-generator.yaml \
  -v topic="Machine Learning" \
  -v tone="casual" \
  -v length="detailed"
```

#### Step 3: See the Output

```
✓ Workflow validated
✓ Workflow completed in 2.3s

Results:
─────────────────────────────────────────────────

[generate] ✓

Machine Learning: A Brief Explanation

What is Machine Learning?
Machine Learning (ML) is a subset of artificial intelligence...
[continues for full response]

Total duration: 2.3s
```

---

## 📝 Workflow Syntax Reference

### Complete Workflow Structure

```yaml
# Required fields
id: unique-workflow-id          # Must be unique
name: Human-Readable Name       # Display name
version: "1.0.0"                # Semantic versioning

# Optional fields
description: What this workflow does
variables:                      # Default variables
  var1: "default value"
  var2: 123

# Nodes (the AI tasks)
nodes:
  - id: node-1                  # Unique node ID
    name: Node Name             # Display name
    description: What this node does
    
    # Model configuration
    model:
      provider: openai          # openai, anthropic, azure-openai, ollama
      model: gpt-4-turbo-preview
      temperature: 0.7          # 0-2 for OpenAI, 0-1 for Anthropic
      maxTokens: 1000           # Maximum tokens in response
      topP: 1                   # Nucleus sampling
      frequencyPenalty: 0       # -2 to 2
      presencePenalty: 0        # -2 to 2
      stopSequences:            # Stop generation at these
        - "\n\n"
    
    # Prompts
    systemPrompt: |             # Optional system instructions
      You are a helpful assistant.
    
    userPrompt: |               # Required user prompt
      Your prompt with {{variables}}
    
    # Variable references
    variables:
      - var1
      - var2
    
    # Retry configuration
    retryConfig:
      maxAttempts: 3            # How many times to retry
      minTimeout: 1000          # Wait 1s before first retry
      maxTimeout: 10000         # Max 10s between retries
      factor: 2                 # Double wait time each retry
    
    # Cache configuration
    cacheConfig:
      enabled: true             # Enable caching
      ttl: 3600                 # Cache for 1 hour (seconds)
      keyPrefix: "node1"        # Custom cache key prefix

# Edges (execution order)
edges:
  - id: edge-1
    source: node-1              # Start from this node
    target: node-2              # Go to this node

# Metadata (for organization)
metadata:
  author: Your Name
  createdAt: "2024-03-27"
  tags:
    - content
    - generation
```

### Variable Substitution

Variables use `{{variableName}}` syntax:

```yaml
variables:
  topic: "AI"
  audience: "beginners"

userPrompt: |
  Explain {{topic}} to {{audience}}.
  
  # Becomes: "Explain AI to beginners."
```

### Node Output as Variable

Access previous node outputs:

```yaml
nodes:
  - id: research
    userPrompt: "Research {{topic}}"
  
  - id: outline
    userPrompt: |
      Create outline from:
      {{research}}  # ← Output from research node
```

---

## 🚀 Advanced Features

### 1. **Multi-Node Workflows**

Chain multiple AI tasks:

```yaml
nodes:
  - id: research
    name: Research
    model:
      provider: openai
      model: gpt-4
    userPrompt: "Research {{topic}}"
  
  - id: outline
    name: Create Outline
    model:
      provider: anthropic
      model: claude-3-sonnet-20240229
    userPrompt: |
      Based on research:
      {{research}}
      
      Create detailed outline.
  
  - id: draft
    name: Write Draft
    model:
      provider: openai
      model: gpt-4
    userPrompt: |
      Using outline:
      {{outline}}
      
      Write full article.

edges:
  - source: research
    target: outline
  - source: outline
    target: draft
```

### 2. **Caching**

Reduce API costs by caching results:

```yaml
cacheConfig:
  enabled: true
  ttl: 7200  # Cache for 2 hours
  
# Same prompt = cached result (instant, free!)
# Different variable = new API call
```

**How Caching Works:**

```
First Run:
  Input: "Explain AI" → API Call → Cache Result → Return
  Cost: $0.03, Time: 3s

Second Run (same input):
  Input: "Explain AI" → Cache Hit → Return
  Cost: $0.00, Time: 0.1s ✅

Third Run (different input):
  Input: "Explain ML" → API Call → Cache Result → Return
  Cost: $0.03, Time: 3s
```

### 3. **Retry Logic**

Handle API failures automatically:

```yaml
retryConfig:
  maxAttempts: 3
  minTimeout: 1000    # Wait 1s before retry 1
  maxTimeout: 10000   # Max 10s wait
  factor: 2           # Exponential backoff

# Retry schedule:
# Attempt 1: Now
# Attempt 2: After 1s
# Attempt 3: After 2s
```

### 4. **Multiple Providers**

Use different AI providers in same workflow:

```yaml
nodes:
  - id: fast-task
    model:
      provider: openai
      model: gpt-3.5-turbo  # Fast & cheap
  
  - id: complex-task
    model:
      provider: anthropic
      model: claude-3-opus  # Most capable
  
  - id: local-task
    model:
      provider: ollama
      model: llama2         # Free, local
```

### 5. **Conditional Execution**

Create branching workflows:

```yaml
# Advanced: Use variables to control flow
variables:
  needsReview: true

nodes:
  - id: draft
    userPrompt: "Write about {{topic}}"
  
  - id: review
    userPrompt: "Review: {{draft}}"
    # Only runs if needsReview is true
    # (Implementation in custom code)
```

---

## 💼 Real-World Use Cases

### 1. **Content Marketing Pipeline**

```
Topic → Research → Outline → Draft → SEO Optimize → Publish
```

**Workflow:**
```yaml
nodes:
  - research: "Research {{topic}} for target audience {{audience}}"
  - outline: "Create outline from {{research}}"
  - draft: "Write article from {{outline}}"
  - seo: "Optimize for keywords: {{keywords}}"
  - publish: "Format for {{platform}}"
```

**Result:** Generate 10 blog posts/day automatically

---

### 2. **Customer Support Automation**

```
Ticket → Classify → Sentiment Analysis → Draft Response → Route
```

**Workflow:**
```yaml
nodes:
  - classify: "Categorize: {{ticketContent}}"
  - sentiment: "Analyze sentiment: {{ticketContent}}"
  - response: "Draft response for {{category}} with {{sentiment}}"
  - route: "Assign to {{team}} based on {{classify}}"
```

**Result:** 80% of tickets handled automatically

---

### 3. **Code Review Assistant**

```
Code → Syntax Check → Security Review → Performance → Best Practices → Summary
```

**Workflow:**
```yaml
nodes:
  - syntax: "Check {{language}} syntax: {{code}}"
  - security: "Find vulnerabilities: {{code}}"
  - performance: "Identify bottlenecks: {{code}}"
  - practices: "Review best practices: {{code}}"
  - summary: "Combine all reviews into report"
```

**Result:** Consistent code reviews in 30 seconds

---

### 4. **Data Analysis Pipeline**

```
Data → Understand → Statistics → Insights → Visualize → Report
```

**Workflow:**
```yaml
nodes:
  - understand: "Analyze dataset structure: {{data}}"
  - statistics: "Calculate stats: {{data}}"
  - insights: "Generate insights from {{statistics}}"
  - visualize: "Create Python code for charts: {{insights}}"
  - report: "Write executive summary: {{insights}}"
```

**Result:** Automated data reports

---

### 5. **Learning & Research**

```
Question → Explain → Examples → Quiz → Feedback
```

**Workflow:**
```yaml
nodes:
  - explain: "Explain {{concept}} simply"
  - examples: "Give 3 examples of {{concept}}"
  - quiz: "Create quiz about {{concept}}"
  - feedback: "Grade answers: {{quiz_answers}}"
```

**Result:** Personal AI tutor

---

## 🔧 API Reference

### Programmatic Usage

Use PromptFlow in your code:

```typescript
import { WorkflowExecutor, WorkflowValidator } from '@promptflow/core';

// Load workflow
const workflow = {
  id: 'my-workflow',
  name: 'My Workflow',
  version: '1.0.0',
  nodes: [...],
  edges: [...]
};

// Validate
const validation = WorkflowValidator.validate(workflow);
if (!validation.valid) {
  console.error(validation.errors);
}

// Execute
const executor = new WorkflowExecutor();
const result = await executor.execute(workflow, {
  topic: 'AI',
  tone: 'friendly'
});

console.log(result.results);
```

### CLI Commands

```bash
# Initialize project
pf init my-project

# Run workflow
pf run workflow.yaml

# Run with variables
pf run workflow.yaml -v topic="AI" -v tone="casual"

# Validate workflow
pf validate workflow.yaml

# List workflows
pf list ./workflows

# Export to different formats
pf export workflow.yaml -f json
pf export workflow.yaml -f yaml
pf export workflow.yaml -f mermaid

# Cache management
pf cache clear
pf cache status
```

---

## 🐛 Troubleshooting

### Common Issues

#### 1. "API Key Not Found"

**Error:**
```
Error: OpenAI API key is required
```

**Solution:**
```bash
# Check .env file exists
ls -la .env

# Verify key is set
cat .env | grep OPENAI_API_KEY

# Or set environment variable directly
export OPENAI_API_KEY=sk-...
```

---

#### 2. "Workflow Validation Failed"

**Error:**
```
Workflow validation failed:
  edges.e1: Edge target 'node-2' references non-existent node
```

**Solution:**
```yaml
# Check node IDs match edge references
nodes:
  - id: node-1    # ← Must match
  - id: node-2    # ← Must match

edges:
  - source: node-1
    target: node-2  # ← Must exist in nodes
```

---

#### 3. "Rate Limit Exceeded"

**Error:**
```
Error: Rate limit exceeded
```

**Solution:**
```yaml
# Add retry logic
nodes:
  - id: my-node
    retryConfig:
      maxAttempts: 5
      minTimeout: 2000
      maxTimeout: 30000
      factor: 2
    
    # Enable caching
    cacheConfig:
      enabled: true
      ttl: 3600
```

---

#### 4. "Module Not Found"

**Error:**
```
Error: Cannot find module '@promptflow/core'
```

**Solution:**
```bash
# Reinstall dependencies
rm -rf node_modules
pnpm install

# Build packages
pnpm build
```

---

## ❓ FAQ

### General Questions

**Q: Is PromptFlow free?**  
A: Yes! PromptFlow is open-source under MIT license. You only pay for API usage (OpenAI, Anthropic, etc.).

**Q: Do I need coding experience?**  
A: Basic familiarity with YAML and command line helps, but the visual editor makes it accessible to non-developers.

**Q: Can I use it offline?**  
A: Partially. The visual editor works offline, but workflow execution requires API access (unless using local models with Ollama).

**Q: Which AI providers are supported?**  
A: Currently: OpenAI, Anthropic, Azure OpenAI, and Ollama. More providers coming soon!

---

### Technical Questions

**Q: How does caching work?**  
A: PromptFlow creates a hash of your prompt + variables. If the same request is made within the TTL (time-to-live), it returns the cached result instead of calling the API.

**Q: Can I use my own fine-tuned models?**  
A: Yes! Configure custom base URLs in your `.env` file:
```bash
OPENAI_BASE_URL=http://localhost:11434/v1  # For local models
```

**Q: How do I handle long-running workflows?**  
A: Use the `maxTimeout` setting in retryConfig. For very long workflows, consider breaking them into smaller sub-workflows.

**Q: Can I export workflows to share with team?**  
A: Yes! Use `pf export workflow.yaml -f json` to share, or commit YAML files to git.

---

### Pricing Questions

**Q: How much does it cost to run?**  
A: PromptFlow itself is free. You pay only for API usage:
- GPT-4: ~$0.03 per 1K tokens
- Claude 3: ~$0.015 per 1K tokens
- Caching can reduce costs by 70%

**Q: Can I use it commercially?**  
A: Yes! MIT license allows commercial use.

---

## 🎓 Next Steps

Now that you understand PromptFlow:

1. **Try the examples** in the `examples/` folder
2. **Build your first workflow** following the quick start
3. **Explore the visual editor** at `packages/ui`
4. **Join the community** on GitHub Discussions
5. **Contribute** by reporting bugs or adding features

---

## 📞 Getting Help

- **Documentation**: You're reading it! 📖
- **Examples**: Check `examples/` folder
- **Issues**: [GitHub Issues](https://github.com/AmithKumar1/promptflow/issues)
- **Discussions**: [GitHub Discussions](https://github.com/AmithKumar1/promptflow/discussions)

---

<div align="center">

**Happy Workflow Building! 🚀**

Made with ❤️ by the PromptFlow Team

</div>
