import Vue from 'vue'

export interface ActiveFiltersData {
  [key: string]: FilterValue[]
}

export interface FilterLabels {
  [key: string]: string
}

export interface CustomMessages {
  [key: string]: string
}

export interface FilterRemoveEvent {
  columnProp: string
  value: FilterValue
}

export interface EventBusData {
  columnProp?: string
  value?: FilterValue
  source?: string
  [key: string]: any
}

// Utility types for better type safety
export type FilterValue = string | number
export type FilterKey = string

// Event types for EventBus communication
export declare const EVENTS: {
  readonly FILTER_CHANGED: 'FILTER_CHANGED'
  readonly FILTER_REMOVED: 'FILTER_REMOVED'
  readonly FILTERS_CLEARED: 'FILTERS_CLEARED'
  readonly FILTER_APPLIED: 'FILTER_APPLIED'
  readonly DROPDOWN_OPENED: 'DROPDOWN_OPENED'
  readonly DROPDOWN_CLOSED: 'DROPDOWN_CLOSED'
  readonly DATA_LOADING: 'DATA_LOADING'
  readonly DATA_LOADED: 'DATA_LOADED'
}

export type EventType = typeof EVENTS[keyof typeof EVENTS]

// I18n related types
export interface I18nMessages {
  filterCount: string
  clearAll: string
  [key: string]: string
}

export interface LocaleConfig {
  [locale: string]: I18nMessages
}

// EventBus interface
export interface EventBus {
  publish(event: EventType, data?: any): void
  subscribe(event: EventType, callback: (data: any) => void): string
  unsubscribe(token: string): void
  unsubscribeAll(event: EventType): void
  clear(): void
}

// Component instance data interface
export interface ActiveFiltersInstance {
  subscriptionTokens: string[]
  i18n: {
    t(key: string, params?: { [key: string]: any }): string
    setLocale(locale: string, customMessages?: CustomMessages): void
    addMessages(messages: CustomMessages): void
  }
}

/**
 * ActiveFilters Vue Component
 * 
 * A Vue.js component for displaying and managing active filters.
 * Provides an interface to visualize applied filters, show filter count,
 * and allow users to remove individual filters or clear all filters.
 * 
 * @example
 * ```vue
 * <ActiveFilters
 *   :active-filters="{ category: ['electronics'], status: ['active'] }"
 *   :filter-labels="{ category: 'Category', status: 'Status' }"
 *   @remove-filter="handleRemoveFilter"
 *   @clear-all="handleClearAll"
 * />
 * ```
 */
export default class ActiveFilters extends Vue {
  // Props
  /** Object containing active filters with keys as filter categories and values as arrays of filter values */
  activeFilters: ActiveFiltersData
  /** Mapping of filter property keys to their display labels */
  filterLabels: FilterLabels
  /** Custom background color for the component */
  backgroundColor?: string
  /** Current locale for internationalization */
  locale?: string
  /** Custom i18n messages */
  customMessages?: CustomMessages

  // Data
  /** Array of EventBus subscription tokens for cleanup */
  subscriptionTokens: string[]
  /** i18n instance for handling translations */
  i18n: ActiveFiltersInstance['i18n']

  // Computed properties
  /** Returns true if there are any active filters */
  readonly hasActiveFilters: boolean
  /** Returns the total count of active filter values */
  readonly activeFilterCount: number

  // Methods
  /** Get display label for a filter property */
  getColumnLabel(columnProp: string): string
  /** Handle removal of a specific filter */
  handleRemoveFilter(columnProp: string, value: FilterValue): void
  /** Handle clearing all active filters */
  handleClearAll(): void
  /** Set up EventBus event listeners */
  setupEventListeners(): void
  /** Clean up EventBus event listeners to prevent memory leaks */
  cleanupEventListeners(): void
  /** Handle filter changed events from EventBus */
  onFilterChanged(data: EventBusData): void
  /** Handle filter applied events from EventBus */
  onFilterApplied(data: EventBusData): void

  // Lifecycle hooks
  /** Component created lifecycle hook */
  created(): void
  /** Component before destroy lifecycle hook */
  beforeDestroy(): void
}

// Vue module augmentation for better IDE support
declare module 'vue/types/vue' {
  interface Vue {
    // Add any global Vue properties if needed
  }
}

// Module declaration for the component
declare module '@terry0316/vue2-active-filters' {
  import { VueConstructor } from 'vue'
  const ActiveFilters: VueConstructor<ActiveFilters>
  export default ActiveFilters
  export {
    ActiveFiltersData,
    FilterLabels,
    CustomMessages,
    FilterRemoveEvent,
    EventBusData,
    FilterValue,
    FilterKey,
    EventType,
    I18nMessages,
    LocaleConfig,
    EventBus,
    ActiveFiltersInstance,
    ActiveFiltersOptions
  }
}

// Component registration augmentation
declare module 'vue/types/vue' {
  interface VueConstructor {
    component(name: 'ActiveFilters', component: VueConstructor<ActiveFilters>): VueConstructor
  }
}

// Vue component options interface for better IDE support
export interface ActiveFiltersOptions {
  name: 'ActiveFilters'
  props: {
    activeFilters: {
      type: ObjectConstructor
      default: () => ActiveFiltersData
    }
    filterLabels: {
      type: ObjectConstructor
      required: true
    }
    backgroundColor: {
      type: StringConstructor
      default: string
    }
    locale: {
      type: StringConstructor
      default: string
    }
    customMessages: {
      type: ObjectConstructor
      default: () => CustomMessages
    }
  }
}

// Export for use in Vue components
export { ActiveFilters }
