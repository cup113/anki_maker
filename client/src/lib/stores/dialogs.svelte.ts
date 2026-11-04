type Request =
  | { kind: 'alert'; message: string }
  | { kind: 'confirm'; message: string; confirm_label: string }
  | { kind: 'prompt'; message: string; value: string }

type Pending = { request: Request; resolve: (value: unknown) => void }

/**
 * 一个纸色的小对话框，替掉原生 alert / confirm / prompt：
 * 原生弹窗在移动端会带域名标题，和这个界面的气质也对不上。
 */
class DialogStore {
  current = $state<Request | null>(null)
  #pending: Pending[] = []
  #resolve: ((value: unknown) => void) | null = null

  alert(message: string): Promise<void> {
    return this.#ask({ kind: 'alert', message }) as Promise<void>
  }

  confirm(message: string, confirm_label = '确定'): Promise<boolean> {
    return this.#ask({ kind: 'confirm', message, confirm_label }) as Promise<boolean>
  }

  /** 取消返回 null，确定返回输入值（可能是空串）。 */
  prompt(message: string, value = ''): Promise<string | null> {
    return this.#ask({ kind: 'prompt', message, value }) as Promise<string | null>
  }

  settle(value: unknown): void {
    const resolve = this.#resolve
    this.#resolve = null
    this.current = null

    const next = this.#pending.shift()
    if (next) {
      this.#open(next.request, next.resolve)
    }
    resolve?.(value)
  }

  #ask(request: Request): Promise<unknown> {
    return new Promise((resolve) => {
      if (this.current) {
        this.#pending.push({ request, resolve })
        return
      }
      this.#open(request, resolve)
    })
  }

  #open(request: Request, resolve: (value: unknown) => void): void {
    this.#resolve = resolve
    this.current = request
  }
}

export const dialogs = new DialogStore()
