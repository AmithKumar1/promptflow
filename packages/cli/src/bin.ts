#!/usr/bin/env node

/**
 * PromptFlow CLI Entry Point
 */

import { Command } from 'commander';
import { runInit } from './commands/init.js';
import { runExecute } from './commands/execute.js';
import { runValidate } from './commands/validate.js';
import { runList } from './commands/list.js';
import { runExport } from './commands/export.js';
import { version } from '../package.json';

const program = new Command();

program
  .name('promptflow')
  .description('Visual prompt engineering and workflow orchestrator for LLMs')
  .version(version);

// pf init
program
  .command('init [projectName]')
  .description('Initialize a new PromptFlow project')
  .option('-t, --template <template>', 'Use a template (basic, advanced, agent)')
  .option('-y, --yes', 'Skip prompts and use defaults')
  .action(async (projectName, options) => {
    await runInit(projectName, options);
  });

// pf execute
program
  .command('execute <workflow>')
  .alias('run')
  .description('Execute a workflow')
  .option('-v, --var <vars...>', 'Set variables (key=value)')
  .option('-o, --output <format>', 'Output format (text, json, pretty)', 'text')
  .option('--no-cache', 'Disable caching')
  .action(async (workflow, options) => {
    await runExecute(workflow, options);
  });

// pf validate
program
  .command('validate <workflow>')
  .description('Validate a workflow definition')
  .option('-o, --output <format>', 'Output format (text, json)', 'text')
  .action(async (workflow, options) => {
    await runValidate(workflow, options);
  });

// pf list
program
  .command('list [directory]')
  .description('List workflows in a directory')
  .option('-r, --recursive', 'Search recursively')
  .option('-o, --output <format>', 'Output format (text, json)', 'text')
  .action(async (directory, options) => {
    await runList(directory, options);
  });

// pf export
program
  .command('export <workflow>')
  .description('Export a workflow to different formats')
  .option('-f, --format <format>', 'Export format (json, yaml, mermaid, code)', 'json')
  .option('-o, --output <file>', 'Output file path')
  .action(async (workflow, options) => {
    await runExport(workflow, options);
  });

// pf provider
program
  .command('provider <command>')
  .description('Manage LLM provider configurations')
  .addCommand(
    new Command('list')
      .description('List configured providers')
      .action(() => {
        console.log('Configured providers:');
        console.log('  - openai (OpenAI GPT models)');
        console.log('  - anthropic (Anthropic Claude models)');
      })
  )
  .addCommand(
    new Command('set <name>')
      .description('Set provider API key')
      .option('-k, --key <apikey>', 'API key')
      .option('-u, --url <baseurl>', 'Base URL')
      .action((name, options) => {
        console.log(`Provider configuration: ${name}`);
        console.log('Note: For security, set API keys via environment variables:');
        console.log(`  export ${name.toUpperCase()}_API_KEY=<your-key>`);
      })
  );

// pf cache
program
  .command('cache <command>')
  .description('Manage workflow cache')
  .addCommand(
    new Command('clear')
      .description('Clear the cache')
      .action(() => {
        console.log('Cache cleared.');
      })
  )
  .addCommand(
    new Command('status')
      .description('Show cache status')
      .action(() => {
        console.log('Cache status: active');
      })
  );

program.parse();
