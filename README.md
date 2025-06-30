# @terry0316/vue2-active-filters

`Test only`. A customizable Vue 2 dropdown filter component designed for data tables or similar interfaces, supporting both direct options and remote search capabilities. It includes internationalization (i18n) and uses an event bus for inter-component communication.

## Features

* **Dropdown Filter**: A reusable Vue 2 component for filtering data.
* **Filter Count Badge**: Displays the number of active filters.
* **Search Functionality**: Supports searching through options, with debouncing for remote searches.
* **Direct Options**: Can be populated with a predefined list of options.
* **Remote Search**: Integrates with a `remoteSearchFn` prop for fetching options asynchronously based on search input.
* **Select All/Clear All**: Convenient buttons to manage selections.
* **Internationalization (i18n)**: Built-in support for multiple languages with customizable messages.
* **Event-Driven Communication**: Utilizes a PubSub-based event bus for seamless integration with other components (e.g., `ActiveFilters`).

## Installation

```bash
npm install @terry0316/vue2-active-filters
# OR
yarn add @terry0316/vue2-active-filters
````

## Usage

### Registering the Component

```vue
// main.js or a component where you want to use it
import Vue from 'vue'
import ActiveFilters from '@terry0316/vue2-active-filters'

Vue.component('ActiveFilters', ActiveFilters)
```

### Basic Usage

You can use the component with direct options:

```vue
<template>
  <active-filters
    column-prop="status"
    column-label="Status"
    :direct-options="['Active', 'Inactive', 'Pending']"
    :selected-filters="selectedStatus"
    @filter-change="handleFilterChange"
  />
</template>

<script>
import ActiveFilters from '@terry0316/vue2-active-filters';

export default {
  components: {
    ActiveFilters
  },
  data() {
    return {
      selectedStatus: []
    };
  },
  methods: {
    handleFilterChange({ columnProp, values }) {
      console.log(`Filter for ${columnProp} changed to:`, values);
      this.selectedStatus = values;
      // Trigger your data filtering logic here
    }
  }
};
</script>
```

### Usage with Remote Search

For scenarios where options need to be fetched from an API:

```vue
<template>
  <active-filters
    column-prop="userName"
    column-label="User Name"
    :remote-search-fn="searchUsers"
    :selected-filters="selectedUsers"
    @filter-change="handleFilterChange"
  />
</template>

<script>
import ActiveFilters from '@terry0316/vue2-active-filters';

export default {
  components: {
    ActiveFilters
  },
  data() {
    return {
      selectedUsers: []
    };
  },
  methods: {
    async searchUsers(keyword) {
      // Simulate API call
      return new Promise(resolve => {
        setTimeout(() => {
          const allUsers = ['Alice', 'Bob', 'Charlie', 'David', 'Eve'];
          const filteredUsers = allUsers.filter(user =>
            user.toLowerCase().includes(keyword.toLowerCase())
          );
          resolve(filteredUsers);
        }, 500);
      });
    },
    handleFilterChange({ columnProp, values }) {
      console.log(`Filter for ${columnProp} changed to:`, values);
      this.selectedUsers = values;
      // Trigger your data filtering logic here
    }
  }
};
</script>
```

### Internationalization (i18n)

The component uses a simple i18n utility. You can specify the `locale` and provide `customMessages`.

```vue
<template>
  <active-filters
    column-prop="category"
    column-label="Category"
    :direct-options="['Electronics', 'Books', 'Clothing']"
    locale="zh-TW"
    :custom-messages="customFilterMessages"
  />
</template>

<script>
import ActiveFilters from '@terry0316/vue2-active-filters';

