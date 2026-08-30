# dsh-project-scaffold

> DeepSeek Harness 项目脚手架

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

## ✨ 功能特性

- 📦 **模板系统**: 内置 React/Node/Python/Go/Rust/VSCode 模板
- 🚀 **快速创建**: 一键创建项目结构
- 📂 **模板预览**: 查看模板文件结构
- 🔧 **自定义**: 支持自定义模板目录

## 📦 安装

```bash
npm install dsh-project-scaffold
```

## 🛠️ 工具

| 工具名 | 描述 | 参数 |
|--------|------|------|
| `scaffold_list` | 列出模板 | 无 |
| `scaffold_preview` | 预览模板 | `template` |
| `scaffold_create` | 创建项目 | `template`, `name`, `dir` |
| `scaffold_add_file` | 添加文件 | `template` |

## 📋 命令

- `/scaffold list` — 列出模板
- `/scaffold preview <template>` — 预览
- `/scaffold create <template> <name>` — 创建项目

## 内置模板

| 模板 | 描述 |
|------|------|
| `react-app` | React 应用（Vite + TypeScript） |
| `node-api` | Node.js API 服务（Express） |
| `python-cli` | Python CLI 工具 |
| `go-cli` | Go CLI 工具 |
| `rust-cli` | Rust CLI 工具 |
| `vscode-extension` | VS Code 扩展 |

## ⚙️ 配置

| 配置项 | 类型 | 默认值 | 说明 |
|--------|------|--------|------|
| `enabled` | boolean | `true` | 启用插件 |
| `templateDir` | string | `~/.dsh/templates` | 模板目录 |

## 📄 License

MIT
