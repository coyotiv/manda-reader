import { ShortcutDefinition } from '../types'

export const FULLSCREEN_SHORTCUT_ID = 'reader.fullscreen.toggle'

export const fullscreenShortcut: ShortcutDefinition = {
  id: FULLSCREEN_SHORTCUT_ID,
  key: 'f',
  description: 'Toggle fullscreen reader',
  category: 'reader',
  preventDefault: true,
  enabled: true,
}
