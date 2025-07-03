<template>
  <div 
    v-if="hasActiveFilters" 
    class="active-filters-section"
  >
    <!-- Filter Count and Clear All Button -->
    <div class="filter-header">
      <span class="filter-count-text">
        <i class="el-icon-search"></i>
        {{ i18n.t('filterCount', { count: activeFilterCount }) }}
      </span>
      <el-button 
        v-if="hasActiveFilters" 
        type="text" 
        size="mini" 
        @click="handleClearAll" 
        class="clear-all-btn"
      >
        {{ i18n.t('clearAll') }}
      </el-button>
    </div>
    
    <!-- Active Filter Tags -->
    <div class="active-filters-tags">
      <template v-for="(values, key) in activeFilters">
        <el-tag
          v-for="value in values"
          :key="`${key}-${value}`"
          closable
          size="small"
          class="filter-tag"
          @close="handleRemoveFilter(key, value)"
        >
          {{ getColumnLabel(key) }}: {{ value }}
        </el-tag>
      </template>
    </div>
  </div>
</template>

<script>
import { EventBus, EVENTS } from '../utils/eventBus.js'
import { I18n, DEFAULT_LOCALE } from '../utils/i18n.js'

export default {
  name: 'ActiveFilters',
  props: {
    activeFilters: {
      type: Object,
      default: () => ({})
    },
    filterLabels: {
      type: Object,
      required: true
    },
    // i18n props
    locale: {
      type: String,
      default: DEFAULT_LOCALE
    },
    customMessages: {
      type: Object,
      default: () => ({})
    }
  },
  
  data() {
    return {
      subscriptionTokens: [],
      i18n: new I18n(this.locale, this.customMessages)
    }
  },
  
  computed: {
    hasActiveFilters() {
      return Object.keys(this.activeFilters).length > 0
    },
    
    activeFilterCount() {
      let count = 0
      Object.values(this.activeFilters).forEach(values => {
        count += values.length
      })
      return count
    }
  },
  
  watch: {
    locale: {
      handler(newLocale) {
        this.i18n.setLocale(newLocale, this.customMessages)
      },
      immediate: false
    },
    customMessages: {
      handler(newMessages) {
        this.i18n.addMessages(newMessages)
      },
      deep: true
    }
  },
  
  created() {
    this.setupEventListeners()
  },
  
  beforeDestroy() {
    this.cleanupEventListeners()
  },
  
  methods: {
    setupEventListeners() {
      // Listen for filter changes from DropdownFilter components
      const filterChangedToken = EventBus.subscribe(EVENTS.FILTER_CHANGED, (data) => {
        this.onFilterChanged(data)
      })
      
      // Listen for filter applied events
      const filterAppliedToken = EventBus.subscribe(EVENTS.FILTER_APPLIED, (data) => {
        this.onFilterApplied(data)
      })
      
      this.subscriptionTokens.push(filterChangedToken, filterAppliedToken)
    },
    
    cleanupEventListeners() {
      this.subscriptionTokens.forEach(token => {
        EventBus.unsubscribe(token)
      })
      this.subscriptionTokens = []
    },
    
    onFilterChanged(data) {
      // Handle filter changes from DropdownFilter
      console.log('[ActiveFilters] Filter changed:', data)
      // This could trigger UI updates or validations
    },
    
    onFilterApplied(data) {
      // Handle when filters are applied
      console.log('[ActiveFilters] Filter applied:', data)
      // This could trigger animations or notifications
    },
    
    getColumnLabel(columnProp) {
      return this.filterLabels?.[columnProp] ? this.filterLabels[columnProp] : columnProp
    },
    
    handleRemoveFilter(columnProp, value) {
      // Publish filter removal event
      EventBus.publish(EVENTS.FILTER_REMOVED, {
        columnProp,
        value,
        source: 'ActiveFilters'
      })
      
      // Still emit to parent for backward compatibility
      this.$emit('remove-filter', { columnProp, value })
    },
    
    handleClearAll() {
      // Publish clear all filters event
      EventBus.publish(EVENTS.FILTERS_CLEARED, {
        source: 'ActiveFilters'
      })
      
      // Still emit to parent for backward compatibility
      this.$emit('clear-all')
    }
  }
}
</script>

<style scoped>
.active-filters-section {
  margin-bottom: 16px;
  padding: 12px 16px;
  background-color: #f0f9ff;
  border: 1px solid #bae6fd;
  border-radius: 6px;
}

.filter-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
}

.filter-count-text {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 14px;
  color: #0369a1;
  font-weight: 500;
}

.filter-count-text i {
  font-size: 16px;
}

.clear-all-btn {
  padding: 0;
  font-size: 12px;
  color: #0369a1;
}

.clear-all-btn:hover {
  color: #0284c7;
}

.active-filters-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.filter-tag {
  margin: 0;
}

/* Responsive design */
@media (max-width: 768px) {
  .filter-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 8px;
  }
  
  .clear-all-btn {
    align-self: flex-end;
  }
}
</style>