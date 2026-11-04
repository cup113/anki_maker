# Anki Maker

## 简介

Anki Maker 是一个用于创建 Anki 卡片的现代化工具。它允许用户通过直观的 Web 界面创建、编辑和导出 Anki 卡组，支持导出为多种格式，包括 Anki 卡组文件 (.apkg)、Word 文档 (.docx) 和 JSON 数据文件。

## 功能特性

- 直观的 Web 界面用于创建和编辑 Anki 卡片
- 支持多种卡组类型（单面卡、双面卡、打字练习卡）
- 富文本编辑器（Tiptap），支持格式、下标等样式
- 实时预览编辑内容
- 草稿系统，自动保存编辑进度
- 支持导出为以下格式：
  - Anki 卡组文件 (.apkg)
  - Word 文档 (.docx)
  - JSON 数据文件（便于备份和分享）
- MCP（Model Context Protocol）服务器，支持 AI 集成
- 本地存储支持，数据保存在浏览器中
- 响应式设计，支持在不同设备上使用

## 技术架构

前后端分离，部署时是两个容器：页面由 SvelteKit 的 Node 服务渲染，`/api` 与 `/mcp` 由它转发给 FastAPI。

- 前端：SvelteKit 2 + Svelte 5（runes）+ TypeScript
  - 路由：文件系统路由（`src/routes`），页面的首屏由服务端渲染
  - 状态：`$state` 直接管理文档，数据读写浏览器 localStorage
  - 富文本编辑器：Tiptap（`@tiptap/core`，Svelte 侧自己接编辑器实例）
  - 样式：Tailwind CSS 4
  - 构建：`@sveltejs/adapter-node`，产物是一个 Node 服务
- 后端：基于 FastAPI 构建的 Python 服务
  - 文档处理：python-docx + 自定义 HTML 解析器生成 Word 文档
  - Anki 包生成：genanki 库生成 .apkg 文件
  - 草稿存储：本地 JSON 文件存储
  - MCP 支持：集成 Model Context Protocol 服务器，支持 AI 工具调用

## 快速开始

### 使用 Docker（推荐）

```bash
git clone <repository-url>
cd anki_maker

docker compose pull
docker compose up -d

# 打开浏览器访问 http://localhost:4134
```

`docker compose` 起两个服务：

- `web`：`ghcr.io/cup113/anki_maker-web:latest`，SvelteKit 的 Node 服务，公网端口 4134
- `fastapi`：`ghcr.io/cup113/anki_maker:latest`，只在 compose 内部可达（`:4134`）

镜像由 GitHub Actions 在每次推送到 `main`、以及每次推送 `v*` 标签时构建（`v*` 标签另打
`2.2.1`、`2.2` 等版本号）。要从本地源码重建：

```bash
docker build -f Dockerfile.web -t ghcr.io/cup113/anki_maker-web:latest .
docker build -f Dockerfile.fastapi -t ghcr.io/cup113/anki_maker:latest .
docker compose up -d
```

页面容器有两个环境变量，换域名时改它们：

| 变量 | 默认值 | 作用 |
| --- | --- | --- |
| `ORIGIN` | `http://localhost:4134` | SvelteKit 生成绝对地址用的站点源 |
| `API_INTERNAL_URL` | `http://fastapi:4134` | `/api`、`/mcp` 转发到的后端地址 |

### 开发环境

仓库是 pnpm workspace，依赖装一次就够（在仓库根目录）：

```bash
pnpm install
```

#### 前端开发

```bash
pnpm dev          # http://localhost:4133，/api 与 /mcp 代理到 4134
pnpm check        # svelte-check：类型与无障碍检查
pnpm lint         # ESLint（TypeScript + Svelte）
pnpm format       # Prettier 写入；format:check 只检查
pnpm test:unit    # vitest
pnpm build        # 产出 client/build（Node 服务）
```

#### 后端开发

```bash
cd server

# 安装依赖
pip install -r requirements.txt

# 启动服务
uvicorn server.main:app --port 4134 --reload
```

## 使用说明

1. 打开应用后，您会看到一个新建的文档
2. 在顶部输入框中修改文档标题
3. 选择合适的卡组类型（单面卡、双面卡或打字练习卡）
4. 点击 "+" 按钮添加卡片条目
5. 在每个条目中填写正面和背面内容
6. 可以使用富文本编辑器添加格式（粗体、斜体、下标等）
7. 点击下载按钮，选择需要的格式进行导出
8. 按 `?` 查看快捷键：`Ctrl / ⌘ + Enter` 新建条目，`Enter` 在行内换行，`Alt + Enter`
   添加附加条目

## 项目结构

```
anki_maker/
├── package.json            # pnpm workspace 根，脚本转发到 client
├── pnpm-workspace.yaml     # 工作区与构建脚本许可（allowBuilds）
├── client/                 # 前端 SvelteKit 应用
│   ├── src/
│   │   ├── routes/         # 页面与布局（+page.svelte / +layout.svelte）
│   │   ├── lib/
│   │   │   ├── components/ # Svelte 组件（PascalCase 命名）
│   │   │   ├── stores/     # runes 状态（record.svelte.ts / toasts.svelte.ts）
│   │   │   ├── ai/         # 提示词与 AI 回复解析
│   │   │   └── model.ts    # 文档模型与各版本 JSON 兼容层
│   │   ├── hooks.server.ts # /api、/mcp 转发给 FastAPI
│   │   ├── app.html
│   │   └── app.css
│   ├── static/             # 图标、robots.txt
│   └── svelte.config.js
├── server/                 # 后端 FastAPI 服务
│   ├── main.py             # API 入口和路由
│   ├── data_models.py      # Pydantic 数据模型
│   ├── anki_utils.py       # Anki 卡组生成
│   ├── document_utils.py   # Word 文档生成
│   ├── draft_store.py      # 草稿存储管理
│   ├── html_parser.py      # HTML 转 Word 解析器
│   ├── mcp_tools.py        # MCP 服务器和工具
│   └── tool_inputs.py      # MCP 工具输入模型
├── .github/workflows/
│   └── image.yml           # 两个镜像的构建与发布
├── docker-compose.yml      # Docker 部署配置（拉取已发布的镜像）
├── Dockerfile.fastapi      # API 镜像
└── Dockerfile.web          # 页面镜像（Node）
```

## License

Apache License 2.0，版权归 2025-2026 Jason Li。完整条文见 [LICENSE](LICENSE)。

## 贡献

欢迎提交 Issue 和 Pull Request 来改进这个项目。
