<script lang="ts">
  import { onMount } from 'svelte'
  import dayjs from 'dayjs'

  import { goto } from '$app/navigation'
  import { page } from '$app/state'
  import * as model from '$lib/model'
  import { record_store } from '$lib/stores/record.svelte'
  import { toasts } from '$lib/stores/toasts.svelte'

  let loading = $state(true)
  let error = $state('')

  onMount(async () => {
    const draft_id = page.params.id
    if (!draft_id) {
      error = '无效的草稿 ID'
      loading = false
      return
    }

    try {
      const response = await fetch(`/api/drafts/${draft_id}`)
      if (!response.ok) {
        error = response.status === 404 ? '草稿不存在或已过期' : `加载失败 (${response.status})`
        loading = false
        return
      }

      const document = model.from_json(await response.json())
      record_store.load_draft(document)
      toasts.add_toast('草稿加载成功', `(${dayjs().format('HH:mm:ss')}) ${document.title}`)
      await goto('/')
    } catch {
      error = '网络错误，无法加载草稿'
      loading = false
    }
  })
</script>

<main class="px-4 py-20 sm:px-8">
  {#if loading}
    <div class="flex flex-col items-center gap-3">
      <div class="h-6 w-6 animate-spin rounded-full border border-rule-strong border-t-ink"></div>
      <p class="text-[12.5px] text-muted">正在加载草稿…</p>
    </div>
  {:else if error}
    <div class="text-center">
      <p class="text-[12.5px] text-muted">{error}</p>
      <a
        href="/"
        class="paper-link mt-5 inline-block text-[12.5px] text-muted transition-colors hover:text-ink"
      >
        返回首页
      </a>
    </div>
  {/if}
</main>
