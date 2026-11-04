<script lang="ts">
  import { onMount } from 'svelte'
  import { Editor } from '@tiptap/core'
  import StarterKit from '@tiptap/starter-kit'
  import Subscript from '@tiptap/extension-subscript'

  import Icon from './Icon.svelte'

  let {
    value = $bindable(''),
    placeholder = '',
    class: klass = '',
  }: { value?: string; placeholder?: string; class?: string } = $props()

  let host: HTMLDivElement | undefined = $state()
  let editor = $state<Editor | null>(null)
  let bubble = $state<{ left: number; top: number } | null>(null)

  const actions = [
    { name: 'bold', label: '粗体' },
    { name: 'italic', label: '斜体' },
    { name: 'subscript', label: '下标' },
  ] as const

  // 编辑器自己会改写 DOM，所以只在挂载后创建；首屏服务端渲染出来的是一个空 div。
  onMount(() => {
    const instance = new Editor({
      element: host,
      extensions: [StarterKit, Subscript],
      content: value ?? '',
      onUpdate: ({ editor }) => {
        value = editor.getHTML()
      },
      onSelectionUpdate: ({ editor }) => update_bubble(editor),
      onTransaction: ({ editor }) => update_bubble(editor),
      onFocus: ({ editor }) => update_bubble(editor),
      onBlur: () => {
        bubble = null
      },
    })

    editor = instance
    return () => instance.destroy()
  })

  // 父组件换掉内容（切换文档、导入草稿）时把编辑器的内容拉回来；
  // 与 getHTML() 比较，避免自己写出去的值再喂回自己形成循环。
  $effect(() => {
    const next = value ?? ''
    if (editor && next !== editor.getHTML()) {
      editor.commands.setContent(next, false)
    }
  })

  function update_bubble(instance: Editor) {
    const { selection } = instance.state
    if (selection.empty || !instance.isFocused) {
      bubble = null
      return
    }
    const from = instance.view.coordsAtPos(selection.from)
    const to = instance.view.coordsAtPos(selection.to)
    bubble = { left: (from.left + to.right) / 2, top: Math.min(from.top, to.top) - 8 }
  }

  function run(name: (typeof actions)[number]['name']) {
    if (!editor) return
    const chain = editor.chain().focus()
    if (name === 'bold') chain.toggleBold().run()
    if (name === 'italic') chain.toggleItalic().run()
    if (name === 'subscript') chain.toggleSubscript().run()
  }

  const empty = $derived(
    (value ?? '')
      .replace(/<[^>]*>/g, '')
      .replace(/&nbsp;/g, ' ')
      .trim() === '',
  )
</script>

<div class="editor {klass}">
  <div bind:this={host}></div>

  {#if empty && placeholder}
    <span
      class="pointer-events-none absolute inset-0 select-none font-sans text-[0.82em] not-italic leading-[1.6] tracking-wide text-faint"
    >
      {placeholder}
    </span>
  {/if}

  {#if editor && bubble}
    <div
      class="fixed z-50 flex gap-1 rounded-[2px] border border-rule-strong bg-paper p-1 shadow-[0_4px_14px_rgba(45,42,38,0.08)]"
      style:left="{bubble.left}px"
      style:top="{bubble.top}px"
      style:transform="translate(-50%, -100%)"
    >
      {#each actions as action (action.name)}
        <button
          type="button"
          class="cursor-pointer px-1 text-muted transition-colors hover:text-ink {editor.isActive(
            action.name,
          )
            ? 'text-ink'
            : ''}"
          aria-label={action.label}
          onpointerdown={(event) => event.preventDefault()}
          onclick={() => run(action.name)}
        >
          <Icon name={action.name} class="h-4 w-4" />
        </button>
      {/each}
    </div>
  {/if}
</div>
