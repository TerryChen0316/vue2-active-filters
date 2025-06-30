<template>
  <div 
    v-if="hasActiveFilters" 
    class="filters-section"
    :class="[customClass, customClasses.wrapper]"
    :style="customStyles.wrapper"
  >
    <!-- Filter Count -->
    <div 
      class="filter-count"
      :class="customClasses.filterCount"
      :style="customStyles.filterCount"
    >
      <span 
        class="filter-count-text"
        :class="customClasses.filterCountText"
        :style="customStyles.filterCountText"
      >
        <i class="el-icon-search"></i>
        {{ i18n.t('filterCount', { count: activeFilterCount }) }}
      </span>
      <el-button 
        v-if="hasActiveFilters" 
        type="text" 
        size="mini" 
        @click="handleClearAll" 
        class="clear-all-btn"
        :class="customClasses.clearAllBtn"
        :style="customStyles.clearAllBtn"
      >
        {{ i18n.t('clearAll') }}
      </el-button>
    </div>
    
    <!-- Active Filters -->
    <div 
      v-if="hasActiveFilters" 
      class="active-filters"
      :class="customClasses.activeFilters"
      :style="customStyles.activeFilters"
    >
      <div 
        class="active-filters-tags"
        :class="customClasses.activeFiltersTags"
        :style="customStyles.activeFiltersTags"
      >
        <template v-for="(values, key) in activeFilters">
          <el-tag
            v-for="value in values"
            :key="`${key}-${value}`"
            closable
            size="small"
            class="filter-tag"
            :class="customClasses.filterTag"
            :style="customStyles.filterTag"
            @close="handleRemoveFilter(key, value)"
          >
            {{ getColumnLabel(key) }}: {{ value }}
          </el-tag>
        </template>
      </div>
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
    columns: {
      type: Array,
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
    },
    // Customization props
    customClass: {
      type: String,
      default: ''
    },
    customClasses: {
      type: Object,
      default: () => ({
        wrapper: '',
        filterCount: '',
        filterCountText: '',
        clearAllBtn: '',
        activeFilters: '',
        activeFiltersTags: '',
        filterTag: ''
      })
    },
    customStyles: {
      type: Object,
      default: () => ({
        wrapper: {},
        filterCount: {},
        filterCountText: {},
        clearAllBtn: {},
        activeFilters: {},
        activeFiltersTags: {},
        filterTag: {}
      })
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
      const column = this.columns.find(col => col.prop === columnProp)
      return column ? column.label : columnProp
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
.filters-section {
  margin-bottom: 16px;
}

.filter-count {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px 12px;
  background-color: #f0f9ff;
  border: 1px solid #bae6fd;
  border-radius: 4px;
  margin-bottom: 8px;
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

.active-filters {
  padding: 12px;
  background-color: #f5f7fa;
  border-radius: 4px;
  border: 1px solid #e4e7ed;
}

.active-filters-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.filter-tag {
  margin: 0;
}
</style>