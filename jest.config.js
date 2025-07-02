module.exports = {
  testEnvironment: 'jsdom',
  moduleFileExtensions: ['js', 'json', 'vue'],
  transform: {
    '^.+\.vue$': 'vue-jest',
    '^.+\.js$': 'babel-jest'
  },
  testMatch: ['**/__tests__/**/*.spec.[jt]s?(x)'],
  collectCoverageFrom: [
    'src/**/*.{js,vue}',
    '!**/node_modules/**'
  ],
  setupFiles: ['<rootDir>/jest.setup.js']
}
