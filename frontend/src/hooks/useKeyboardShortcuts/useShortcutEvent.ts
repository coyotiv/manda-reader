import { useEffect, useRef } from 'react'
import { shortcutEventDispatcher } from './dispatcher'
import { shortcutManager } from './shortcut-manager'
import { ShortcutDefinition, ShortcutEventHandler, UseShortcutEventOptions } from './types'

export function useShortcutEvent(
  shortcut: ShortcutDefinition,
  handler: ShortcutEventHandler,
  options: UseShortcutEventOptions = {}
) {
  const { enabled = true } = options
  const handlerRef = useRef(handler)

  useEffect(() => {
    handlerRef.current = handler
  }, [handler])

  useEffect(() => {
    if (!enabled) return

    shortcutManager.register(shortcut)
    shortcutManager.start()

    const unsubscribe = shortcutEventDispatcher.addEventListener(
      shortcut.id,
      event => handlerRef.current(event)
    )

    return unsubscribe
  }, [shortcut, enabled])
}
