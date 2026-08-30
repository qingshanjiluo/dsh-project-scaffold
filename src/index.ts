/**
 * dsh-project-scaffold — 项目脚手架
 *
 * 功能：
 * 1. 模板系统
 * 2. 快速创建
 * 3. 模板预览
 * 4. 自定义模板
 *
 * 工具：scaffold_list, scaffold_preview, scaffold_create, scaffold_add_file
 * 命令：/scaffold
 * 配置：enabled
 */
import { readFileSync, writeFileSync, existsSync, mkdirSync, readdirSync } from 'node:fs';
import { resolve, join, dirname } from 'node:path';
import { z } from 'zod';

export const name = 'dsh-project-scaffold';
export const inject = ['settings', 'tools', 'commands'];

const configSchema = z.object({
  enabled: z.boolean().default(true),
  templateDir: z.string().default('~/.dsh/templates'),
});

type Config = z.infer<typeof configSchema>;

interface Template { name: string; description: string; files: { path: string; content: string }[]; }

const TEMPLATES: Record<string, Template> = {
  'react-app': {
    name: 'React App',
    description: 'React 应用（Vite + TypeScript）',
    files: [
      { path: 'package.json', content: '{\n  "name": "{{name}}",\n  "private": true,\n  "version": "0.1.0",\n  "type": "module",\n  "scripts": {\n    "dev": "vite",\n    "build": "tsc && vite build",\n    "preview": "vite preview"\n  },\n  "dependencies": { "react": "^18.2.0", "react-dom": "^18.2.0" },\n  "devDependencies": { "@types/react": "^18.2.0", "@types/react-dom": "^18.2.0", "@vitejs/plugin-react": "^4.0.0", "typescript": "^5.0.0", "vite": "^5.0.0" }\n}' },
      { path: 'tsconfig.json', content: '{\n  "compilerOptions": { "target": "ES2020", "useDefineForClassFields": true, "lib": ["ES2020", "DOM", "DOM.Iterable"], "module": "ESNext", "skipLibCheck": true, "moduleResolution": "bundler", "allowImportingTsExtensions": true, "resolveJsonModule": true, "isolatedModules": true, "noEmit": true, "jsx": "react-jsx", "strict": true },\n  "include": ["src"]\n}' },
      { path: 'src/App.tsx', content: 'export default function App() {\n  return <div>Hello {{name}}</div>;\n}' },
      { path: 'src/main.tsx', content: 'import React from "react";\nimport ReactDOM from "react-dom/client";\nimport App from "./App";\n\nReactDOM.createRoot(document.getElementById("root")!).render(\n  <React.StrictMode><App /></React.StrictMode>\n);' },
      { path: 'index.html', content: '<!DOCTYPE html>\n<html lang="en">\n<head><meta charset="UTF-8"><title>{{name}}</title></head>\n<body><div id="root"></div><script type="module" src="/src/main.tsx"></script></body>\n</html>' },
    ],
  },
  'node-api': {
    name: 'Node.js API',
    description: 'Express + TypeScript API 服务',
    files: [
      { path: 'package.json', content: '{\n  "name": "{{name}}",\n  "version": "0.1.0",\n  "type": "module",\n  "scripts": { "dev": "tsx watch src/index.ts", "build": "tsc", "start": "node dist/index.js" },\n  "dependencies": { "express": "^4.18.0" },\n  "devDependencies": { "@types/express": "^4.17.0", "@types/node": "^20.0.0", "tsx": "^4.0.0", "typescript": "^5.0.0" }\n}' },
      { path: 'src/index.ts', content: 'import express from "express";\n\nconst app = express();\napp.use(express.json());\n\napp.get("/", (req, res) => {\n  res.json({ message: "Hello from {{name}}" });\n});\n\nconst PORT = process.env.PORT || 3000;\napp.listen(PORT, () => console.log(`Server running on port ${PORT}`));' },
      { path: 'tsconfig.json', content: '{\n  "compilerOptions": { "target": "ES2022", "module": "NodeNext", "moduleResolution": "NodeNext", "outDir": "dist", "rootDir": "src", "strict": true, "esModuleInterop": true, "skipLibCheck": true },\n  "include": ["src"]\n}' },
    ],
  },
  'python-cli': {
    name: 'Python CLI',
    description: 'Python CLI 工具（click + rich）',
    files: [
      { path: 'pyproject.toml', content: '[build-system]\nrequires = ["setuptools>=61.0"]\nbuild-backend = "setuptools.backends._legacy:_Backend"\n\n[project]\nname = "{{name}}"\nversion = "0.1.0"\ndependencies = ["click>=8.0", "rich>=13.0"]\n\n[project.scripts]\n{{name}} = "{{name}}.cli:main"' },
      { path: '{{name}}/__init__.py', content: '__version__ = "0.1.0"' },
      { path: '{{name}}/cli.py', content: 'import click\nfrom rich.console import Console\n\nconsole = Console()\n\n@click.group()\ndef main():\n    """{{name}} CLI"""\n    pass\n\n@main.command()\ndef hello():\n    console.print("[green]Hello from {{name}}![/green]")\n\nif __name__ == "__main__":\n    main()' },
    ],
  },
  'go-cli': {
    name: 'Go CLI',
    description: 'Go CLI 工具（cobra）',
    files: [
      { path: 'go.mod', content: 'module {{name}}\n\ngo 1.21\n\nrequire github.com/spf13/cobra v1.8.0' },
      { path: 'main.go', content: 'package main\n\nimport (\n\t"fmt"\n\t"os"\n\n\t"github.com/spf13/cobra"\n)\n\nvar rootCmd = &cobra.Command{\n\tUse:   "{{name}}",\n\tShort: "{{name}} CLI tool",\n}\n\nfunc main() {\n\tif err := rootCmd.Execute(); err != nil {\n\t\tfmt.Fprintln(os.Stderr, err)\n\t\tos.Exit(1)\n\t}\n}' },
    ],
  },
  'rust-cli': {
    name: 'Rust CLI',
    description: 'Rust CLI 工具（clap）',
    files: [
      { path: 'Cargo.toml', content: '[package]\nname = "{{name}}"\nversion = "0.1.0"\nedition = "2021"\n\n[dependencies]\nclap = { version = "4.0", features = ["derive"] }' },
      { path: 'src/main.rs', content: 'use clap::Parser;\n\n#[derive(Parser)]\n#[command(name = "{{name}}")]\nstruct Cli {\n\t/// Name to greet\n\t#[arg(short, long, default_value = "world")]\n\tname: String,\n}\n\nfn main() {\n\tlet cli = Cli::parse();\n\tprintln!("Hello, {}!", cli.name);\n}' },
    ],
  },
  'vscode-extension': {
    name: 'VS Code Extension',
    description: 'VS Code 扩展',
    files: [
      { path: 'package.json', content: '{\n  "name": "{{name}}",\n  "displayName": "{{name}}",\n  "version": "0.1.0",\n  "engines": { "vscode": "^1.80.0" },\n  "activationEvents": ["onCommand:{{name}}.hello"],\n  "main": "./out/extension.js",\n  "contributes": { "commands": [{ "command": "{{name}}.hello", "title": "Hello" }] }\n}' },
      { path: 'src/extension.ts', content: 'import * as vscode from "vscode";\n\nexport function activate(context: vscode.ExtensionContext) {\n\tlet disposable = vscode.commands.registerCommand("{{name}}.hello", () => {\n\t\tvscode.window.showInformationMessage("Hello from {{name}}!");\n\t});\n\tcontext.subscriptions.push(disposable);\n}\n\nexport function deactivate() {}' },
    ],
  },
};

