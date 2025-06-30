# ActiveFilters Component

The `ActiveFilters` component is a Vue.js component designed to display and manage a list of currently active filters. It provides a user interface to visualize the applied filters, show a count of active filters, and allow users to remove individual filters or clear all active filters.

## Features

* **Displays Active Filters**: Renders the active filters as interactive tags.
* **Filter Count**: Shows the total number of active filters.
* **Clear All Option**: Provides a button to clear all applied filters.
* **Individual Filter Removal**: Allows users to remove specific filters by clicking on their respective tags.
* **Internationalization (i18n)**: Supports localization for filter count and "Clear All" text.
* **Event-Driven Communication**: Utilizes an `EventBus` for seamless communication with other filter-related components.

## Installation

This component is part of a larger Vue.js application. To use it, ensure you have Vue.js and its dependencies set up in your project.

## Usage

To integrate `ActiveFilters` into your Vue application, import the component and include it in your template.

```vue
<template>
  <ActiveFilters
    :active-filters="myActiveFilters"
    :filter-labels="myFilterLabels"
    :locale="currentLocale"
    :custom-messages="myCustomMessages"
    @remove-filter="handleRemoveFilter"
    @clear-all="handleClearAll"
  />
</template>

<script>
import ActiveFilters from './path/to/ActiveFilters.vue';

export default {
  components: {
    ActiveFilters
  },
  data() {
    return {
      myActiveFilters: {
        category: ['Electronics', 'Books'],
        price: ['> $50'],
      },
      myFilterLabels: {
        category: 'Category',
        price: 'Price Range'
      },
      currentLocale: 'en',
      myCustomMessages: {
        en: {
          filterCount: 'Found {count} filters',
          clearAll: 'Clear All'
        },
        es: {
          filterCount: '{count} filtros encontrados',
          clearAll: 'Borrar todo'
        }
      }
    };
  },
  methods: {
    handleRemoveFilter(filter) {
      console.log('Filter removed from parent:', filter);
      // Logic to update myActiveFilters based on the removed filter
    },
    handleClearAll() {
      console.log('All filters cleared from parent.');
      // Logic to clear all filters in myActiveFilters
    }
  }
};
</script>
````

## Props

| Prop Name        | Type     | Default    | Required | Description                                                               |
| :--------------- | :------- | :--------- | :------- | :------------------------------------------------------------------------ |
| `activeFilters`  | `Object` | `{}`       | `false`  | An object where keys are filter properties and values are arrays of active filter values. |
| `filterLabels`   | `Object` |            | `true`   | An object mapping filter property keys to their display labels (e.g., `{ 'columnProp': 'Display Label' }`). |
| `locale`         | `String` | `DEFAULT_LOCALE` | `false`  | The current locale for internationalization.                             |
| `customMessages` | `Object` | `{}`       | `false`  | Custom messages for i18n, overriding or extending default translations.   |

## Emitted Events

The component emits the following events for backward compatibility, in addition to publishing events via the `EventBus`.

| Event Name      | Payload                                  | Description                                                     |
| :-------------- | :--------------------------------------- | :-------------------------------------------------------------- |
| `remove-filter` | `{ columnProp: String, value: String }` | Emitted when an individual filter tag is closed.               |
| `clear-all`     | `void`                                   | Emitted when the "Clear All" button is clicked.                 |

## EventBus Communication

The `ActiveFilters` component communicates with other parts of the application, particularly `DropdownFilter` components, using a global `EventBus`.

### Subscribed Events

  * `EVENTS.FILTER_CHANGED`: Listens for changes in filter selections from `DropdownFilter` components. (Currently logs the data but can be used to trigger UI updates or validations).
  * `EVENTS.FILTER_APPLIED`: Listens for events indicating that filters have been applied. (Currently logs the data but can be used to trigger animations or notifications).

### Published Events

  * `EVENTS.FILTER_REMOVED`: Published when an individual filter tag is removed. The payload includes `{ columnProp, value, source: 'ActiveFilters' }`.
  * `EVENTS.FILTERS_CLEARED`: Published when the "Clear All" button is clicked. The payload includes `{ source: 'ActiveFilters' }`.

These events allow for a decoupled architecture where filter components can interact without direct prop drilling or complex parent-child relationships for filter state management.

## Styling

The component uses scoped CSS to style its elements. Key classes include:

  * `.filters-section`: The main container for the filter display.
  * `.filter-count`: Container for the filter count text and clear all button.
  * `.filter-count-text`: Styles for the text showing the number of active filters.
  * `.clear-all-btn`: Styles for the "Clear All" button.
  * `.active-filters`: Container for the actual filter tags.
  * `.active-filters-tags`: A flex container for the filter tags.
  * `.filter-tag`: Styles applied to individual `el-tag` components.

The styling uses Element UI's `el-tag` and `el-button` components, so ensure Element UI is properly configured in your project if you are using this component as is.

## Development

### `data()`

  * `subscriptionTokens`: An array to store event bus subscription tokens for cleanup.
  * `i18n`: An instance of the `I18n` class for managing internationalization.

### `computed()`

  * `hasActiveFilters`: Returns `true` if there are any active filters.
  * `activeFilterCount`: Calculates and returns the total number of individual active filter values.

### `watch()`

  * `locale`: Watches for changes in the `locale` prop and updates the `i18n` instance accordingly.
  * `customMessages`: Watches for deep changes in `customMessages` and adds them to the `i18n` instance.

### `methods`

  * `setupEventListeners()`: Subscribes to `EVENTS.FILTER_CHANGED` and `EVENTS.FILTER_APPLIED` from the `EventBus`.
  * `cleanupEventListeners()`: Unsubscribes from all `EventBus` events to prevent memory leaks.
  * `onFilterChanged(data)`: Handles the `FILTER_CHANGED` event.
  * `onFilterApplied(data)`: Handles the `FILTER_APPLIED` event.
  * `getColumnLabel(columnProp)`: Retrieves the display label for a given filter property from `filterLabels` or defaults to the `columnProp` itself.
  * `handleRemoveFilter(columnProp, value)`: Publishes `EVENTS.FILTER_REMOVED` and emits the `remove-filter` event.
  * `handleClearAll()`: Publishes `EVENTS.FILTERS_CLEARED` and emits the `clear-all` event.
  * 