# Anki Linguist

一个把语言学习材料整理成 Anki 卡片的小工具：在浏览器里编辑一份文档，再导出成 .docx 与 .apkg 两种文件。这份词汇表定义的是**领域概念**，不是代码结构。

## Language

**Document**:
一份卡组的完整数据 —— 标题、卡组类型、词条、页脚，以及自己的身份。
_Avoid_: 卡片集合、deck、文档对象

**Library**:
浏览器 localStorage 里保存过的全部 Document，按 id 索引。
_Avoid_: 存档、文档列表、storage

**Working copy**:
编辑器里正开着的那份 Document（`AL_document`）。它不一定在 Library 里：新建还没保存、或者刚被删掉时就不在。
_Avoid_: 当前文档、current doc、session

**Record**:
Document 里的一条卡片，有正面、背面和分组标记。
_Avoid_: Chunk（同一概念在服务端的历史叫法）、卡片（口语可，代码里不用）、note

**Addition**:
挂在一条 Record 下面的例句或补充说明，导出时并进卡片同侧。
_Avoid_: 附加条目、扩展、sub-card

**Level**:
一条 Record 的分组标记（A、B、C…，分不出来就是 `-`）。导出 Word 时按它分组，并在每组内重新编号。
_Avoid_: 难度、标签、tag、group

**Deck type**:
卡组的复习方式：`one-side` 只看正面、`two-sides` 正反都考、`type` 打字输入。
_Avoid_: 卡组类型、模式、mode

**Draft**:
服务端内存里的一份 Document 副本，凭 12 位 id 在 4 小时内取回，用来把 MCP 生成的卡组带回编辑器。
_Avoid_: 草稿文档、临时文件、snapshot

**Export**:
把一个 Document 变成一个 .docx 和一个 .apkg；两个文件一次生成，共用同一个名字前缀。
_Avoid_: 下载、导出任务、build

## Relationships

- 一个 **Library** 存有零到多份 **Document**
- 同一时刻至多有一份 **Working copy**：它要么是 **Library** 里的某一份，要么是一份还没存过的草稿
- 一份 **Document** 被整份替换后仍是同一份 —— id 与创建时间不变，身份不随内容走
- 删掉 **Library** 里的某一份时，若它正是 **Working copy**，工作副本也一起清掉
- 一份 **Document** 恰好有一个 id，含有一条到多条 **Record**
- 一条 **Record** 恰好有一个 **Level**，含零到多条 **Addition**
- 一份 **Document** 有一次 **Export**，产出 .docx 与 .apkg 两个文件
- 一个 **Draft** 是某份 **Document** 在服务端的一份副本，不是第二种文档

## Example dialogue

> **Dev:** "用户把标题从「时态」改成「时态练习」，我要不要把它当成另一份 **Document**？"
> **Domain expert:** "不要。标题只是它现在的名字，id 才是它。改完 **Library** 里还是那一份，不会多出一份、也不会留下旧名字的空壳。"

> **Dev:** "那两条 **Record** 正反面都空着，导入的时候要丢掉吗？"
> **Domain expert:** "新建的那条本来就是空的 —— 解码保留它，只有 AI 回复那一条路才当作噪音丢掉。"

## Flagged ambiguities

- **Record** 与 **Chunk**：同一个概念。客户端叫 `Record`，服务端 `Chunk` 是早期命名，`ChunkDocument`、`_make_chunk_document` 都还在用。以 **Record** 为准，改到服务端时顺带改掉。
- **`sections`**：`ChunkDocument` 上有一个 `Section[][]` 字段，没有任何代码写它、读它或显示它，服务端也不收。它要么是尚未实现的**分组**概念，要么该删掉 —— 目前不要把它当成领域事实。
- **`amount`**：文档列表里显示的条数，指的是 **Record** 的数量，不是字节数或页数。
