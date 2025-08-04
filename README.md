# Anki Maker

## 简介

Anki Maker 是一个用于创建 Anki 卡片的现代化工具。它允许用户通过直观的 Web 界面创建、编辑和导出 Anki 卡组，支持导出为多种格式，包括 Anki 卡组文件 (.apkg)、Word 文档 (.docx) 和 JSON 数据文件。

## 功能特性

- 直观的 Web 界面用于创建和编辑 Anki 卡片
- 支持多种卡组类型（单面卡、双面卡、打字练习卡）
- 实时预览编辑内容
- 支持导出为以下格式：
  - Anki 卡组文件 (.apkg)
  - Word 文档 (.docx)
  - JSON 数据文件（便于备份和分享）
- 本地存储支持，数据保存在浏览器中
- 响应式设计，支持在不同设备上使用

## 技术架构

Anki Maker 采用前后端分离的架构：

- 前端：基于 Vue 3 + TypeScript 构建，使用 Tailwind CSS 进行样式设计
- 后端：基于 FastAPI 构建的 Python 服务
- 文档处理：使用 python-docx 生成 Word 文档
- Anki 包生成：使用 genanki 库生成 .apkg 文件

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
├── client/          # 前端 Vue 应用
│   ├── src/         # 源代码
│   ├── components/  # Vue 组件
│   └── stores/      # 状态管理
├── server/          # 后端 FastAPI 服务
│   ├── main.py      # API 入口
│   ├── data_models.py  # 数据模型
│   └── document_utils.py # 文档处理工具
├── docker-compose.yml  # Docker 部署配置
└── Dockerfile.fastapi  # FastAPI Docker 配置
```

## 贡献

欢迎提交 Issue 和 Pull Request 来改进这个项目。
