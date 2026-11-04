<script lang="ts">
  import { onDestroy } from 'svelte'

  import { toasts } from '$lib/stores/toasts.svelte'

  let {
    text,
    label = '复制',
    class: klass = '',
  }: { text: string; label?: string; class?: string } = $props()

  let copied = $state(false)
  let timer: ReturnType<typeof setTimeout> | undefined

  // 非安全上下文（局域网 http）没有 clipboard API，退回选中复制
  function copy_legacy(value: string) {
    const area = document.createElement('textarea')
    area.value = value
    area.setAttribute('readonly', '')
    area.style.position = 'fixed'
    area.style.opacity = '0'
    document.body.append(area)
    area.select()
    const done = document.execCommand('copy')
    area.remove()
    if (!done) throw new Error('copy rejected')
  }

  async function copy() {
    try {
      if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(text)
      } else {
        copy_legacy(text)
      }
    } catch {
      toasts.add_toast('复制失败', '浏览器拒绝了剪贴板访问')
      return
    }

    copied = true
    clearTimeout(timer)
    timer = setTimeout(() => {
      copied = false
    }, 1600)
  }

  onDestroy(() => clearTimeout(timer))
</script>

<button
  type="button"
  class="paper-link shrink-0 pb-px text-[11px] text-muted transition-colors hover:text-ink focus:outline-none focus-visible:text-ink {klass}"
  onclick={copy}
>
  {copied ? '已复制' : label}
</button>
