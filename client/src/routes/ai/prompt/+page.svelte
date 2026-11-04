<script lang="ts">
  import { CARD_PROMPT, CardParseError, parse_reply } from '$lib/ai/prompt'
  import CopyButton from '$lib/components/CopyButton.svelte'
  import { dialogs } from '$lib/stores/dialogs.svelte'
  import { record_store } from '$lib/stores/record.svelte'

  let reply = $state('')
  let message = $state('')
  let failed = $state(false)
  let show_prompt = $state(false)

  async function apply() {
    try {
      const document = parse_reply(reply)
      const current = record_store.doc.records.length
      if (
        current > 0 &&
        !(await dialogs.confirm(`当前文档有 ${current} 条卡片，导入会整份替换，继续？`, '替换'))
      ) {
        return
      }

      record_store.replace_document(document)
      reply = ''
      failed = false
      message = `已载入「${document.title}」· ${document.records.length} 张`
    } catch (error) {
      failed = true
      message = error instanceof CardParseError ? error.message : '解析失败，检查一下格式'
    }
  }
</script>

<section class="pt-5">
  <p class="text-[12.5px] leading-[1.75] text-muted">
    复制这段提示词发给任何 AI，笔记、图片、PDF 直接附在对话里；再把回复的 JSON 粘回来。
  </p>

  <div class="mt-4 rounded-[2px] border border-rule-strong bg-white">
    <div class="flex items-center gap-3 px-3 py-1.5">
      <button
        type="button"
        class="flex items-center gap-1.5 focus:outline-none focus-visible:text-ink"
        aria-expanded={show_prompt}
        onclick={() => (show_prompt = !show_prompt)}
      >
        <span class="text-[10px] tracking-[0.12em] text-faint">提示词</span>
        <span
          class="inline-block h-0 w-0 border-x-[3.5px] border-t-[4px] border-x-transparent border-t-muted transition-transform {show_prompt
            ? ''
            : '-rotate-90'}"
        ></span>
      </button>

      <CopyButton class="ml-auto" text={CARD_PROMPT} label="复制提示词" />
    </div>

    {#if show_prompt}
      <pre
        class="fine-scroll whitespace-pre-wrap border-t border-rule px-3 py-2.5 font-mono text-[11px] leading-[1.8] text-muted">{CARD_PROMPT}</pre>
    {/if}
  </div>

  <label class="mt-6 block text-[10px] tracking-[0.12em] text-faint" for="ai-reply">
    AI 的回复
  </label>
  <textarea
    id="ai-reply"
    bind:value={reply}
    spellcheck="false"
    placeholder="粘贴 AI 回复的 JSON"
    class="mt-1.5 h-32 w-full resize-y rounded-[2px] border border-rule-strong bg-white px-2.5 py-2 text-[12.5px] leading-relaxed outline-none placeholder:text-rule-strong focus-visible:border-ink"
    oninput={() => (message = '')}
  ></textarea>

  <div class="mt-2.5 flex items-center gap-3">
    <button
      type="button"
      class="rounded-[2px] border border-ink bg-white px-3 py-1 text-[11.5px] transition-colors hover:bg-wash focus:outline-none disabled:border-rule-strong disabled:text-rule-strong"
      disabled={!reply.trim()}
      onclick={apply}
    >
      导入文档
    </button>

    {#if message}
      <span class="text-[11.5px] {failed ? 'text-[#a4472f]' : 'text-muted'}">{message}</span>
    {/if}
  </div>
</section>
