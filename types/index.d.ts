import Vue from 'vue'

export interface FilterOption {
  value: string | number
  label: string
}

export interface LocaleObject {
  searchPlaceholder?: string
  selectAll?: string
  clearAll?: string
  cancel?: string
  apply?: string
}

export default class ActiveFilters extends Vue {
  key: string
  label: string
  selectedFilters: Array<string | number>
  remoteSearchFn?: (keyword: string) => Promise<FilterOption[]>
  directOptions: FilterOption[]
  locale?: LocaleObject

  selectAllOptions(): void
  clearAllOptions(): void
  filterOptions(keyword: string): void
  handleCancel(): void
  handleApply(): void
}
