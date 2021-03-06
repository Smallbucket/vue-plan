import Vue from 'vue'
import { saveTodo, todoInfo } from '@/api/todo'
import {
  SIDEBAR_TYPE,
  DEFAULT_THEME,
  DEFAULT_LAYOUT_MODE,
  DEFAULT_COLOR,
  DEFAULT_COLOR_WEAK,
  DEFAULT_FIXED_HEADER,
  DEFAULT_FIXED_SIDEMENU,
  DEFAULT_FIXED_HEADER_HIDDEN,
  DEFAULT_CONTENT_WIDTH_TYPE,
  DEFAULT_MULTI_TAB,
	STORAGE_KEY
} from '@/store/mutation-types'

const app = {
  state: {
    sidebar: true,
    device: 'desktop',
    theme: '',
    layout: '',
    contentWidth: '',
    fixedHeader: false,
    fixSiderbar: false,
    autoHideHeader: false,
    color: null,
    weak: false,
    multiTab: true,
		todos: JSON.parse('[]')
  },
	
  mutations: {
    SET_SIDEBAR_TYPE: (state, type) => {
      state.sidebar = type
      Vue.ls.set(SIDEBAR_TYPE, type)
    },
    CLOSE_SIDEBAR: (state) => {
      Vue.ls.set(SIDEBAR_TYPE, true)
      state.sidebar = false
    },
    TOGGLE_DEVICE: (state, device) => {
      state.device = device
    },
    TOGGLE_THEME: (state, theme) => {
      // setStore('_DEFAULT_THEME', theme)
      Vue.ls.set(DEFAULT_THEME, theme)
      state.theme = theme
    },
    TOGGLE_LAYOUT_MODE: (state, layout) => {
      Vue.ls.set(DEFAULT_LAYOUT_MODE, layout)
      state.layout = layout
    },
    TOGGLE_FIXED_HEADER: (state, fixed) => {
      Vue.ls.set(DEFAULT_FIXED_HEADER, fixed)
      state.fixedHeader = fixed
    },
    TOGGLE_FIXED_SIDERBAR: (state, fixed) => {
      Vue.ls.set(DEFAULT_FIXED_SIDEMENU, fixed)
      state.fixSiderbar = fixed
    },
    TOGGLE_FIXED_HEADER_HIDDEN: (state, show) => {
      Vue.ls.set(DEFAULT_FIXED_HEADER_HIDDEN, show)
      state.autoHideHeader = show
    },
    TOGGLE_CONTENT_WIDTH: (state, type) => {
      Vue.ls.set(DEFAULT_CONTENT_WIDTH_TYPE, type)
      state.contentWidth = type
    },
    TOGGLE_COLOR: (state, color) => {
      Vue.ls.set(DEFAULT_COLOR, color)
      state.color = color
    },
    TOGGLE_WEAK: (state, flag) => {
      Vue.ls.set(DEFAULT_COLOR_WEAK, flag)
      state.weak = flag
    },
    TOGGLE_MULTI_TAB: (state, bool) => {
      Vue.ls.set(DEFAULT_MULTI_TAB, bool)
      state.multiTab = bool
    },
		
		addTodo (state, todo) {
			state.todos.push(todo)
		},
	
		removeTodo (state, todo) {
			state.todos.splice(state.todos.indexOf(todo), 1)
		},
		
		removeAllTodos(state) {
			state.todos = []
		},
	
		editTodo (state, {todo, text = todo.text, done = todo.done } ) {
			todo.text = text
			todo.done = done
		},
		
		resetTodo (state, todos) {
			state.todos = todos
		}
  },
	
  actions: {
    setSidebar ({ commit }, type) {
      commit('SET_SIDEBAR_TYPE', type)
    },
    CloseSidebar ({ commit }) {
      commit('CLOSE_SIDEBAR')
    },
    ToggleDevice ({ commit }, device) {
      commit('TOGGLE_DEVICE', device)
    },
    ToggleTheme ({ commit }, theme) {
      commit('TOGGLE_THEME', theme)
    },
    ToggleLayoutMode ({ commit }, mode) {
      commit('TOGGLE_LAYOUT_MODE', mode)
    },
    ToggleFixedHeader ({ commit }, fixedHeader) {
      if (!fixedHeader) {
        commit('TOGGLE_FIXED_HEADER_HIDDEN', false)
      }
      commit('TOGGLE_FIXED_HEADER', fixedHeader)
    },
    ToggleFixSiderbar ({ commit }, fixSiderbar) {
      commit('TOGGLE_FIXED_SIDERBAR', fixSiderbar)
    },
    ToggleFixedHeaderHidden ({ commit }, show) {
      commit('TOGGLE_FIXED_HEADER_HIDDEN', show)
    },
    ToggleContentWidth ({ commit }, type) {
      commit('TOGGLE_CONTENT_WIDTH', type)
    },
    ToggleColor ({ commit }, color) {
      commit('TOGGLE_COLOR', color)
    },
    ToggleWeak ({ commit }, weakFlag) {
      commit('TOGGLE_WEAK', weakFlag)
    },
    ToggleMultiTab ({ commit }, bool) {
      commit('TOGGLE_MULTI_TAB', bool)
    },
		
		SaveTodo ({ commit }, payload) {
			return new Promise((resolve, reject) => {
				saveTodo(payload).then(response => {
					console.log(response)
					if (response.data.status == 200) {
						const result = response.data.result
						// commit('addTodo', {
						// 	index: payload.index,
						// 	text: payload.text,
						// 	done: false
						// })
					}
		      resolve(response)
		    }).catch(error => {
		      reject(error)
		    })
			})
		},
		
		GetTodoInfo ({ commit }, payload) {
			const { user, date } = payload
			return new Promise((resolve, reject) => {
				todoInfo(user, date).then(response => {
					resolve(response)
				}).catch(error => {
					reject(error)
				})
			})
		},
		
		addTodo ({ commit }, payload) {
			commit('addTodo', {
				index: payload.index,
				text: payload.text,
				done: false
			})
		},
	
		removeTodo ({ commit }, todo) {
			console.log(todo)
			commit('removeTodo', todo)
		},
	
		toggleTodo ({ commit }, todo) {
			commit('editTodo', {todo, done: !todo.done })
		},
	
		editTodo ({ commit }, { todo, value }) {
			commit('editTodo', {todo, text: value})
		},
	
		toggleAll ({ state, commit }, done) {
			state.todos.forEach((todo) => {
				commit('editTodo', {todo, done})
			})
		},
	
		clear ({state, commit }) {
			commit('removeAllTodos')
		}
  }
}

export default app