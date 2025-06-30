// Simple i18n utility for component localization
export const DEFAULT_LOCALE = 'en'

export const LOCALES = {
  en: {
    filterCount: '{count} filters applied',
    clearAll: 'Clear All',
  },
  'zh-TW': {
    filterCount: '{count} 個篩選條件',
    clearAll: '清除全部',
  },
  'zh-CN': {
    filterCount: '{count} 个筛选条件',
    clearAll: '清除全部',
  },
  ja: {
    filterCount: '{count} 個のフィルター',
    clearAll: 'すべてクリア',
  }
}

export class I18n {
  constructor(locale = DEFAULT_LOCALE, customMessages = {}) {
    this.locale = locale
    this.messages = {
      ...LOCALES[locale] || LOCALES[DEFAULT_LOCALE],
      ...customMessages
    }
  }
  
  t(key, params = {}) {
    let message = this.messages[key] || key
    
    // Simple parameter replacement
    Object.keys(params).forEach(param => {
      const regex = new RegExp(`\\{${param}\\}`, 'g')
      message = message.replace(regex, params[param])
    })
    
    return message
  }
  
  setLocale(locale, customMessages = {}) {
    this.locale = locale
    this.messages = {
      ...LOCALES[locale] || LOCALES[DEFAULT_LOCALE],
      ...customMessages
    }
  }
  
  addMessages(messages) {
    this.messages = {
      ...this.messages,
      ...messages
    }
  }
}

// Default i18n instance
export const i18n = new I18n()

export default i18n