function applyTemplateVars(content: string, vars: Record<string, string>): string {
  let result = content;
  for (const [k, v] of Object.entries(vars)) {
    result = result.replace(new RegExp(`\\{\\{${k}\\}\\}`, 'g'), v);
  }
  return result;
}

function listBuiltinTemplates(): { name: string; description: string; fileCount: number }[] {
  return Object.entries(TEMPLATES).map(([k, v]) => ({ name: k, description: v.description, fileCount: v.files.length }));
}

export function apply(ctx: any, config: Config) {
  if (!config.enabled) return;

  ctx.effect(() => ctx.tools.register({
    name: 'scaffold_list',
    description: '列出所有可用的项目模板。',
    output: { schema: { type: 'json' }, render: (_a: unknown, v: unknown) => {
      const tpls = v as { name: string; description: string; fileCount: number }[];
      return [{ type: 'text', text: `## 📦 可用模板 (${tpls.length})\n` + tpls.map(t => `- **${t.name}** — ${t.description} (${t.fileCount} 个文件)`).join('\n') }];
    }},
    async execute() { return listBuiltinTemplates(); },
  }), 'dsh-project-scaffold: list');

  ctx.effect(() => ctx.tools.register({
    name: 'scaffold_preview',
    description: '预览模板的文件结构。',
    parameters: { template: { type: 'string', description: '模板名称' } },
    output: { schema: { type: 'json' }, render: (_a: unknown, v: unknown) => {
      const t = v as Template;
      return [{ type: 'text', text: `## 📋 ${t.name}\n${t.description}\n\n文件:\n` + t.files.map(f => `- \`${f.path}\``).join('\n') }];
    }},
    async execute(args: { template: string }) {
      const tpl = TEMPLATES[args.template];
      if (!tpl) throw new Error(`模板不存在: ${args.template}。可用: ${Object.keys(TEMPLATES).join(', ')}`);
      return tpl;
    },
  }), 'dsh-project-scaffold: preview');

  ctx.effect(() => ctx.tools.register({
    name: 'scaffold_create',
    description: '从模板创建新项目。',
    parameters: {
      template: { type: 'string', description: '模板名称' },
      name: { type: 'string', description: '项目名称' },
      dir: { type: 'string', description: '创建目录（默认当前目录）' },
    },
    output: { schema: { type: 'json' }, render: (_a: unknown, v: unknown) => {
      const r = v as { name: string; files: string[] };
      return [{ type: 'text', text: `✅ 项目 "${r.name}" 已创建\n文件:\n` + r.files.map(f => `- ${f}`).join('\n') }];
    }},
    async execute(args: { template: string; name: string; dir?: string }) {
      const tpl = TEMPLATES[args.template];
      if (!tpl) throw new Error(`模板不存在: ${args.template}`);
      const baseDir = resolve(args.dir || '.', args.name);
      mkdirSync(baseDir, { recursive: true });
      const createdFiles: string[] = [];
      for (const file of tpl.files) {
        const filePath = join(baseDir, applyTemplateVars(file.path, { name: args.name }));
        const dir = dirname(filePath);
        mkdirSync(dir, { recursive: true });
        writeFileSync(filePath, applyTemplateVars(file.content, { name: args.name }), 'utf-8');
        createdFiles.push(filePath);
      }
      return { name: args.name, files: createdFiles };
    },
  }), 'dsh-project-scaffold: create');

  ctx.effect(() => ctx.commands.register({
    name: 'scaffold',
    description: '项目脚手架',
    input: { hint: 'list | preview <template> | create <template> <name>' },
    async handler(invocation: any) {
      const parts = invocation.rawInput.trim().split(/\s+/).filter(Boolean);
      const cmd = parts[0] || 'list';
      if (cmd === 'list') {
        const tpls = listBuiltinTemplates();
        return { kind: 'text', text: tpls.map(t => `${t.name}: ${t.description}`).join('\n') };
      }
      return { kind: 'text', text: '用法: /scaffold list|preview|create' };
    },
  }), 'dsh-project-scaffold: command');

  ctx.inject(['settings'], (sctx: any) => {
    const { settingsNamespace } = require('@deepseek-ai/dsh-settings');
    sctx.settings.register(settingsNamespace('project-scaffold'), configSchema, { base: config, expose: true, applies: 'live' });
  });
}