export default {
  components: {
    ActiveFilters
  },
  data() {
    return {
      customFilterMessages: {
        apply: '套用篩選',
        // Override other keys if needed
      }
    };
  }
};
</script>
```

**Supported Locales (Built-in):**

  * `en` (English)
  * `zh-TW` (Traditional Chinese)
  * `zh-CN` (Simplified Chinese)
  * `ja` (Japanese)

## Props

| Name              | Type     | Default       | Description                                                                                                                                                                             |
| :---------------- | :------- | :------------ | :-------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `columnProp`      | `String` | `required`    | A unique identifier for the filter column (e.g., `'status'`, `'userId'`). Used for event bus communication and component identification.                                                 |
| `columnLabel`     | `String` | `required`    | The display label for the filter column, used in error messages or for clarity.                                                                                                         |
| `selectedFilters` | `Array`  | `[]`          | An array of currently selected filter values for this column. This prop is used to initialize and reflect the selected state.                                                           |
| `directOptions`   | `Array`  | `[]`          | An array of strings representing the options to be displayed in the dropdown. If provided, `remoteSearchFn` will be ignored.                                                             |
| `remoteSearchFn`  | `Function` | `null`        | A function that takes a `keyword` (string) as an argument and returns a `Promise` that resolves to an array of option strings. Used for fetching options dynamically.                |
| `showFilterCount` | `Boolean` | `true`        | Whether to display the small badge showing the number of selected filters.                                                                                                              |
| `locale`          | `String` | `'en'`        | The locale string for internationalization (e.g., `'en'`, `'zh-TW'`).                                                                                                                   |
| `customMessages`  | `Object` | `{}`          | An object containing custom messages to override or extend the built-in i18n messages for the specified `locale`.                                                                       |

## Events

The component emits a `filter-change` event to its parent for backward compatibility, but primarily communicates changes via a global `EventBus`.

### Component Emitted Events (via `$emit`)

| Event Name      | Payload                                  | Description                                                                                                                                             |
| :-------------- | :--------------------------------------- | :------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `filter-change` | `{ columnProp: string, values: Array }` | Emitted when the "Apply" button is clicked, providing the `columnProp` and the new `selectedValues` for the filter. This is for parent component reactivity. |

### Event Bus Communications (using `EventBus`)

The component publishes and subscribes to various events on the `EventBus` (from `eventBus.js`) to facilitate communication with other parts of your application, such as an `ActiveFilters` component.

#### Published Events

| Event Name          | Payload                                                               | Description                                                                                                                                                                                                                                           |
| :------------------ | :-------------------------------------------------------------------- | :---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `EVENTS.DROPDOWN_OPENED` | `{ columnProp: string, columnLabel: string }`                 | Published when the filter dropdown is opened.                                                                                                                                                                                                   |
| `EVENTS.DROPDOWN_CLOSED` | `{ columnProp: string, columnLabel: string }`                 | Published when the filter dropdown is closed.                                                                                                                                                                                                   |
| `EVENTS.FILTER_CHANGED`  | `{ columnProp: string, selectedValues: Array, source: string }` OR `{ columnProp: string, searchKeyword: string, source: string }` | Published on selection change or search input. Contains `columnProp`, `selectedValues` (if options are changed), `searchKeyword` (if search input is changed), and `source: 'ActiveFilters'`.                                           |
| `EVENTS.FILTER_APPLIED`  | `{ columnProp: string, values: Array, source: string }`       | Published when the "Apply" button is clicked. Contains `columnProp`, the `values` that have been applied, and `source: 'ActiveFilters'`.                                                                                                 |
| `EVENTS.DATA_LOADING`  | `{ columnProp: string, keyword: string }`                     | Published when a remote search is initiated and data loading begins. Contains `columnProp` and the `keyword` being searched.                                                                                                            |
| `EVENTS.DATA_LOADED`   | `{ columnProp: string, keyword: string, optionsCount: number }` | Published when remote search data has been successfully loaded. Contains `columnProp`, the `keyword` used, and the `optionsCount` of results.                                                                                             |

#### Subscribed Events

| Event Name           | Description                                                                                                                                  |
| :------------------- | :------------------------------------------------------------------------------------------------------------------------------------------- |
| `EVENTS.FILTER_REMOVED` | Listens for filter removal events from other components (e.g., an `ActiveFilters` component) to update its internal state when a specific filter value is removed for its `columnProp`. |
| `EVENTS.FILTERS_CLEARED` | Listens for a global clear all filters event from other components to reset its internal selected values and search keyword. |

## Styling

The component uses scoped CSS, but also relies on Element UI's styles. Make sure you have Element UI properly configured in your project.

You can override the default styles by targeting the component's classes:

```css
.filter-dropdown-wrapper {
  /* Your overrides */
}

.filter-count-badge {
  /* Your overrides */
}

/* etc. */
```

## Development

The component is built with Vue 2 and uses `lodash.debounce` for search functionality and `pubsub-js` for the event bus.

### `i18n.js`

This utility provides basic internationalization:

  * `DEFAULT_LOCALE`: 'en'
  * `LOCALES`: An object containing message translations for 'en', 'zh-TW', 'zh-CN', and 'ja'.
  * `I18n` class: Manages the current locale and message translation.
      * `constructor(locale, customMessages)`: Initializes with a locale and optional custom messages.
      * `t(key, params)`: Translates a given key, with optional parameter replacement.
      * `setLocale(locale, customMessages)`: Changes the current locale and updates messages.
      * `addMessages(messages)`: Adds or overrides messages for the current locale.

### `eventBus.js`

This file defines an `EventBus` using `pubsub-js` for decoupled component communication.

  * `EVENTS`: An object listing all defined event types (e.g., `FILTER_CHANGED`, `DROPDOWN_OPENED`).
  * `EventBus` object: Provides `publish`, `subscribe`, `unsubscribe`, `unsubscribeAll`, and `clearAll` methods.
      * Includes `console.log` statements for debugging event flow.

## Contributing

Feel free to open issues or submit pull requests.
