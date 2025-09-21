from openai import AsyncOpenAI
from typing_extensions import TypedDict
import json
class RawAddition(TypedDict):
    front: str
    back: str

class RawChunk(TypedDict):
    level: str
    front: str
    back: str
    additions: list[RawAddition]

class OpenAIService:
    def __init__(self, base_url: str, api_key: str):
        self.client = AsyncOpenAI(base_url=base_url, api_key=api_key)

    async def generate_chunk_from_note(self, model_name: str, note_text: str, level: str) -> RawChunk:
        """Generate a chunk from a single note text"""
        system_prompt = """你是一个语言学习助手，负责将用户输入的单词或短语转换为Anki学习卡片内容。

输出格式要求（必须严格遵循JSON格式）：
{
  "think": "思考内容",
  "front": "正面内容（包含单词/短语、词性、义项、近义词等）",
  "back": "背面内容（详细解释和用法）",
  "additions": [
    {
      "front": "例句正面（包含目标词汇）",
      "back": "例句翻译或解释"
    }
  ]
}

生成要求：
1. front包含：目标词汇（加粗）、词性（若为单词）、主要义项、近义词（可选）
2. back包含：详细解释、用法说明、常见搭配
3. additions提供3-5个语境化的例句，展示不同用法
4. 使用markdown格式（**加粗**、*斜体*等）
5. 例句应该自然、实用，展示真实语境中的用法

示例输入："abundant"
示例输出：
{
  "think": "(你产生下面例句的方向思考)",
  "front": "abundant",
  "back": "*adj.* 丰富的，充裕的 *(~plentiful, copious)*",
  "additions": [
    {
      "front": "The region has **abundant** natural resources.",
      "back": "该地区拥有**丰富的**自然资源。"
    },
    {
      "front": "Evidence for this theory is **abundant** and convincing.",
      "back": "支持这一理论的证据**丰富**且令人信服。"
    }
  ]
}"""

        user_prompt = f"请为以下学习内容生成Anki卡片：{note_text}"

        try:
            response = await self.client.chat.completions.create(
                model=model_name,
                messages=[
                    {"role": "system", "content": system_prompt},
                    {"role": "user", "content": user_prompt},
                ],
                response_format={"type": "json_object"},
                temperature=0.7,
            )

            content = response.choices[0].message.content
            if content is None:
                raise ValueError("AI Generated Content is None")
            result = json.loads(content)

            # 确保返回的数据结构正确
            return {
                "level": level,
                "front": result.get("front", ""),
                "back": result.get("back", ""),
                "additions": result.get("additions", []),
            }

        except Exception as e:
            print(f"AI generation error: {e}")
            # 返回一个默认的空结构
            return {
                "level": level,
                "front": f"**{note_text}** - 生成失败",
                "back": "AI生成过程中出现错误，请手动编辑内容",
                "additions": [],
            }

