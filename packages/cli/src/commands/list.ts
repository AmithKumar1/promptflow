/**
 * List Command - List workflows in a directory
 */

import chalk from 'chalk';
import fs from 'fs-extra';
import yaml from 'yaml';
import path from 'path';

interface ListOptions {
  recursive?: boolean;
  output: string;
}

export async function runList(directory?: string, options: ListOptions = { output: 'text' }) {
  const searchDir = directory ? path.resolve(directory) : process.cwd();
  const workflows: WorkflowInfo[] = [];

  try {
    // Find workflow files
    await findWorkflows(searchDir, options.recursive || false, workflows);

    if (workflows.length === 0) {
      if (options.output === 'json') {
        console.log(JSON.stringify([], null, 2));
      } else {
        console.log(chalk.yellow('No workflows found.'));
      }
      return;
    }

    // Output results
    if (options.output === 'json') {
      console.log(JSON.stringify(workflows, null, 2));
    } else {
      console.log(chalk.bold(`\nFound ${workflows.length} workflow(s):\n`));
      
      for (const workflow of workflows) {
        console.log(chalk.cyan(`  ${workflow.name}`));
        console.log(chalk.gray(`    Path: ${workflow.path}`));
        console.log(chalk.gray(`    ID: ${workflow.id}`));
        console.log(chalk.gray(`    Version: ${workflow.version}`));
        console.log(chalk.gray(`    Nodes: ${workflow.nodes}`));
        if (workflow.description) {
          console.log(chalk.gray(`    Description: ${workflow.description}`));
        }
        console.log();
      }
    }

  } catch (error) {
    console.error(chalk.red('Error listing workflows:'), error instanceof Error ? error.message : error);
    process.exit(1);
  }
}

interface WorkflowInfo {
  name: string;
  path: string;
  id: string;
  version: string;
  nodes: number;
  description?: string;
}

async function findWorkflows(
  dir: string,
  recursive: boolean,
  results: WorkflowInfo[]
) {
  const entries = await fs.readdir(dir, { withFileTypes: true });

  for (const entry of entries) {
    // Skip hidden directories and node_modules
    if (entry.name.startsWith('.') || entry.name === 'node_modules') {
      continue;
    }

    if (entry.isDirectory()) {
      if (recursive) {
        await findWorkflows(path.join(dir, entry.name), true, results);
      }
    } else if (entry.isFile()) {
      const ext = path.extname(entry.name).toLowerCase();
      if (ext === '.yaml' || ext === '.yml' || ext === '.json') {
        try {
          const filePath = path.join(dir, entry.name);
          const content = await fs.readFile(filePath, 'utf-8');
          const workflow = ext === '.json' ? JSON.parse(content) : yaml.parse(content);

          // Check if it looks like a workflow
          if (workflow.id && workflow.name && workflow.nodes) {
            results.push({
              name: workflow.name,
              path: filePath,
              id: workflow.id,
              version: workflow.version || '1.0.0',
              nodes: Array.isArray(workflow.nodes) ? workflow.nodes.length : 0,
              description: workflow.description
            });
          }
        } catch {
          // Skip invalid files
        }
      }
    }
  }
}
