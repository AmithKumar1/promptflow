# 🚀 PromptFlow Quick Start Guide

**Get started in 5 minutes!** This guide will take you from zero to running your first AI workflow.

---

## 📋 What You'll Build

A **multi-step content generation workflow** that:
1. Researches a topic
2. Creates an outline
3. Writes a full article
4. Reviews for quality

```
┌──────────┐    ┌──────────┐    ┌─────────┐    ┌────────┐
│ Research │ →  │ Outline  │ →  │  Draft  │ →  │ Review │
└──────────┘    └──────────┘    └─────────┘    └────────┘
   GPT-4         Claude 3        GPT-4         Claude 3
```

---

## ⏱️ Time Required

| Step | Time |
|------|------|
| Installation | 2 min |
| Configuration | 1 min |
| Create Workflow | 2 min |
| Run & Test | 1 min |
| **Total** | **6 min** |

---

## Step 1: Install (2 minutes)

### Quick Install

```bash
# 1. Install pnpm (if you haven't)
npm install -g pnpm

# 2. Create project
pnpm create @promptflow/cli my-first-workflow

# 3. Navigate to project
cd my-first-workflow

# 4. Install dependencies
pnpm install
```

**✅ Verify:** You should see a `workflows/` folder and `package.json`

---

## Step 2: Configure API Keys (1 minute)

### Get Your API Keys

1. **OpenAI**: https://platform.openai.com/api-keys
   - Click "Create new secret key"
   - Copy the key (starts with `sk-`)

2. **Anthropic** (optional for this demo):
   - https://console.anthropic.com/settings/keys

### Add to Your Project

```bash
# Copy example file
cp .env.example .env

# Edit .env (use your favorite editor)
nano .env    # Linux/Mac
notepad .env # Windows
```

Add your keys:
```bash
OPENAI_API_KEY=sk-your-key-here
ANTHROPIC_API_KEY=sk-ant-your-key-here
```

**✅ Verify:**
```bash
pf provider list
# Should show configured providers
```

---

## Step 3: Create Your Workflow (2 minutes)

Create `workflows/content-pipeline.yaml`:

```yaml
id: content-pipeline
name: Content Generation Pipeline
description: Research, outline, write, and review articles
version: "1.0.0"

variables:
  topic: "Artificial Intelligence"
  audience: "general"
  wordCount: "500"

nodes:
  # Step 1: Research
  - id: research
    name: 🔍 Research Topic
    model:
      provider: openai
      model: gpt-4-turbo-preview
      temperature: 0.5
    systemPrompt: |
      You are an expert researcher.
      Provide accurate, well-organized information.
    userPrompt: |
      Research: {{topic}}
      
      Provide:
      1. Definition
      2. Key concepts (3-5)
      3. Current trends
      4. Important considerations
      
      Target audience: {{audience}}
    cacheConfig:
      enabled: true
      ttl: 3600

  # Step 2: Create Outline
  - id: outline
    name: 📋 Create Outline
    model:
      provider: anthropic
      model: claude-3-sonnet-20240229
      temperature: 0.4
    systemPrompt: |
      You are a content strategist.
      Create clear, logical outlines.
    userPrompt: |
      Based on this research:
      
      {{research}}
      
      Create a detailed outline for a 
      {{wordCount}}-word article.
      
      Include:
      - Catchy title options
      - Section headers
      - Key points per section
    retryConfig:
      maxAttempts: 3
      minTimeout: 1000

  # Step 3: Write Draft
  - id: draft
    name: ✍️ Write Article
    model:
      provider: openai
      model: gpt-4-turbo-preview
      temperature: 0.7
    userPrompt: |
      Using this outline:
      
      {{outline}}
      
      Write a complete {{wordCount}}-word article.
      
      Guidelines:
      - Engaging introduction
      - Clear section transitions
      - Practical examples
      - Strong conclusion

  # Step 4: Review
  - id: review
    name: ✅ Review & Improve
    model:
      provider: anthropic
      model: claude-3-sonnet-20240229
      temperature: 0.3
    userPrompt: |
      Review this article:
      
      {{draft}}
      
      Provide:
      1. Quality score (1-10)
      2. Strengths
      3. Areas for improvement
      4. Revised version if needed

edges:
  - source: research
    target: outline
  - source: outline
    target: draft
  - source: draft
    target: review

metadata:
  author: You
  tags:
    - content
    - writing
    - automation
```

**✅ Verify:** 
```bash
pf validate workflows/content-pipeline.yaml
# Should say "✓ Workflow is valid!"
```

---

## Step 4: Run Your Workflow (1 minute)

### Run with Defaults

