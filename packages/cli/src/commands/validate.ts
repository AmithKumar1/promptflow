/**
 * Validate Command - Validate a workflow definition
 */

import chalk from 'chalk';
import fs from 'fs-extra';
import yaml from 'yaml';
import { WorkflowValidator, Workflow } from '@promptflow/core';

interface ValidateOptions {
  output: string;
}

export async function runValidate(workflowPath: string, options: ValidateOptions) {
  try {
    // Resolve path
    const resolvedPath = workflowPath.startsWith('/') 
      ? workflowPath 
      : `${process.cwd()}/${workflowPath}`;

    // Load workflow file
    if (!fs.existsSync(resolvedPath)) {
      console.error(chalk.red(`Workflow file not found: ${resolvedPath}`));
      process.exit(1);
    }

    const content = await fs.readFile(resolvedPath, 'utf-8');
    let workflow: unknown;

    // Parse YAML or JSON
    if (resolvedPath.endsWith('.json')) {
      workflow = JSON.parse(content);
    } else {
      workflow = yaml.parse(content);
    }

    // Validate workflow
    const result = WorkflowValidator.validate(workflow);

    if (options.output === 'json') {
      console.log(JSON.stringify({
        valid: result.valid,
        errors: result.errors,
        file: resolvedPath
      }, null, 2));
    } else {
      if (result.valid) {
        console.log(chalk.green('✓') + ' Workflow is valid!');
      } else {
        console.log(chalk.red('✗') + ' Workflow validation failed:\n');
        for (const error of result.errors) {
          const prefix = error.node ? chalk.cyan(`[${error.node}] `) : '';
          console.log(`  ${prefix}${chalk.yellow(error.field)}: ${error.message}`);
        }
      }
    }

    if (!result.valid) {
      process.exit(1);
    }

  } catch (error) {
    console.error(chalk.red('Validation failed:'), error instanceof Error ? error.message : error);
    process.exit(1);
  }
}
