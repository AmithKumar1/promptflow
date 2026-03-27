# Contributing to PromptFlow

Thank you for your interest in contributing to PromptFlow! This document provides guidelines and instructions for contributing.

## 🌟 How to Contribute

### Reporting Bugs

Before creating bug reports, please check existing issues as you might find the problem already documented. When creating a bug report, include:

- **Clear title and description**
- **Steps to reproduce** the behavior
- **Expected vs actual behavior**
- **Code snippets** if applicable
- **Environment details** (Node version, OS, package version)

**Example:**

```markdown
### Bug Report

**Description:** Workflow validation fails for valid edge cases

**Steps to Reproduce:**
1. Create workflow with diamond dependency pattern
2. Run `pf validate workflow.yaml`
3. See validation error

**Expected:** Validation should pass
**Actual:** Validation incorrectly reports cycle detection

**Environment:**
- Node: 20.11.0
- OS: macOS 14.0
- Package: @promptflow/core@0.1.0
```

### Suggesting Features

Feature suggestions are welcome! Please provide:

- **Use case** - Why is this feature needed?
- **Proposed solution** - How should it work?
- **Alternatives considered** - What other approaches exist?
- **Additional context** - Any other relevant information

### Pull Requests

1. **Fork** the repository
2. **Create a branch** from `main`
   ```bash
   git checkout -b feature/amazing-feature
   ```
3. **Make your changes** following our coding standards
4. **Write tests** for new functionality
5. **Ensure all tests pass**
   ```bash
   pnpm test
   ```
6. **Run type checking and linting**
   ```bash
   pnpm typecheck
   pnpm lint
   ```
7. **Commit your changes** using conventional commits
8. **Push to your fork** and submit a Pull Request

## 📋 Coding Standards

### TypeScript

- Use TypeScript for all code
- Enable strict mode in tsconfig
- Define explicit types (avoid `any`)
- Use interfaces for object shapes
- Export types from `index.ts` files

### Code Style

```typescript
// Use meaningful variable names
const workflowExecutor = new WorkflowExecutor();
const MAX_RETRIES = 3;

// Prefer async/await over promise chains
async function executeWorkflow(workflow: Workflow): Promise<WorkflowResult> {
  // Implementation
}

// Use early returns to reduce nesting
function validateNode(node: Node): boolean {
  if (!node.id) return false;
  if (!node.model) return false;
  return true;
}

// Destructure when possible
function processNode({ id, model, userPrompt }: PromptNode) {
  // Implementation
}
```

### Testing

- Write tests for all new functionality
- Aim for >80% code coverage
- Use descriptive test names
- Test edge cases and error conditions
- Mock external dependencies

```typescript
describe('WorkflowExecutor', () => {
  describe('execute', () => {
    it('should execute a single-node workflow successfully', async () => {
      // Arrange
      const workflow = createTestWorkflow();
      
      // Act
      const result = await executor.execute(workflow);
      
      // Assert
      expect(result.status).toBe('success');
      expect(result.results.size).toBe(1);
    });
    
    it('should handle node failures gracefully', async () => {
      // Test error handling
    });
  });
});
```

### Commit Messages

Follow [Conventional Commits](https://www.conventionalcommits.org/):

```
feat: add caching support for workflow nodes
fix: resolve cycle detection in validator
docs: update README with new examples
test: add tests for multi-node workflows
refactor: extract provider validation logic
chore: update dependencies
```

## 🏗️ Project Structure

```
promptflow/
├── packages/
│   ├── core/           # Core engine
│   │   ├── src/
│   │   │   ├── types.ts
│   │   │   ├── executor.ts
│   │   │   ├── validator.ts
│   │   │   ├── providers/
│   │   │   └── __tests__/
│   │   └── package.json
│   ├── cli/            # CLI tools
│   └── ui/             # Visual editor
├── examples/           # Example workflows
├── .github/workflows/  # CI/CD
└── package.json        # Root package.json (monorepo)
```

## 🧪 Development Workflow

### Setup

```bash
# Clone your fork
git clone https://github.com/YOUR_USERNAME/promptflow.git
cd promptflow

# Install dependencies
pnpm install

# Build all packages
pnpm build

# Run tests
pnpm test
```

### Making Changes

1. **Create a branch**
   ```bash
   git checkout -b feat/your-feature
   ```

2. **Make changes** in the appropriate package

3. **Test locally**
   ```bash
   # Run core tests
   cd packages/core && pnpm test
   
   # Test CLI
   cd packages/cli && pnpm build
   pf --help
   ```

4. **Build and verify**
   ```bash
   pnpm build
   pnpm lint
   pnpm typecheck
   ```

### Before Submitting

- [ ] Tests pass (`pnpm test`)
- [ ] Type checking passes (`pnpm typecheck`)
- [ ] Linting passes (`pnpm lint`)
- [ ] Documentation updated
- [ ] Examples added/updated (if applicable)
- [ ] Commit messages follow convention

## 📦 Package-Specific Guidelines

### @promptflow/core

- Maintain backward compatibility when possible
- Document all public APIs with JSDoc
- Add tests for edge cases
- Consider performance implications

### @promptflow/cli

- Follow CLI best practices
- Provide helpful error messages
- Include `--help` for all commands
- Support both verbose and quiet modes

### @promptflow/ui

- Ensure responsive design
- Test in multiple browsers
- Follow React best practices
- Include accessibility features

## 🔍 Code Review Process

All PRs are reviewed by maintainers:

1. **Automated checks** must pass (CI/CD)
2. **At least one maintainer** approval required
3. **Address all review comments** before merging
4. **Squash commits** if multiple commits fix the same issue

## 📖 Documentation

- Update README.md for user-facing changes
- Add JSDoc comments for public APIs
- Include examples for new features
- Update workflow syntax documentation

## 🎯 Areas Needing Contribution

- [ ] Additional LLM providers (Google, Cohere, etc.)
- [ ] More example workflows
- [ ] Performance optimizations
- [ ] UI improvements
- [ ] Documentation translations
- [ ] Integration tests
- [ ] Workflow templates

## 💬 Questions?

- **General questions**: [GitHub Discussions](https://github.com/promptflow/promptflow/discussions)
- **Bug reports**: [GitHub Issues](https://github.com/promptflow/promptflow/issues)
- **Chat**: Join our community chat (coming soon)

---

Thank you for contributing to PromptFlow! 🙏
