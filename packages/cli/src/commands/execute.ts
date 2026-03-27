/**
 * Execute Command - Run a workflow
 */

import chalk from 'chalk';
import ora from 'ora';
import fs from 'fs-extra';
import yaml from 'yaml';
import { WorkflowExecutor, WorkflowValidator, Workflow } from '@promptflow/core';

interface ExecuteOptions {
  var?: string[];
  output: string;
  cache?: boolean;
}

export async function runExecute(workflowPath: string, options: ExecuteOptions) {
  const spinner = ora(`Loading workflow: ${workflowPath}`).start();

  try {
    // Resolve path
    const resolvedPath = workflowPath.startsWith('/') 
      ? workflowPath 
      : `${process.cwd()}/${workflowPath}`;

    // Load workflow file
    if (!fs.existsSync(resolvedPath)) {
      spinner.fail();
      console.error(chalk.red(`Workflow file not found: ${resolvedPath}`));
      process.exit(1);
    }

    const content = await fs.readFile(resolvedPath, 'utf-8');
    let workflow: Workflow;

    // Parse YAML or JSON
    if (resolvedPath.endsWith('.json')) {
      workflow = JSON.parse(content);
    } else {
      workflow = yaml.parse(content) as Workflow;
    }

    // Validate workflow
    const validation = WorkflowValidator.validate(workflow);
    if (!validation.valid) {
      spinner.fail();
      console.error(chalk.red('Workflow validation failed:'));
      for (const error of validation.errors) {
        console.error(chalk.yellow(`  ${error.node ? `[${error.node}] ` : ''}${error.field}: ${error.message}`));
      }
      process.exit(1);
    }

    spinner.succeed(chalk.green('Workflow validated'));

    // Parse variables
    const variables: Record<string, unknown> = {};
    if (options.var) {
      for (const v of options.var) {
        const [key, ...valueParts] = v.split('=');
        const value = valueParts.join('=');
        
        // Try to parse as JSON for complex types
        try {
          variables[key] = JSON.parse(value);
        } catch {
          variables[key] = value;
        }
      }
    }

    // Execute workflow
    const execSpinner = ora('Executing workflow...').start();
    const executor = new WorkflowExecutor();

    // Disable cache if requested
    if (options.cache === false) {
      executor.clearCache();
    }

    const startTime = Date.now();
    const result = await executor.execute(workflow, variables);
    const duration = Date.now() - startTime;

    execSpinner.succeed(chalk.green(`Workflow completed in ${duration}ms`));

    // Output results
    outputResult(result, options.output);

    // Exit with error if workflow failed
    if (result.status === 'error') {
      process.exit(1);
    }

  } catch (error) {
    spinner.fail();
    console.error(chalk.red('Execution failed:'), error instanceof Error ? error.message : error);
    process.exit(1);
  }
}

function outputResult(result: Awaited<ReturnType<WorkflowExecutor['execute']>>, format: string) {
  console.log('\n' + chalk.bold('Results:'));
  console.log('─'.repeat(60));

  if (format === 'json') {
    console.log(JSON.stringify({
      workflowId: result.workflowId,
      status: result.status,
      duration: result.duration,
      results: Object.fromEntries(result.results)
    }, null, 2));
    return;
  }

  if (format === 'pretty') {
    console.log(chalk.cyan(`\nWorkflow: ${result.workflowId}`));
    console.log(chalk.green(`Status: ${result.status.toUpperCase()}`));
    console.log(chalk.gray(`Duration: ${result.duration}ms`));
    
    for (const [nodeId, nodeResult] of result.results) {
      console.log(`\n${chalk.bold(`[${nodeId}]`)} ${nodeResult.status === 'success' ? chalk.green('✓') : nodeResult.status === 'cached' ? chalk.blue('○') : chalk.red('✗')}`);
      
      if (nodeResult.cached) {
        console.log(chalk.blue('  (cached result)'));
      }
      
      if (nodeResult.tokens) {
        console.log(chalk.gray(`  Tokens: ${nodeResult.tokens.total} (prompt: ${nodeResult.tokens.prompt}, completion: ${nodeResult.tokens.completion})`));
      }
      
      if (nodeResult.duration) {
        console.log(chalk.gray(`  Duration: ${nodeResult.duration}ms`));
      }
      
      if (nodeResult.output) {
        console.log(`\n  ${chalk.white(nodeResult.output.slice(0, 500))}${nodeResult.output.length > 500 ? '...' : ''}`);
      }
      
      if (nodeResult.error) {
        console.log(chalk.red(`  Error: ${nodeResult.error}`));
      }
    }
    return;
  }

  // Default text format
  for (const [nodeId, nodeResult] of result.results) {
    const statusIcon = nodeResult.status === 'success' ? '✓' : nodeResult.status === 'cached' ? '○' : '✗';
    console.log(`\n${chalk.bold(`[${nodeId}]`)} ${statusIcon}`);
    
    if (nodeResult.output) {
      console.log(chalk.white(nodeResult.output));
    }
    
    if (nodeResult.error) {
      console.log(chalk.red(`Error: ${nodeResult.error}`));
    }
  }

  console.log('\n' + chalk.gray(`Total duration: ${result.duration}ms`));
}