```bash
pf run workflows/content-pipeline.yaml
```

### Run with Custom Variables

```bash
pf run workflows/content-pipeline.yaml \
  -v topic="Machine Learning" \
  -v audience="beginners" \
  -v wordCount="800"
```

### Watch It Execute

```
✓ Workflow validated
⚡ Executing: research...
✓ research completed (2.3s, 450 tokens)
⚡ Executing: outline...
✓ outline completed (1.8s, 320 tokens)
⚡ Executing: draft...
✓ draft completed (3.1s, 890 tokens)
⚡ Executing: review...
✓ review completed (1.5s, 280 tokens)

✓ Workflow completed in 8.7s

Results:
─────────────────────────────────────────────

[research] ✓

Artificial Intelligence: A Comprehensive Overview

1. Definition
Artificial Intelligence (AI) refers to...

[continues with full output from each node]

─────────────────────────────────────────────
Total duration: 8.7s
Total tokens: 1,940
Estimated cost: $0.058
```

---

## 🎉 Congratulations!

You just built and ran your first AI workflow! 🎊

### What You Accomplished

✅ Installed PromptFlow  
✅ Configured API keys  
✅ Created a 4-node workflow  
✅ Executed with variable substitution  
✅ Used caching and retry logic  
✅ Chained multiple AI providers  

---

## 🔍 Understanding the Output

### Execution Summary

```
✓ Workflow completed in 8.7s
```
- Total time from start to finish
- Includes API call time + processing

### Node Results

Each node shows:
```
[research] ✓
- Node ID and status
- Full AI output
- Token count
- Duration
```

### Cost Breakdown

```
Total tokens: 1,940
Estimated cost: $0.058
```
- PromptFlow estimates based on provider rates
- Actual cost may vary slightly

---

## 🎯 Next Steps

### 1. Modify the Workflow

Try changing:
- **Temperature**: Higher = more creative, lower = more focused
- **Models**: Swap GPT-4 for Claude or vice versa
- **Prompts**: Customize the instructions

### 2. Explore Examples

```bash
# List all example workflows
pf list examples/

# Run an example
pf run examples/01-basic-content.yaml
```

### 3. Launch Visual Editor

```bash
cd packages/ui
pnpm dev
```

Open http://localhost:3000 to:
- See your workflow visually
- Drag and drop nodes
- Edit properties in real-time

### 4. Share Your Workflow

```bash
# Export to share
pf export workflows/content-pipeline.yaml -f json

# Or commit to git
git add workflows/content-pipeline.yaml
git commit -m "Add content pipeline workflow"
```

---

## 💡 Pro Tips

### Save Money with Caching

```yaml
cacheConfig:
  enabled: true
  ttl: 7200  # Cache for 2 hours
```

Same prompt = free instant result! 💰

### Handle Errors Gracefully

```yaml
retryConfig:
  maxAttempts: 5
  minTimeout: 2000
  factor: 2
```

Auto-retry on failures! 🔄

### Use Variables Everywhere

```yaml
variables:
  topic: "AI"
  tone: "professional"

userPrompt: |
  Write about {{topic}} in {{tone}} style.
```

One workflow, infinite possibilities! 🎨

---

## 🆘 Troubleshooting

### "Command not found: pf"

```bash
# Make sure CLI is installed
pnpm install -g @promptflow/cli

# Or use npx
npx @promptflow/cli run workflow.yaml
```

### "API key invalid"

```bash
# Check your .env file
cat .env

# Keys should look like:
# OPENAI_API_KEY=sk-proj-... (40+ chars)
# ANTHROPIC_API_KEY=sk-ant-... (40+ chars)
```

### "Workflow validation failed"

```bash
# Get detailed error
pf validate workflows/content-pipeline.yaml -o json

# Common fixes:
# - Check node IDs match edge sources/targets
# - Ensure all required fields are present
# - Verify YAML indentation
```

---

## 📚 Learn More

- **Full Documentation**: `/docs/README.md`
- **Example Workflows**: `/examples/`
- **API Reference**: `/packages/core/src/types.ts`
- **Community**: [GitHub Discussions](https://github.com/AmithKumar1/promptflow/discussions)

---

## 🎓 Challenge: Build Your Own!

Now try creating a workflow for:

- [ ] Email responder
- [ ] Code reviewer
- [ ] Social media post generator
- [ ] Data analyzer
- [ ] Personal tutor

Share your creations on GitHub! 🚀

---

<div align="center">

**You're now a PromptFlow expert!** 

[View Examples](../examples/) • [Read Docs](README.md) • [Join Community](https://github.com/AmithKumar1/promptflow)

</div>
