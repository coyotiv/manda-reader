import { ShortcutId, ShortcutEvent, ShortcutDefinition } from './types'
import { shortcutEventDispatcher } from './dispatcher'

class KeyboardShortcutManager {
  private definitions = new Map<ShortcutId, ShortcutDefinition>()
  private keyMap = new Map<string, Set<ShortcutId>>()
  private listening = false

  register(definition: ShortcutDefinition): void {
    const existing = this.keyMap.get(definition.key.toLowerCase())
    if (existing && existing.size > 0) {
      const conflictIds = Array.from(existing).join(', ')
      console.warn(
        `[Shortcuts] Key "${definition.key}" conflict: "${definition.id}" conflicts with [${conflictIds}]`
      )
    }

    this.definitions.set(definition.id, definition)

    const key = definition.key.toLowerCase()
    if (!this.keyMap.has(key)) {
      this.keyMap.set(key, new Set())
    }
    this.keyMap.get(key)!.add(definition.id)
  }

  unregister(id: ShortcutId): void {
    const definition = this.definitions.get(id)
    if (!definition) return

    this.definitions.delete(id)

    const key = definition.key.toLowerCase()
    this.keyMap.get(key)?.delete(id)
  }

  private handleKeyDown = (event: KeyboardEvent): void => {
    if (this.isTypingContext(event.target)) {
      return
    }

    const key = event.key.toLowerCase()
    const shortcutIds = this.keyMap.get(key)

    if (!shortcutIds || shortcutIds.size === 0) return

    const enabledShortcuts = Array.from(shortcutIds)
      .map(id => this.definitions.get(id))
      .filter((def): def is ShortcutDefinition =>
        def !== undefined && def.enabled !== false
      )

    if (enabledShortcuts.length === 0) return

    const shortcut = enabledShortcuts[enabledShortcuts.length - 1]

    if (shortcut.preventDefault !== false) {
      event.preventDefault()
    }

    const shortcutEvent: ShortcutEvent = {
      id: shortcut.id,
      key: shortcut.key,
      timestamp: Date.now(),
      originalEvent: event,
    }

    shortcutEventDispatcher.dispatch(shortcutEvent)
  }

  private isTypingContext(target: EventTarget | null): boolean {
    if (!target || !(target instanceof HTMLElement)) {
      return false
    }

    const tagName = target.tagName.toLowerCase()
    const isEditable = target.isContentEditable

    return (
      tagName === 'input' ||
      tagName === 'textarea' ||
      tagName === 'select' ||
      isEditable
    )
  }

  start(): void {
    if (this.listening) return
    window.addEventListener('keydown', this.handleKeyDown)
    this.listening = true
  }

  stop(): void {
    if (!this.listening) return
    window.removeEventListener('keydown', this.handleKeyDown)
    this.listening = false
  }

  getShortcuts(): ShortcutDefinition[] {
    return Array.from(this.definitions.values())
  }

  getShortcutsByCategory(category: string): ShortcutDefinition[] {
    return this.getShortcuts().filter(s => s.category === category)
  }
}

export const shortcutManager = new KeyboardShortcutManager()
