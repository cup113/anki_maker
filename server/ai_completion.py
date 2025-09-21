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
        system_prompt = """你是一个高中英语助教，负责将用户输入的单词或短语参考其义项和思考方向转换为 Anki 学习卡片内容。

输出格式要求（必须严格遵循JSON格式）：
{
  "think": "思考内容",
  "back": "闪卡的背面，包含单词/短语，及近义词作为补充（可以是短语或词组，可加副词修饰表示细微差别，一般一个即可，实词也可不包含此项）",
  "front": "闪卡的正面，包含语域（如 *<formal>*，*<informal>*，仅当多出现在正式或多出现于口语时标注）、词性（若为词组不需标注）、中文义项，简洁明了",
  "additions": [
    {
      "back": "例句英文，包含加粗的目标词汇及用法，简洁而实用",
      "front": "例句中文翻译"
    }
  ]
}

示例输入：abundant 充足的
示例输出：
{
  "think": "(你产生下面例句的方向思考)",
  "back": "abundant *(~plentiful)*",
  "front": "*adj.* 丰富的，充裕的",
  "additions": [
    {
      "back": "The region has **abundant** natural resources.",
      "front": "该地区拥有**丰富的**自然资源。"
    },
    {
      "back": "Evidence for this theory is **abundant** and convincing.",
      "front": "支持这一理论的证据**丰富**且令人信服。"
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
                temperature=0.5,
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

