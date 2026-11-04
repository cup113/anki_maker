<script lang="ts">
  import { toasts } from '$lib/stores/toasts.svelte'
</script>

<div
  class="pointer-events-none fixed bottom-0 right-0 z-50 m-0 flex w-80 max-w-full list-none flex-col-reverse gap-2 p-3"
  role="status"
  aria-live="polite"
>
  {#each toasts.toasts as toast (toast.id)}
    <div
      class="pointer-events-auto flex flex-col gap-0.5 rounded-[2px] border border-rule-strong bg-paper px-3 py-2 shadow-[0_4px_14px_rgba(45,42,38,0.08)] transition-opacity"
      style:opacity={toast.opacity}
    >
      <span class="text-[12px] text-ink">{toast.title}</span>
      <span class="text-[11px] text-muted">{toast.message}</span>
    </div>
  {/each}
</div>
