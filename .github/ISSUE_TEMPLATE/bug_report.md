name: Bug Report
description: File a bug report
labels: [bug, triage]
body:
  - type: markdown
    attributes:
      value: |
        Thanks for taking the time to fill out this bug report!
  - type: input
    id: description
    attributes:
      label: Describe the bug
      description: A clear and concise description of what the bug is.
    validations:
      required: true
  - type: textarea
    id: reproduction
    attributes:
      label: Steps to Reproduce
      description: Steps to reproduce the behavior.
      placeholder: |
        1. Create workflow with...
        2. Run command...
        3. See error...
    validations:
      required: true
  - type: textarea
    id: expected
    attributes:
      label: Expected behavior
      description: What you expected to happen.
    validations:
      required: true
  - type: textarea
    id: actual
    attributes:
      label: Actual behavior
      description: What actually happened?
    validations:
      required: true
  - type: input
    id: version
    attributes:
      label: PromptFlow Version
      description: What version of PromptFlow are you using?
    validations:
      required: true
  - type: input
    id: node
    attributes:
      label: Node.js Version
      description: What version of Node.js are you running?
    validations:
      required: true
  - type: dropdown
    id: os
    attributes:
      label: Operating System
      options:
        - macOS
        - Windows
        - Linux
        - Other
    validations:
      required: true
  - type: textarea
    id: additional
    attributes:
      label: Additional context
      description: Add any other context about the problem here.
