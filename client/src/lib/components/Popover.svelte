<script lang="ts">
  import type { Snippet } from 'svelte'

  /**
   * 纸色风格里没有浮层的定位库：面板就贴着触发按钮长出来，
   * 靠 1px 边框和纸色区分层级，不需要动画和阴影那一套。
   */
  let {
    trigger,
    panel,
    side = 'bottom',
    align = 'start',
    open = $bindable(false),
  }: {
    trigger: Snippet<[() => void]>
    panel: Snippet
    side?: 'bottom' | 'right'
    align?: 'start' | 'end' | 'center'
    open?: boolean
  } = $props()

  let root: HTMLDivElement | undefined = $state()
  let panel_element: HTMLDivElement | undefined = $state()

  // 打开后把焦点送进面板：纯键盘操作时不用再 Tab 一圈才够到选项。
  $effect(() => {
    if (open && panel_element) {
      panel_element.focus()
    }
  })

  const position = $derived(
    side === 'right'
      ? 'left-full top-0 ml-1.5'
      : align === 'end'
        ? 'right-0 top-full mt-1.5'
        : align === 'center'
          ? 'left-1/2 top-full mt-1.5 -translate-x-1/2'
          : 'left-0 top-full mt-1.5',
  )

  function toggle() {
    open = !open
  }

  function on_pointerdown(event: PointerEvent) {
    if (!open) return
    if (root && !root.contains(event.target as Node)) open = false
  }

  function on_keydown(event: KeyboardEvent) {
    if (event.key === 'Escape' && open) open = false
  }
</script>

<svelte:window onpointerdown={on_pointerdown} onkeydown={on_keydown} />

<div class="relative" bind:this={root}>
  {@render trigger(toggle)}
  {#if open}
    <div class="absolute z-50 outline-none {position}" bind:this={panel_element} tabindex="-1">
      {@render panel()}
    </div>
  {/if}
</div>
