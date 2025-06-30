import PubSub from 'pubsub-js'

// Event types for component communication
export const EVENTS = {
  // Filter events
  FILTER_CHANGED: 'FILTER_CHANGED',
  FILTER_REMOVED: 'FILTER_REMOVED',
  FILTERS_CLEARED: 'FILTERS_CLEARED',
  FILTER_APPLIED: 'FILTER_APPLIED',
  
  // UI events
  DROPDOWN_OPENED: 'DROPDOWN_OPENED',
  DROPDOWN_CLOSED: 'DROPDOWN_CLOSED',
  
  // Data events
  DATA_LOADING: 'DATA_LOADING',
  DATA_LOADED: 'DATA_LOADED'
}

// Wrapper functions for better type safety and debugging
export const EventBus = {
  // Publish events
  publish(event, data = null) {
    console.log(`[EventBus] Publishing: ${event}`, data)
    PubSub.publish(event, data)
  },
  
  // Subscribe to events
  subscribe(event, callback) {
    console.log(`[EventBus] Subscribing to: ${event}`)
    return PubSub.subscribe(event, (msg, data) => {
      console.log(`[EventBus] Received: ${msg}`, data)
      callback(data)
    })
  },
  
  // Unsubscribe from events
  unsubscribe(token) {
    if (token) {
      console.log(`[EventBus] Unsubscribing token: ${token}`)
      PubSub.unsubscribe(token)
    }
  },
  
  // Unsubscribe all events for a specific event type
  unsubscribeAll(event) {
    console.log(`[EventBus] Unsubscribing all for: ${event}`)
    PubSub.unsubscribe(event)
  },
  
  // Clear all subscriptions (useful for cleanup)
  clearAll() {
    console.log('[EventBus] Clearing all subscriptions')
    PubSub.clearAllSubscriptions()
  }
}

export default EventBus