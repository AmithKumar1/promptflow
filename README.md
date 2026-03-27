# PromptFlow

<div align="center">

**Visual prompt engineering and workflow orchestrator for LLMs**

[![CI](https://img.shields.io/github/actions/workflow/status/promptflow/promptflow/ci.yaml?branch=main)](https://github.com/promptflow/promptflow/actions)
[![npm](https://img.shields.io/npm/v/@promptflow/core)](https://www.npmjs.com/package/@promptflow/core)
[![License](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.4-blue)](https://www.typescriptlang.org)

[Features](#features) • [Quick Start](#quick-start) • [Documentation](#documentation) • [Examples](#examples) • [Contributing](#contributing)

</div>

---

PromptFlow is a powerful tool for building, visualizing, and executing complex LLM workflows. Chain multiple prompts together, add conditional logic, cache results, and orchestrate multi-step AI tasks with ease.

## ✨ Features

- **🔗 Workflow Orchestration** - Chain multiple LLM calls together with defined execution order
- **🎨 Visual Editor** - Node-based UI for designing workflows visually (React Flow)
- **🔄 Multiple Providers** - Support for OpenAI, Anthropic, Azure OpenAI, and Ollama
- **💾 Intelligent Caching** - Cache prompt results to reduce API costs and improve speed
- **🔁 Retry Logic** - Automatic retries with exponential backoff for failed requests
- **📝 Variable Substitution** - Dynamic prompts with template variables
- **✅ Validation** - Comprehensive workflow validation before execution
- **📦 CLI Tools** - Command-line interface for running and managing workflows
- **🧪 Testing Support** - Built-in testing utilities for workflow testing
- **📊 Export Options** - Export workflows to JSON, YAML, Mermaid diagrams, or TypeScript code

## 🚀 Quick Start

### Installation

```bash
# Create a new project
npx @promptflow/cli init my-promptflow-project
cd my-promptflow-project

# Install dependencies
pnpm install
```

### Configure API Keys

```bash
# Copy the example environment file
cp .env.example .env

# Edit .env with your API keys
# OPENAI_API_KEY=sk-...
# ANTHROPIC_API_KEY=sk-ant-...
```

### Create Your First Workflow

Create `workflows/hello.yaml`:

```yaml
id: hello-world
name: Hello World
description: My first PromptFlow workflow
version: "1.0.0"

variables:
  topic: "artificial intelligence"

nodes:
  - id: generate
    name: Generate Content
    model:
      provider: openai
      model: gpt-4-turbo-preview
      temperature: 0.7
    systemPrompt: |
      You are a helpful assistant.
    userPrompt: |
      Explain {{topic}} in simple terms.

edges: []
```

### Run the Workflow

```bash
# Using the CLI
pf run workflows/hello.yaml

# With custom variables
pf run workflows/hello.yaml -v topic="machine learning"

# Output as JSON
pf run workflows/hello.yaml -o json
```

## 📖 Documentation

### Workflow Syntax

A workflow consists of **nodes** (prompt definitions) and **edges** (execution order).

#### Node Structure

```yaml
nodes:
  - id: unique-node-id
    name: Human-readable name
    description: Optional description
    model:
      provider: openai  # or anthropic, azure-openai, ollama
      model: gpt-4-turbo-preview
      temperature: 0.7
      maxTokens: 1000
    systemPrompt: |
      Optional system prompt
    userPrompt: |
      Your prompt with {{variables}}
    variables:
      - variable1
      - variable2
    cacheConfig:
      enabled: true
      ttl: 3600  # Cache for 1 hour
    retryConfig:
      maxAttempts: 3
      minTimeout: 1000
      maxTimeout: 10000
      factor: 2
```

#### Edge Structure

```yaml
edges:
  - id: edge-id
    source: node-id-1
    target: node-id-2
```

### CLI Commands

| Command | Description |
|---------|-------------|
| `pf init [name]` | Initialize a new project |
| `pf run <workflow>` | Execute a workflow |
| `pf validate <workflow>` | Validate workflow syntax |
| `pf list [dir]` | List workflows in directory |
| `pf export <workflow>` | Export to different formats |
| `pf provider list` | List configured providers |
| `pf cache clear` | Clear the result cache |

### Visual Editor

Launch the visual editor:

```bash
cd packages/ui
pnpm dev
```

Open http://localhost:3000 to:
- Drag and drop nodes to create workflows
- Connect nodes with edges
- Configure node properties in the side panel
- Export to YAML/JSON
- Run workflows directly from the UI

## 📚 Examples

PromptFlow includes several example workflows in the `examples/` directory:

1. **Basic Content Generation** (`01-basic-content.yaml`) - Simple single-node workflow
2. **Research Assistant** (`02-research-assistant.yaml`) - Multi-step research pipeline
3. **Code Review Agent** (`03-code-review-agent.yaml`) - Automated code analysis
4. **Support Ticket Classifier** (`04-support-classifier.yaml`) - Customer support automation
5. **Data Analysis Pipeline** (`05-data-analysis.yaml`) - Data insights generation

Run any example:

```bash
pf run examples/01-basic-content.yaml -v topic="your topic"
```

## 🏗️ Architecture

```
promptflow/
├── packages/
│   ├── core/          # Workflow engine, providers, types
│   ├── cli/           # Command-line interface
│   └── ui/            # React visual editor
├── examples/          # Example workflows
└── .github/           # CI/CD workflows
```

### Packages

- **@promptflow/core** - Core workflow engine and provider abstraction
- **@promptflow/cli** - CLI tools for workflow management
- **@promptflow/ui** - Visual workflow editor

## 🔧 Development

```bash
# Clone the repository
git clone https://github.com/promptflow/promptflow.git
cd promptflow

# Install dependencies
pnpm install

# Run all tests
pnpm test

# Build all packages
pnpm build

# Run linting
pnpm lint
```

## 🤝 Contributing

We welcome contributions! See our [Contributing Guide](CONTRIBUTING.md) for details.

### Ways to Contribute

- 🐛 Report bugs and issues
- 💡 Suggest new features
- 📝 Improve documentation
- 🔧 Submit pull requests
- 🧪 Add test cases

## 📄 License

MIT License - see [LICENSE](LICENSE) for details.

## 🙏 Acknowledgments

- [React Flow](https://reactflow.dev/) for the node-based UI
- [OpenAI](https://openai.com/) and [Anthropic](https://anthropic.com/) for LLM APIs
- [Zod](https://zod.dev/) for schema validation
- [Vitest](https://vitest.dev/) for testing

## 📬 Contact

- GitHub Issues: [Report issues](https://github.com/promptflow/promptflow/issues)
- Discussions: [GitHub Discussions](https://github.com/promptflow/promptflow/discussions)

---

<div align="center">

**Built with ❤️ by the PromptFlow Team**

[Star on GitHub](https://github.com/promptflow/promptflow) • [View Examples](examples/) • [Read Docs](#documentation)

</div>
