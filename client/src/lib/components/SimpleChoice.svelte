<script lang="ts">
  import Popover from './Popover.svelte'

  let { value = $bindable('-') }: { value?: string } = $props()

  const choices = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', '-', '→', '①', '②', '③', '④', '⑤']
  let open = $state(false)

  function choose_level(level: string) {
    value = level
    open = false
  }
</script>

<Popover bind:open side="right" align="start">
  {#snippet trigger(toggle)}
    <button
      type="button"
      class="border-b border-dotted border-transparent pb-px font-book text-[11.5px] leading-tight text-muted transition-colors hover:border-rule-strong hover:text-ink focus:outline-none focus-visible:border-ink"
      onclick={toggle}
    >
      {value}
    </button>
  {/snippet}

  {#snippet panel()}
    <div
      class="grid w-[172px] grid-cols-5 gap-0.5 rounded-[2px] border border-rule-strong bg-paper p-2 shadow-[0_6px_18px_rgba(45,42,38,0.10)]"
    >
      {#each choices as level (level)}
        <button
          type="button"
          class="h-6 text-center font-book text-[12px] text-muted transition-colors hover:bg-wash hover:text-ink {level ===
          value
            ? 'bg-wash text-ink'
            : ''}"
          onclick={() => choose_level(level)}
        >
          {level}
        </button>
      {/each}
    </div>
  {/snippet}
</Popover>
