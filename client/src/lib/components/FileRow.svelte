<script lang="ts">
  import dayjs from 'dayjs'

  import Popover from './Popover.svelte'

  let {
    title,
    amount,
    created,
    modified,
    onopen,
    ondelete,
  }: {
    title: string
    amount: number
    created: string
    modified: string
    onopen: () => void
    ondelete: () => void
  } = $props()

  let open = $state(false)

  function format_date(value: string) {
    return value ? dayjs(value).format('MM-DD') : '—'
  }

  function open_document() {
    open = false
    onopen()
  }

  function remove_document() {
    open = false
    ondelete()
  }
</script>

<tr class="border-b border-rule transition-colors hover:bg-wash">
  <td class="py-3 pr-4">
    <button
      type="button"
      class="max-w-[46ch] truncate text-left font-book text-[15.5px] transition-colors hover:text-ink"
      {title}
      onclick={open_document}
    >
      {title}
    </button>
  </td>
  <td class="py-3 text-right text-[11.5px] tabular-nums text-muted">{amount}</td>
  <td class="hidden py-3 text-right text-[11.5px] tabular-nums text-muted sm:table-cell">
    {format_date(created)}
  </td>
  <td class="py-3 text-right text-[11.5px] tabular-nums text-muted">{format_date(modified)}</td>
  <td class="py-3 text-right">
    <Popover bind:open align="end">
      {#snippet trigger(toggle)}
        <button
          type="button"
          class="ml-auto grid h-7 w-7 place-items-center rounded-full text-[14px] leading-none text-muted opacity-40 transition hover:bg-[#ece8df] hover:text-ink hover:opacity-100 focus:outline-none focus-visible:opacity-100"
          aria-label="文档菜单"
          onclick={toggle}
        >
          ⋯
        </button>
      {/snippet}

      {#snippet panel()}
        <div
          class="w-28 rounded-[2px] border border-rule-strong bg-paper p-1 shadow-[0_6px_18px_rgba(45,42,38,0.10)]"
        >
          <button
            type="button"
            class="block w-full rounded-[2px] px-2.5 py-1.5 text-left text-[12.5px] text-muted transition-colors hover:bg-wash hover:text-ink"
            onclick={open_document}
          >
            打开
          </button>
          <button
            type="button"
            class="block w-full rounded-[2px] px-2.5 py-1.5 text-left text-[12.5px] text-muted transition-colors hover:bg-wash hover:text-ink"
            onclick={remove_document}
          >
            删除
          </button>
        </div>
      {/snippet}
    </Popover>
  </td>
</tr>
