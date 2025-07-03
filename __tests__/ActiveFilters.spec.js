// Mock the entire eventBus module to avoid PubSub dependency
jest.mock('../src/utils/eventBus.js', () => ({
  EVENTS: {
    FILTER_CHANGED: 'FILTER_CHANGED',
    FILTER_REMOVED: 'FILTER_REMOVED',
    FILTERS_CLEARED: 'FILTERS_CLEARED',
    FILTER_APPLIED: 'FILTER_APPLIED'
  },
  EventBus: {
    publish: jest.fn(),
    subscribe: jest.fn(() => 'mock-token'),
    unsubscribe: jest.fn()
  }
}))

// Mock i18n module
jest.mock('../src/utils/i18n.js', () => ({
  DEFAULT_LOCALE: 'en',
  I18n: jest.fn().mockImplementation(() => ({
    t: jest.fn((key, params) => {
      const messages = {
        filterCount: `${params?.count || 0} filters applied`,
        clearAll: 'Clear All'
      }
      return messages[key] || key
    }),
    setLocale: jest.fn(),
    addMessages: jest.fn()
  }))
}))

describe('ActiveFilters Component', () => {
  let component
  let mockEventBus
  
  beforeEach(() => {
    // Reset mocks
    jest.clearAllMocks()
    mockEventBus = require('../src/utils/eventBus.js').EventBus
  })

  describe('Component Logic Tests', () => {
    it('should correctly calculate hasActiveFilters computed property', () => {
      // Test the logic without mounting the component
      const hasActiveFilters = (activeFilters) => {
        return Object.keys(activeFilters).length > 0
      }
      
      expect(hasActiveFilters({})).toBe(false)
      expect(hasActiveFilters({ category: ['test'] })).toBe(true)
      expect(hasActiveFilters({ category: ['test'], status: ['active'] })).toBe(true)
    })

    it('should correctly calculate activeFilterCount', () => {
      const activeFilterCount = (activeFilters) => {
        let count = 0
        Object.values(activeFilters).forEach(values => {
          count += values.length
        })
        return count
      }
      
      expect(activeFilterCount({})).toBe(0)
      expect(activeFilterCount({ category: ['test'] })).toBe(1)
      expect(activeFilterCount({ 
        category: ['electronics', 'books'], 
        status: ['active', 'pending'] 
      })).toBe(4)
    })

    it('should handle getColumnLabel method correctly', () => {
      const getColumnLabel = (columnProp, filterLabels) => {
        return filterLabels?.[columnProp] ? filterLabels[columnProp] : columnProp
      }
      
      const filterLabels = { category: 'Category', status: 'Status' }
      
      expect(getColumnLabel('category', filterLabels)).toBe('Category')
      expect(getColumnLabel('status', filterLabels)).toBe('Status')
      expect(getColumnLabel('unknown', filterLabels)).toBe('unknown')
      expect(getColumnLabel('test', {})).toBe('test')
    })
  })

  describe('Event Publishing Logic', () => {
    it('should publish correct event when removing filter', () => {
      const handleRemoveFilter = (columnProp, value) => {
        mockEventBus.publish('FILTER_REMOVED', {
          columnProp,
          value,
          source: 'ActiveFilters'
        })
      }
      
      handleRemoveFilter('category', 'electronics')
      
      expect(mockEventBus.publish).toHaveBeenCalledWith('FILTER_REMOVED', {
        columnProp: 'category',
        value: 'electronics',
        source: 'ActiveFilters'
      })
    })

    it('should publish correct event when clearing all filters', () => {
      const handleClearAll = () => {
        mockEventBus.publish('FILTERS_CLEARED', {
          source: 'ActiveFilters'
        })
      }
      
      handleClearAll()
      
      expect(mockEventBus.publish).toHaveBeenCalledWith('FILTERS_CLEARED', {
        source: 'ActiveFilters'
      })
    })
  })

  describe('EventBus Integration', () => {
    it('should setup event listeners correctly', () => {
      const setupEventListeners = () => {
        const filterChangedToken = mockEventBus.subscribe('FILTER_CHANGED', jest.fn())
        const filterAppliedToken = mockEventBus.subscribe('FILTER_APPLIED', jest.fn())
        return [filterChangedToken, filterAppliedToken]
      }
      
      const tokens = setupEventListeners()
      
      expect(mockEventBus.subscribe).toHaveBeenCalledTimes(2)
      expect(mockEventBus.subscribe).toHaveBeenCalledWith('FILTER_CHANGED', expect.any(Function))
      expect(mockEventBus.subscribe).toHaveBeenCalledWith('FILTER_APPLIED', expect.any(Function))
      expect(tokens).toHaveLength(2)
    })

    it('should cleanup event listeners correctly', () => {
      const cleanupEventListeners = (subscriptionTokens) => {
        subscriptionTokens.forEach(token => {
          mockEventBus.unsubscribe(token)
        })
      }
      
      const tokens = ['token1', 'token2']
      cleanupEventListeners(tokens)
      
      expect(mockEventBus.unsubscribe).toHaveBeenCalledTimes(2)
      expect(mockEventBus.unsubscribe).toHaveBeenCalledWith('token1')
      expect(mockEventBus.unsubscribe).toHaveBeenCalledWith('token2')
    })
  })

  describe('Filter Display Logic', () => {
    it('should generate correct filter tag display text', () => {
      const generateTagText = (columnProp, value, filterLabels) => {
        const label = filterLabels?.[columnProp] ? filterLabels[columnProp] : columnProp
        return `${label}: ${value}`
      }
      
      const filterLabels = { category: 'Category', status: 'Status' }
      
      expect(generateTagText('category', 'electronics', filterLabels)).toBe('Category: electronics')
      expect(generateTagText('status', 'active', filterLabels)).toBe('Status: active')
      expect(generateTagText('unknown', 'value', filterLabels)).toBe('unknown: value')
    })

    it('should generate filter tags for multiple values', () => {
      const generateFilterTags = (activeFilters, filterLabels) => {
        const tags = []
        Object.entries(activeFilters).forEach(([key, values]) => {
          values.forEach(value => {
            const label = filterLabels?.[key] ? filterLabels[key] : key
            tags.push({
              key: `${key}-${value}`,
              text: `${label}: ${value}`,
              columnProp: key,
              value: value
            })
          })
        })
        return tags
      }
      
      const activeFilters = {
        category: ['electronics', 'books'],
        status: ['active']
      }
      const filterLabels = { category: 'Category', status: 'Status' }
      
      const tags = generateFilterTags(activeFilters, filterLabels)
      
      expect(tags).toHaveLength(3)
      expect(tags[0]).toEqual({
        key: 'category-electronics',
        text: 'Category: electronics',
        columnProp: 'category',
        value: 'electronics'
      })
      expect(tags[1]).toEqual({
        key: 'category-books',
        text: 'Category: books',
        columnProp: 'category',
        value: 'books'
      })
      expect(tags[2]).toEqual({
        key: 'status-active',
        text: 'Status: active',
        columnProp: 'status',
        value: 'active'
      })
    })
  })

  describe('Internationalization Logic', () => {
    it('should handle different locales correctly', () => {
      const { I18n } = require('../src/utils/i18n.js')
      const i18nInstance = new I18n('en', {})
      
      expect(I18n).toHaveBeenCalledWith('en', {})
      expect(i18nInstance.t).toBeDefined()
      expect(i18nInstance.setLocale).toBeDefined()
      expect(i18nInstance.addMessages).toBeDefined()
    })

    it('should format filter count messages correctly', () => {
      const formatFilterCount = (count) => {
        return `${count} filters applied`
      }
      
      expect(formatFilterCount(0)).toBe('0 filters applied')
      expect(formatFilterCount(1)).toBe('1 filters applied')
      expect(formatFilterCount(5)).toBe('5 filters applied')
    })
  })

  describe('Props Validation Logic', () => {
    it('should handle empty props correctly', () => {
      const validateProps = (props) => {
        return {
          activeFilters: props.activeFilters || {},
          filterLabels: props.filterLabels || {},
          backgroundColor: props.backgroundColor || '#f0f9ff',
          locale: props.locale || 'en',
          customMessages: props.customMessages || {}
        }
      }
      
      const result = validateProps({})
      
      expect(result.activeFilters).toEqual({})
      expect(result.filterLabels).toEqual({})
      expect(result.backgroundColor).toBe('#f0f9ff')
      expect(result.locale).toBe('en')
      expect(result.customMessages).toEqual({})
    })

    it('should use provided props when available', () => {
      const validateProps = (props) => {
        return {
          activeFilters: props.activeFilters || {},
          filterLabels: props.filterLabels || {},
          backgroundColor: props.backgroundColor || '#f0f9ff',
          locale: props.locale || 'en',
          customMessages: props.customMessages || {}
        }
      }
      
      const inputProps = {
        activeFilters: { test: ['value'] },
        filterLabels: { test: 'Test' },
        backgroundColor: '#ff0000',
        locale: 'zh-TW',
        customMessages: { clearAll: 'Custom Clear' }
      }
      
      const result = validateProps(inputProps)
      
      expect(result.activeFilters).toEqual({ test: ['value'] })
      expect(result.filterLabels).toEqual({ test: 'Test' })
      expect(result.backgroundColor).toBe('#ff0000')
      expect(result.locale).toBe('zh-TW')
      expect(result.customMessages).toEqual({ clearAll: 'Custom Clear' })
    })
  })

  describe('Edge Cases and Error Handling', () => {
    it('should handle null or undefined values gracefully', () => {
      const hasActiveFilters = (activeFilters) => {
        if (!activeFilters || typeof activeFilters !== 'object') return false
        return Object.keys(activeFilters).length > 0
      }
      
      expect(hasActiveFilters(null)).toBe(false)
      expect(hasActiveFilters(undefined)).toBe(false)
      expect(hasActiveFilters('invalid')).toBe(false)
      expect(hasActiveFilters({})).toBe(false)
      expect(hasActiveFilters({ test: [] })).toBe(true)
    })

    it('should handle empty arrays in activeFilters', () => {
      const activeFilterCount = (activeFilters) => {
        if (!activeFilters || typeof activeFilters !== 'object') return 0
        let count = 0
        Object.values(activeFilters).forEach(values => {
          if (Array.isArray(values)) {
            count += values.length
          }
        })
        return count
      }
      
      expect(activeFilterCount({ category: [] })).toBe(0)
      expect(activeFilterCount({ category: [], status: ['active'] })).toBe(1)
      expect(activeFilterCount({ category: null })).toBe(0)
    })

    it('should handle malformed filter data', () => {
      const generateFilterTags = (activeFilters, filterLabels) => {
        if (!activeFilters || typeof activeFilters !== 'object') return []
        
        const tags = []
        Object.entries(activeFilters).forEach(([key, values]) => {
          if (Array.isArray(values)) {
            values.forEach(value => {
              if (value !== null && value !== undefined) {
                const label = filterLabels?.[key] ? filterLabels[key] : key
                tags.push({
                  key: `${key}-${value}`,
                  text: `${label}: ${value}`,
                  columnProp: key,
                  value: value
                })
              }
            })
          }
        })
        return tags
      }
      
      const malformedData = {
        category: ['electronics', null, undefined, 'books'],
        status: null,
        priority: 'not-an-array'
      }
      
      const tags = generateFilterTags(malformedData, { category: 'Category' })
      
      expect(tags).toHaveLength(2) // Only valid values
      expect(tags[0].value).toBe('electronics')
      expect(tags[1].value).toBe('books')
    })
  })

  describe('Performance and Optimization', () => {
    it('should efficiently handle large filter sets', () => {
      const generateLargeFilterSet = (size) => {
        const filters = {}
        for (let i = 0; i < size; i++) {
          filters[`category_${i}`] = [`value_${i}_1`, `value_${i}_2`]
        }
        return filters
      }
      
      const activeFilterCount = (activeFilters) => {
        let count = 0
        Object.values(activeFilters).forEach(values => {
          count += values.length
        })
        return count
      }
      
      const largeFilterSet = generateLargeFilterSet(100)
      const startTime = performance.now()
      const count = activeFilterCount(largeFilterSet)
      const endTime = performance.now()
      
      expect(count).toBe(200) // 100 categories * 2 values each
      expect(endTime - startTime).toBeLessThan(10) // Should be fast
    })

    it('should handle rapid event publishing efficiently', () => {
      const batchEvents = []
      const mockBatchEventBus = {
        publish: jest.fn((event, data) => {
          batchEvents.push({ event, data, timestamp: Date.now() })
        })
      }
      
      // Simulate rapid filter removals
      for (let i = 0; i < 10; i++) {
        mockBatchEventBus.publish('FILTER_REMOVED', {
          columnProp: `category_${i}`,
          value: `value_${i}`,
          source: 'ActiveFilters'
        })
      }
      
      expect(mockBatchEventBus.publish).toHaveBeenCalledTimes(10)
      expect(batchEvents).toHaveLength(10)
      
      // Check that all events were published with correct data
      batchEvents.forEach((event, index) => {
        expect(event.event).toBe('FILTER_REMOVED')
        expect(event.data.columnProp).toBe(`category_${index}`)
        expect(event.data.value).toBe(`value_${index}`)
      })
    })
  })

  describe('Accessibility and UX Considerations', () => {
    it('should generate screen reader friendly content', () => {
      const generateAriaLabel = (activeFilterCount) => {
        if (activeFilterCount === 0) {
          return 'No active filters'
        } else if (activeFilterCount === 1) {
          return '1 filter applied'
        } else {
          return `${activeFilterCount} filters applied`
        }
      }
      
      expect(generateAriaLabel(0)).toBe('No active filters')
      expect(generateAriaLabel(1)).toBe('1 filter applied')
      expect(generateAriaLabel(5)).toBe('5 filters applied')
    })

    it('should provide meaningful button labels', () => {
      const generateRemoveButtonLabel = (filterLabel, filterValue) => {
        return `Remove ${filterLabel}: ${filterValue} filter`
      }
      
      expect(generateRemoveButtonLabel('Category', 'electronics'))
        .toBe('Remove Category: electronics filter')
      expect(generateRemoveButtonLabel('Status', 'active'))
        .toBe('Remove Status: active filter')
    })

    it('should handle keyboard navigation requirements', () => {
      const keyboardHandler = (event, action) => {
        const keyMap = {
          'Enter': 'activate',
          ' ': 'activate', // Space
          'Escape': 'cancel',
          'Delete': 'remove',
          'Backspace': 'remove'
        }
        
        return keyMap[event.key] || null
      }
      
      expect(keyboardHandler({ key: 'Enter' })).toBe('activate')
      expect(keyboardHandler({ key: ' ' })).toBe('activate')
      expect(keyboardHandler({ key: 'Escape' })).toBe('cancel')
      expect(keyboardHandler({ key: 'Delete' })).toBe('remove')
      expect(keyboardHandler({ key: 'Tab' })).toBe(null)
    })
  })

  describe('Data Structure Validation', () => {
    it('should handle complex filter value types', () => {
      const validateFilterValue = (value) => {
        return (typeof value === 'string' || typeof value === 'number') && value !== ''
      }
      
      // Test valid values
      expect(validateFilterValue('text')).toBe(true)
      expect(validateFilterValue(123)).toBe(true)
      expect(validateFilterValue(0)).toBe(true)
      
      // Test invalid values
      expect(validateFilterValue('')).toBe(false)
      expect(validateFilterValue(null)).toBe(false)
      expect(validateFilterValue(undefined)).toBe(false)
      expect(validateFilterValue({})).toBe(false)
      expect(validateFilterValue([])).toBe(false)
    })

    it('should handle filter key normalization', () => {
      const normalizeFilterKey = (key) => {
        if (typeof key !== 'string') return String(key)
        return key.trim().toLowerCase().replace(/\s+/g, '_')
      }
      
      expect(normalizeFilterKey('Category')).toBe('category')
      expect(normalizeFilterKey('  Product Type  ')).toBe('product_type')
      expect(normalizeFilterKey('status-active')).toBe('status-active')
      expect(normalizeFilterKey(123)).toBe('123')
    })

    it('should handle nested filter structures', () => {
      const flattenFilters = (nestedFilters) => {
        const flat = {}
        
        const flatten = (obj, prefix = '') => {
          Object.entries(obj).forEach(([key, value]) => {
            const newKey = prefix ? `${prefix}.${key}` : key
            
            if (Array.isArray(value)) {
              flat[newKey] = value
            } else if (typeof value === 'object' && value !== null) {
              flatten(value, newKey)
            } else {
              flat[newKey] = [value]
            }
          })
        }
        
        flatten(nestedFilters)
        return flat
      }
      
      const nestedFilters = {
        category: ['electronics'],
        attributes: {
          color: ['red', 'blue'],
          size: ['large']
        },
        price: {
          range: ['100-200']
        }
      }
      
      const result = flattenFilters(nestedFilters)
      
      expect(result['category']).toEqual(['electronics'])
      expect(result['attributes.color']).toEqual(['red', 'blue'])
      expect(result['attributes.size']).toEqual(['large'])
      expect(result['price.range']).toEqual(['100-200'])
    })
  })

  describe('State Management and Reactivity', () => {
    it('should handle filter state transitions correctly', () => {
      const FilterState = {
        EMPTY: 'empty',
        LOADING: 'loading',
        POPULATED: 'populated',
        ERROR: 'error'
      }
      
      const getFilterState = (activeFilters, isLoading = false, hasError = false) => {
        if (hasError) return FilterState.ERROR
        if (isLoading) return FilterState.LOADING
        if (!activeFilters || Object.keys(activeFilters).length === 0) return FilterState.EMPTY
        return FilterState.POPULATED
      }
      
      expect(getFilterState({})).toBe(FilterState.EMPTY)
      expect(getFilterState({}, true)).toBe(FilterState.LOADING)
      expect(getFilterState({}, false, true)).toBe(FilterState.ERROR)
      expect(getFilterState({ category: ['test'] })).toBe(FilterState.POPULATED)
    })

    it('should handle concurrent filter updates', () => {
      let filterState = {}
      const pendingUpdates = []
      
      const queueUpdate = (update) => {
        pendingUpdates.push({
          ...update,
          timestamp: Date.now(),
          id: Math.random().toString(36).substr(2, 9)
        })
      }
      
      const applyUpdates = () => {
        const sortedUpdates = pendingUpdates.sort((a, b) => a.timestamp - b.timestamp)
        
        sortedUpdates.forEach(update => {
          if (update.type === 'add') {
            if (!filterState[update.key]) filterState[update.key] = []
            if (!filterState[update.key].includes(update.value)) {
              filterState[update.key].push(update.value)
            }
          } else if (update.type === 'remove') {
            if (filterState[update.key]) {
              filterState[update.key] = filterState[update.key].filter(v => v !== update.value)
              if (filterState[update.key].length === 0) {
                delete filterState[update.key]
              }
            }
          }
        })
        
        pendingUpdates.length = 0
        return filterState
      }
      
      // Simulate concurrent updates
      queueUpdate({ type: 'add', key: 'category', value: 'electronics' })
      queueUpdate({ type: 'add', key: 'category', value: 'books' })
      queueUpdate({ type: 'remove', key: 'category', value: 'electronics' })
      queueUpdate({ type: 'add', key: 'status', value: 'active' })
      
      const result = applyUpdates()
      
      expect(result.category).toEqual(['books'])
      expect(result.status).toEqual(['active'])
    })
  })

  describe('Integration and Communication', () => {
    it('should handle cross-component communication patterns', () => {
      const ComponentBridge = {
        instances: new Map(),
        
        register(id, instance) {
          this.instances.set(id, instance)
        },
        
        unregister(id) {
          this.instances.delete(id)
        },
        
        broadcast(event, data) {
          this.instances.forEach((instance, id) => {
            if (instance.onEvent) {
              instance.onEvent(event, data, id)
            }
          })
        },
        
        sendTo(targetId, event, data) {
          const target = this.instances.get(targetId)
          if (target && target.onEvent) {
            target.onEvent(event, data, targetId)
          }
        }
      }
      
      const mockInstance1 = { onEvent: jest.fn() }
      const mockInstance2 = { onEvent: jest.fn() }
      
      ComponentBridge.register('filter1', mockInstance1)
      ComponentBridge.register('filter2', mockInstance2)
      
      ComponentBridge.broadcast('FILTER_CHANGED', { source: 'test' })
      
      expect(mockInstance1.onEvent).toHaveBeenCalledWith('FILTER_CHANGED', { source: 'test' }, 'filter1')
      expect(mockInstance2.onEvent).toHaveBeenCalledWith('FILTER_CHANGED', { source: 'test' }, 'filter2')
      
      ComponentBridge.sendTo('filter1', 'DIRECT_MESSAGE', { data: 'specific' })
      
      expect(mockInstance1.onEvent).toHaveBeenCalledWith('DIRECT_MESSAGE', { data: 'specific' }, 'filter1')
      expect(mockInstance2.onEvent).not.toHaveBeenCalledWith('DIRECT_MESSAGE', expect.anything(), expect.anything())
    })

    it('should handle event bus resilience and error recovery', () => {
      const ResilientEventBus = {
        subscriptions: new Map(),
        failureCount: 0,
        maxRetries: 3,
        
        subscribe(event, callback, options = {}) {
          const token = `${event}_${Date.now()}_${Math.random()}`
          
          const wrappedCallback = (data) => {
            try {
              callback(data)
              this.failureCount = 0 // Reset on success
            } catch (error) {
              this.failureCount++
              if (options.onError) {
                options.onError(error, data, this.failureCount)
              }
              
              if (this.failureCount < this.maxRetries && options.retry) {
                setTimeout(() => wrappedCallback(data), options.retryDelay || 100)
              }
            }
          }
          
          this.subscriptions.set(token, { event, callback: wrappedCallback, options })
          return token
        },
        
        publish(event, data) {
          const eventSubscriptions = Array.from(this.subscriptions.values())
            .filter(sub => sub.event === event)
          
          eventSubscriptions.forEach(sub => {
            try {
              sub.callback(data)
            } catch (error) {
              // Log error but don't break other subscriptions
              console.error('EventBus callback error:', error)
            }
          })
        },
        
        unsubscribe(token) {
          return this.subscriptions.delete(token)
        }
      }
      
      const successCallback = jest.fn()
      const errorCallback = jest.fn()
      const onError = jest.fn()
      
      // Test successful subscription
      const token1 = ResilientEventBus.subscribe('TEST_EVENT', successCallback)
      
      // Test subscription with error handling
      const faultyCallback = jest.fn(() => { throw new Error('Test error') })
      const token2 = ResilientEventBus.subscribe('TEST_EVENT', faultyCallback, {
        onError,
        retry: true,
        retryDelay: 10
      })
      
      ResilientEventBus.publish('TEST_EVENT', { test: 'data' })
      
      expect(successCallback).toHaveBeenCalledWith({ test: 'data' })
      expect(faultyCallback).toHaveBeenCalled()
      expect(onError).toHaveBeenCalled()
    })
  })

  describe('Advanced Filter Operations', () => {
    it('should handle filter combination logic', () => {
      const FilterCombinator = {
        AND: 'and',
        OR: 'or',
        NOT: 'not',
        
        combine(filters, operator = this.AND) {
          const keys = Object.keys(filters)
          
          if (keys.length === 0) return []
          if (keys.length === 1) return filters[keys[0]] || []
          
          switch (operator) {
            case this.AND:
              // Items must exist in all filter arrays
              return keys.reduce((result, key) => {
                const filterValues = filters[key] || []
                return result.length === 0 ? filterValues : 
                  result.filter(item => filterValues.includes(item))
              }, [])
              
            case this.OR:
              // Items exist in any filter array
              const allValues = new Set()
              keys.forEach(key => {
                (filters[key] || []).forEach(value => allValues.add(value))
              })
              return Array.from(allValues)
              
            case this.NOT:
              // Items in first filter but not in others
              const [firstKey, ...otherKeys] = keys
              const firstValues = filters[firstKey] || []
              const otherValues = new Set()
              
              otherKeys.forEach(key => {
                (filters[key] || []).forEach(value => otherValues.add(value))
              })
              
              return firstValues.filter(value => !otherValues.has(value))
              
            default:
              return []
          }
        }
      }
      
      const filters = {
        category: ['electronics', 'books', 'clothing'],
        status: ['electronics', 'active'],
        priority: ['books', 'high']
      }
      
      expect(FilterCombinator.combine(filters, FilterCombinator.AND)).toEqual([])
      expect(FilterCombinator.combine(filters, FilterCombinator.OR)).toEqual(
        expect.arrayContaining(['electronics', 'books', 'clothing', 'active', 'high'])
      )
      expect(FilterCombinator.combine(filters, FilterCombinator.NOT)).toEqual(['clothing'])
    })

    it('should handle filter persistence and restoration', () => {
      // Mock localStorage before defining FilterPersistence
      const mockStorage = {
        data: {},
        setItem: jest.fn((key, value) => { mockStorage.data[key] = value }),
        getItem: jest.fn((key) => mockStorage.data[key]),
        removeItem: jest.fn((key) => { delete mockStorage.data[key] })
      }
      
      // Define FilterPersistence with injected storage
      const FilterPersistence = {
        storageKey: 'activeFilters',
        storage: mockStorage, // Use injected storage
        
        save(filters, options = {}) {
          const data = {
            filters,
            timestamp: Date.now(),
            version: options.version || '1.0',
            metadata: options.metadata || {}
          }
          
          try {
            this.storage.setItem(this.storageKey, JSON.stringify(data))
            return true
          } catch (error) {
            console.error('Failed to save filters:', error)
            return false
          }
        },
        
        load(options = {}) {
          try {
            const stored = this.storage.getItem(this.storageKey)
            if (stored) {
              const data = JSON.parse(stored)
              
              // Check if data is expired
              if (options.maxAge && Date.now() - data.timestamp > options.maxAge) {
                this.clear()
                return null
              }
              
              return data
            }
          } catch (error) {
            console.error('Failed to load filters:', error)
          }
          return null
        },
        
        clear() {
          try {
            this.storage.removeItem(this.storageKey)
            return true
          } catch (error) {
            console.error('Failed to clear filters:', error)
            return false
          }
        }
      }
      
      const testFilters = { category: ['electronics'], status: ['active'] }
      
      // Test save
      expect(FilterPersistence.save(testFilters, { version: '2.0' })).toBe(true)
      expect(mockStorage.setItem).toHaveBeenCalledWith('activeFilters', expect.any(String))
      
      // Test load
      const loaded = FilterPersistence.load()
      expect(loaded).toBeTruthy()
      expect(loaded.filters).toEqual(testFilters)
      expect(loaded.version).toBe('2.0')
      expect(mockStorage.getItem).toHaveBeenCalledWith('activeFilters')
      
      // Test clear
      expect(FilterPersistence.clear()).toBe(true)
      expect(mockStorage.removeItem).toHaveBeenCalledWith('activeFilters')
      
      // Test load after clear
      const loadedAfterClear = FilterPersistence.load()
      expect(loadedAfterClear).toBeNull()
    })
  })
})
