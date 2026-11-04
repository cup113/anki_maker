<script lang="ts">
  import { dialogs } from '$lib/stores/dialogs.svelte'

  let element: HTMLDialogElement | undefined = $state()
  let value = $state('')

  const request = $derived(dialogs.current)

  // 原生 <dialog> 自带焦点陷阱和 Esc，样式按纸色改一下就行。
  $effect(() => {
    const current = dialogs.current
    if (!element) return

    if (current) {
      value = current.kind === 'prompt' ? current.value : ''
      if (!element.open) element.showModal()
      const input = element.querySelector('input')
      if (input) {
        input.focus()
        input.select()
      } else {
        element.querySelector('button')?.focus()
      }
    } else if (element.open) {
      element.close()
    }
  })

  function accept() {
    if (!request) return
    if (request.kind === 'prompt') dialogs.settle(value)
    else if (request.kind === 'confirm') dialogs.settle(true)
    else dialogs.settle(undefined)
  }

  function cancel() {
    if (!request) return
    dialogs.settle(
      request.kind === 'confirm' ? false : request.kind === 'prompt' ? null : undefined,
    )
  }

  function on_keydown(event: KeyboardEvent) {
    if (event.key === 'Enter' && request?.kind !== 'alert') {
      event.preventDefault()
      accept()
    }
  }
</script>

{#if request}
  <dialog
    bind:this={element}
    class="w-[min(420px,calc(100vw-2rem))] border border-rule-strong bg-paper p-0 text-ink backdrop:bg-[rgba(45,42,38,0.18)]"
    oncancel={(event) => {
      event.preventDefault()
      cancel()
    }}
    onkeydown={on_keydown}
  >
    <p class="px-4 pb-1 pt-4 text-[13px] leading-relaxed">{request.message}</p>

    {#if request.kind === 'prompt'}
      <div class="px-4 pb-3 pt-2">
        <input
          bind:value
          class="w-full border border-rule-strong bg-white px-2 py-1.5 text-[12.5px] outline-none focus-visible:border-ink"
        />
      </div>
    {:else}
      <div class="pb-3"></div>
    {/if}

    <div class="flex items-center justify-end gap-3 border-t border-rule px-4 py-2.5">
      {#if request.kind !== 'alert'}
        <button
          type="button"
          class="paper-link pb-px text-[12px] text-muted transition-colors hover:text-ink"
          onclick={cancel}
        >
          取消
        </button>
      {/if}

      <button
        type="button"
        class="rounded-[2px] border border-ink bg-white px-3 py-1 text-[11.5px] transition-colors hover:bg-wash focus:outline-none"
        onclick={accept}
      >
        {request.kind === 'confirm' ? request.confirm_label : '确定'}
      </button>
    </div>
  </dialog>
{/if}
