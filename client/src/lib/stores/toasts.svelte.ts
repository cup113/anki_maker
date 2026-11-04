import { nanoid } from 'nanoid'

export type Toast = {
  id: string
  title: string
  message: string
  opacity: number
}

const DURATION = 8000

class ToastsStore {
  toasts = $state<Toast[]>([])

  add_toast(title: string, message: string): void {
    const toast: Toast = { id: nanoid(), title, message, opacity: 0 }
    this.toasts.push(toast)

    const id = toast.id
    const find = () => this.toasts.findIndex((item) => item.id === id)

    setTimeout(() => {
      const index = find()
      if (index !== -1) this.toasts[index].opacity = 1
    }, 50)

    setTimeout(() => {
      const index = find()
      if (index === -1) return
      this.toasts[index].opacity = 0
      setTimeout(() => this.toasts.splice(find(), 1), 150)
    }, DURATION - 150)
  }
}

export const toasts = new ToastsStore()
