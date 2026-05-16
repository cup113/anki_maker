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

Anki Maker 采用前后端分离的架构：

- 前端：基于 Vue 3 + TypeScript（严格模式）构建，使用 Vite 作为构建工具
  - 状态管理：Pinia
  - 路由：Vue Router
  - 富文本编辑器：Tiptap
  - UI 组件：Reka UI
  - 样式：Tailwind CSS 4
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

docker-compose up -d

# 打开浏览器访问 http://localhost:4134
```

### 开发环境

#### 前端开发

```bash
cd client

# 安装依赖
pnpm install

# 启动开发服务器
pnpm dev
```

#### 后端开发

```bash
cd server

# 安装依赖
pip install -r requirements.txt

# 启动服务
python main.py
```

## 使用说明

1. 打开应用后，您会看到一个新建的文档
2. 在顶部输入框中修改文档标题
3. 选择合适的卡组类型（单面卡、双面卡或打字练习卡）
4. 点击 "+" 按钮添加卡片条目
5. 在每个条目中填写正面和背面内容
6. 可以使用富文本编辑器添加格式（粗体、斜体、下标等）
7. 点击下载按钮，选择需要的格式进行导出

## 项目结构

```
anki_maker/
├── client/                 # 前端 Vue 应用
│   ├── src/
│   │   ├── assets/         # 样式文件
│   │   ├── components/     # Vue 组件（PascalCase 命名）
│   │   ├── router/         # 路由配置
│   │   ├── services/       # 外部服务
│   │   ├── stores/         # Pinia 状态管理
│   │   └── views/          # 页面视图
│   └── package.json
├── server/                 # 后端 FastAPI 服务
│   ├── main.py             # API 入口和路由
│   ├── data_models.py      # Pydantic 数据模型
│   ├── anki_utils.py       # Anki 卡组生成
│   ├── document_utils.py   # Word 文档生成
│   ├── draft_store.py      # 草稿存储管理
│   ├── html_parser.py      # HTML 转 Word 解析器
│   ├── mcp_tools.py        # MCP 服务器和工具
│   └── tool_inputs.py      # MCP 工具输入模型
├── docker-compose.yml      # Docker 部署配置
└── Dockerfile.fastapi      # FastAPI Docker 配置
```

## 贡献

欢迎提交 Issue 和 Pull Request 来改进这个项目。
