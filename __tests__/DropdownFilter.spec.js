import { shallowMount } from '@vue/test-utils'
import ActiveFilters from '../src/ActiveFilters.vue'

describe('ActiveFilters', () => {
  it('renders label', () => {
    const wrapper = shallowMount(ActiveFilters, {
      propsData: {
        key: 'test',
        label: 'Test Filter',
        selectedFilters: [],
        directOptions: []
      }
    })
    expect(wrapper.text()).toContain('Test Filter')
  })
})
