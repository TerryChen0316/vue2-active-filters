// Jest setup file
const Vue = require('vue')

// Make Vue available globally
global.Vue = Vue

// Mock Element UI Message component
const mockMessage = {
  error: jest.fn(),
  success: jest.fn(),
  warning: jest.fn(),
  info: jest.fn()
}

// Mock Vue prototype properties
Vue.prototype.$message = mockMessage

// Mock console methods to reduce noise in tests
global.console = {
  ...console,
  log: jest.fn(),
  error: jest.fn(),
  warn: jest.fn()
}
