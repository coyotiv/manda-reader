import { ShortcutEvent, ShortcutEventDetail } from './types'

class ShortcutEventDispatcher {
  private static readonly EVENT_PREFIX = 'shortcut:'

  dispatch(event: ShortcutEvent): void {
    const customEvent = new CustomEvent<ShortcutEventDetail>(
      `${ShortcutEventDispatcher.EVENT_PREFIX}${event.id}`,
      {
        detail: {
          shortcutId: event.id,
          key: event.key,
          timestamp: event.timestamp,
          originalEvent: event.originalEvent,
        },
        bubbles: false,
        cancelable: false,
      }
    )

    window.dispatchEvent(customEvent)
  }

  addEventListener(
    shortcutId: string,
    handler: (event: CustomEvent<ShortcutEventDetail>) => void
  ): () => void {
    const eventName = `${ShortcutEventDispatcher.EVENT_PREFIX}${shortcutId}`

    window.addEventListener(eventName, handler as EventListener)

    return () => {
      window.removeEventListener(eventName, handler as EventListener)
    }
  }
}

export const shortcutEventDispatcher = new ShortcutEventDispatcher()
