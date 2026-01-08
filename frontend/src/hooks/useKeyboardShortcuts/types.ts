export type ShortcutId = string

export interface ShortcutEvent {
  id: ShortcutId
  key: string
  timestamp: number
  originalEvent: KeyboardEvent
}

export interface ShortcutDefinition {
  id: ShortcutId
  key: string
  description: string
  category?: string
  preventDefault?: boolean
  enabled?: boolean
}

export interface ShortcutEventDetail {
  shortcutId: string
  key: string
  timestamp: number
  originalEvent: KeyboardEvent
}

export type ShortcutEventHandler = (event: CustomEvent<ShortcutEventDetail>) => void

export interface UseShortcutEventOptions {
  enabled?: boolean
}
